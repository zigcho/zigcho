const std = @import("std");
const replay = @import("anticheat_replay.zig");
const stable_mods = @import("stable_mods.zig");

// Pinned osu LegacyScoreEncoder writes a complete .osr, not the raw LZMA
// stream received from Stable. Slices borrow the upload and never outlive it.
pub const Payload = struct {
    ruleset: u8,
    map_md5: []const u8,
    frames: []const u8,
    mods: u32,
};

const Cursor = struct {
    bytes: []const u8,
    offset: usize = 0,

    fn take(self: *Cursor, count: usize) ![]const u8 {
        if (count > self.bytes.len - self.offset) return error.InvalidReplay;
        const result = self.bytes[self.offset..][0..count];
        self.offset += count;
        return result;
    }

    fn int(self: *Cursor, comptime T: type) !T {
        return std.mem.readInt(T, (try self.take(@sizeOf(T)))[0..@sizeOf(T)], .little);
    }

    fn string(self: *Cursor, limit: usize) ![]const u8 {
        const marker = try self.int(u8);
        if (marker == 0) return "";
        if (marker != 0x0b) return error.InvalidReplay;
        var length: usize = 0;
        for (0..5) |index| {
            const part = try self.int(u8);
            length |= @as(usize, part & 127) << @intCast(index * 7);
            if (part & 128 == 0) {
                if (length > limit) return error.InvalidReplay;
                const result = try self.take(length);
                if (!std.unicode.utf8ValidateSlice(result)) return error.InvalidReplay;
                return result;
            }
        }
        return error.InvalidReplay;
    }

    fn blob(self: *Cursor) ![]const u8 {
        const length = try self.int(i32);
        if (length <= 0 or length > 16 * 1024 * 1024) return error.InvalidReplay;
        return self.take(@intCast(length));
    }
};

pub fn payload(bytes: []const u8, ruleset: u8, map_md5: []const u8) !Payload {
    if (bytes.len < 32 or bytes.len > 16 * 1024 * 1024 or ruleset > 3) return error.InvalidReplay;
    var cursor: Cursor = .{ .bytes = bytes };
    if (try cursor.int(u8) != ruleset) return error.ReplayIdentityMismatch;
    const version = try cursor.int(i32);
    if (version < 30_000_000) return error.InvalidReplay;
    const replay_map = try cursor.string(32);
    if (replay_map.len != 32 or !std.ascii.eqlIgnoreCase(replay_map, map_md5)) return error.ReplayIdentityMismatch;
    _ = try cursor.string(256); // mutable display name is not account identity
    _ = try cursor.string(64); // legacy checksum is not authenticated evidence
    _ = try cursor.take(6 * 2 + 4 + 2 + 1); // counts, score, combo, perfect
    const mods = try cursor.int(u32);
    _ = try cursor.string(64 * 1024); // life graph
    _ = try cursor.int(i64);
    const frames = try cursor.blob();
    _ = try cursor.int(i64); // local legacy online id is not server identity
    if (version >= 30_000_001) _ = try cursor.blob(); // compressed solo score info
    if (cursor.offset != bytes.len) return error.InvalidReplay;
    return .{ .ruleset = ruleset, .map_md5 = replay_map, .frames = frames, .mods = mods };
}

// ABI v1 cannot describe DA, automatic input, transforms, variable rates or
// arbitrary mod settings. Never interpret these as hidden Relax or timewarp.
pub fn compatibleMods(mods_json: []const u8) bool {
    const parsed = std.json.parseFromSlice(std.json.Value, std.heap.page_allocator, mods_json, .{}) catch return false;
    defer parsed.deinit();
    if (parsed.value != .array) return false;
    for (parsed.value.array.items) |value| {
        if (value != .object) return false;
        const acronym = value.object.get("acronym") orelse return false;
        if (acronym != .string) return false;
        if (value.object.get("settings")) |settings| {
            if (settings != .null and (settings != .object or settings.object.count() != 0)) return false;
        }
        if (std.mem.eql(u8, acronym.string, "CL")) continue;
        if (stable_mods.parseCompact(acronym.string) == null) return false;
        if (std.mem.eql(u8, acronym.string, "AT") or std.mem.eql(u8, acronym.string, "CN") or std.mem.eql(u8, acronym.string, "TP")) return false;
    }
    return true;
}

pub fn legacyMods(mods_json: []const u8) !u32 {
    const parsed = try std.json.parseFromSlice(std.json.Value, std.heap.page_allocator, mods_json, .{});
    defer parsed.deinit();
    if (parsed.value != .array) return error.InvalidMods;
    var bits: u32 = 0;
    for (parsed.value.array.items) |value| {
        if (value != .object) return error.InvalidMods;
        const acronym = value.object.get("acronym") orelse return error.InvalidMods;
        if (acronym != .string) return error.InvalidMods;
        if (std.mem.eql(u8, acronym.string, "CL")) continue;
        const mask = stable_mods.parseCompact(acronym.string) orelse return error.InvalidMods;
        bits |= @intCast(mask);
    }
    return bits;
}

pub fn prepare(allocator: std.mem.Allocator, bytes: []const u8, map: []const u8, map_md5: []const u8) !replay.Prepared {
    const info = try payload(bytes, 0, map_md5);
    return replay.prepare(allocator, info.frames, map, info.mods);
}

test "lazer full replay framing is bounded and tied to the resolved map" {
    const site = @import("site_replay.zig");
    const hash = "0123456789abcdef0123456789abcdef";
    const bytes = try site.build(std.testing.allocator, .{ .score_id = 1, .username = "player", .map_md5 = hash, .mode = 0, .n300 = 1, .n100 = 0, .n50 = 0, .ngeki = 0, .nkatu = 0, .nmiss = 0, .score = 1000, .max_combo = 1, .perfect = true, .mods = 0, .submitted_at = 1 }, "compressed frames");
    defer std.testing.allocator.free(bytes);
    std.mem.writeInt(i32, bytes[1..5], 30_000_000, .little);
    const info = try payload(bytes, 0, hash);
    try std.testing.expectEqualStrings("compressed frames", info.frames);
    try std.testing.expectError(error.ReplayIdentityMismatch, payload(bytes, 1, hash));
    try std.testing.expectError(error.ReplayIdentityMismatch, payload(bytes, 0, "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"));
    for (0..bytes.len) |length| try std.testing.expectError(error.InvalidReplay, payload(bytes[0..length], 0, hash));
}

test "lazer unsupported mod settings do not enter behavioural rules" {
    try std.testing.expect(compatibleMods("[]"));
    try std.testing.expect(compatibleMods("[{\"acronym\":\"RX\"},{\"acronym\":\"DT\"}]"));
    try std.testing.expect(!compatibleMods("[{\"acronym\":\"DT\",\"settings\":{\"speed_change\":1.2}}]"));
    try std.testing.expect(!compatibleMods("[{\"acronym\":\"DA\"}]"));
    try std.testing.expect(!compatibleMods("[{\"acronym\":\"AT\"}]"));
}
