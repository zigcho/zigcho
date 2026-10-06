const std = @import("std");
const replay = @import("anticheat_replay.zig");
const stable_mods = @import("stable_mods.zig");

// Pinned osu LegacyScoreEncoder writes a complete .osr, not the raw LZMA
// stream received from Stable. Slices borrow the upload and never outlive it.
pub const Payload = struct {
    version: i32,
    ruleset: u8,
    map_md5: []const u8,
    frames: []const u8,
    mods: u32,
    solo: ?[]const u8,
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
    const solo = if (version >= 30_000_001) try cursor.blob() else null;
    if (cursor.offset != bytes.len) return error.InvalidReplay;
    return .{ .version = version, .ruleset = ruleset, .map_md5 = replay_map, .frames = frames, .mods = mods, .solo = solo };
}

pub const SoloClaims = struct {
    statistics: std.json.ObjectMap,
    maximum_statistics: ?std.json.ObjectMap = null,
    mods: ?std.json.Array = null,
    pauses: ?std.json.Array = null,
    rank: ?[]const u8 = null,
    total_score_without_mods: ?i64 = null,
};

// Both the pinned replay encoder and submission request derive these fields
// from the same ScoreInfo. This checks their agreement, not replay judgements.
// Mutable user/online ids, names and version strings are not authentication.
pub fn validateSoloClaims(allocator: std.mem.Allocator, info: Payload, claims: SoloClaims) !void {
    // A new native submission needs its full score claims. Historical files
    // without this trailer remain downloadable, but cannot prove a new upload's
    // agreement. Changing the client-authored version must not bypass binding.
    const compressed = info.solo orelse return error.InvalidReplay;
    const decoded = try replay.decompressLimited(allocator, compressed, 1024 * 1024);
    defer allocator.free(decoded);
    try validateSoloJson(allocator, decoded, claims);
}

fn validateSoloJson(allocator: std.mem.Allocator, decoded: []const u8, claims: ?SoloClaims) !void {
    try boundedJsonDepth(decoded);
    // Bound JSON's allocation amplification as well as its decoded bytes.
    const memory = try allocator.alloc(u8, @min(16 * 1024 * 1024, @max(64 * 1024, decoded.len * 24)));
    defer allocator.free(memory);
    var bounded = std.heap.FixedBufferAllocator.init(memory);
    const parsed = std.json.parseFromSlice(std.json.Value, bounded.allocator(), decoded, .{}) catch return error.InvalidReplay;
    defer parsed.deinit();
    if (parsed.value != .object) return error.InvalidReplay;
    const expected = claims orelse return;
    const object = parsed.value.object;
    const statistics = object.get("statistics") orelse return error.ReplayScoreMismatch;
    if (statistics != .object or !sameStatistics(statistics.object, expected.statistics)) return error.ReplayScoreMismatch;
    if (expected.maximum_statistics) |maximum| {
        const value = object.get("maximum_statistics") orelse return error.ReplayScoreMismatch;
        if (value != .object or !sameStatistics(value.object, maximum)) return error.ReplayScoreMismatch;
    }
    const mods = object.get("mods") orelse return error.ReplayScoreMismatch;
    if (mods != .array or !sameMods(mods.array.items, if (expected.mods) |list| list.items else &.{})) return error.ReplayScoreMismatch;
    if (expected.pauses) |pauses| {
        if (object.get("pauses")) |value| {
            if (!sameJson(value, .{ .array = pauses })) return error.ReplayScoreMismatch;
        }
    }
    if (expected.rank) |rank| {
        if (object.get("rank")) |value| {
            if (value != .null and (value != .string or !std.mem.eql(u8, value.string, rank))) return error.ReplayScoreMismatch;
        }
    }
    if (expected.total_score_without_mods) |expected_total| {
        if (object.get("total_score_without_mods")) |total| {
            // Null is an absent claim: the pinned decoder may reconstruct it.
            if (total != .null and (total != .integer or total.integer != expected_total)) return error.ReplayScoreMismatch;
        }
    }
}

fn boundedJsonDepth(bytes: []const u8) !void {
    if (bytes.len == 0 or bytes.len > 1024 * 1024) return error.InvalidReplay;
    var depth: usize = 0;
    var quoted = false;
    var escaped = false;
    for (bytes) |byte| {
        if (quoted) {
            if (escaped) escaped = false else if (byte == '\\') escaped = true else if (byte == '"') quoted = false;
        } else switch (byte) {
            '"' => quoted = true,
            '{', '[' => {
                depth += 1;
                if (depth > 32) return error.InvalidReplay;
            },
            '}', ']' => {
                if (depth == 0) return error.InvalidReplay;
                depth -= 1;
            },
            else => {},
        }
    }
    if (depth != 0 or quoted) return error.InvalidReplay;
}

fn sameStatistics(left: std.json.ObjectMap, right: std.json.ObjectMap) bool {
    for ([_]struct { a: std.json.ObjectMap, b: std.json.ObjectMap }{ .{ .a = left, .b = right }, .{ .a = right, .b = left } }) |pair| {
        var entries = pair.a.iterator();
        while (entries.next()) |entry| {
            const value = entry.value_ptr.*;
            if (value != .integer or value.integer < 0) return false;
            const other: std.json.Value = pair.b.get(entry.key_ptr.*) orelse .{ .integer = 0 };
            if (other != .integer or other.integer != value.integer) return false;
        }
    }
    return true;
}

fn sameMods(left: []const std.json.Value, right: []const std.json.Value) bool {
    if (left.len != right.len or left.len > 64) return false;
    for (left, 0..) |mod, index| {
        if (mod != .object) return false;
        const acronym = mod.object.get("acronym") orelse return false;
        if (acronym != .string) return false;
        // Reject ambiguous duplicate acronyms, including identical duplicates.
        for (left[0..index]) |previous| {
            const name = previous.object.get("acronym") orelse return false;
            if (sameJson(name, acronym)) return false;
        }
        var matches: usize = 0;
        for (right) |other| {
            if (other != .object) return false;
            const name = other.object.get("acronym") orelse return false;
            if (!sameJson(name, acronym)) continue;
            matches += 1;
            const settings = mod.object.get("settings") orelse .null;
            const other_settings = other.object.get("settings") orelse .null;
            const default = settings == .null or (settings == .object and settings.object.count() == 0);
            const other_default = other_settings == .null or (other_settings == .object and other_settings.object.count() == 0);
            if (!(default and other_default) and !sameJson(settings, other_settings)) return false;
        }
        if (matches != 1) return false;
    }
    return true;
}

fn sameJson(left: std.json.Value, right: std.json.Value) bool {
    if (left == .integer and right == .float) return left.integer >= -(1 << 53) and left.integer <= (1 << 53) and right.float == @as(f64, @floatFromInt(left.integer));
    if (left == .float and right == .integer) return sameJson(right, left);
    if (std.meta.activeTag(left) != std.meta.activeTag(right)) return false;
    return switch (left) {
        .null => true,
        .bool => |v| v == right.bool,
        .integer => |v| v == right.integer,
        .float => |v| std.math.isFinite(v) and v == right.float,
        .string => |v| std.mem.eql(u8, v, right.string),
        .array => |v| blk: {
            if (v.items.len != right.array.items.len) break :blk false;
            for (v.items, right.array.items) |a, b| if (!sameJson(a, b)) break :blk false;
            break :blk true;
        },
        .object => |v| blk: {
            if (v.count() != right.object.count()) break :blk false;
            var entries = v.iterator();
            while (entries.next()) |entry| if (!sameJson(entry.value_ptr.*, right.object.get(entry.key_ptr.*) orelse break :blk false)) break :blk false;
            break :blk true;
        },
        .number_string => false,
    };
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

const solo_fixture =
    \\{"statistics":{"great":10},"maximum_statistics":{"great":10},"mods":[{"acronym":"HD"},{"acronym":"DT","settings":{"speed_change":1.5}}],"rank":"XH","total_score_without_mods":1000000,"pauses":[-1913,2000],"user_id":99,"online_id":-1}
;
const submission_fixture =
    \\{"statistics":{"miss":0,"great":10},"maximum_statistics":{"great":10,"miss":0},"mods":[{"settings":{"speed_change":1.50},"acronym":"DT"},{"acronym":"HD","settings":{}}],"rank":"XH","total_score_without_mods":1000000,"pauses":[-1913,2000]}
;

fn fixtureClaims(value: std.json.Value) SoloClaims {
    const object = value.object;
    return .{
        .statistics = object.get("statistics").?.object,
        .maximum_statistics = object.get("maximum_statistics").?.object,
        .mods = object.get("mods").?.array,
        .pauses = object.get("pauses").?.array,
        .rank = object.get("rank").?.string,
        .total_score_without_mods = object.get("total_score_without_mods").?.integer,
    };
}

test "native solo claims agree despite ordering zero omission and identity metadata" {
    const parsed = try std.json.parseFromSlice(std.json.Value, std.testing.allocator, submission_fixture, .{});
    defer parsed.deinit();
    try validateSoloJson(std.testing.allocator, solo_fixture, fixtureClaims(parsed.value));
    var sparse_room_claims = fixtureClaims(parsed.value);
    sparse_room_claims.maximum_statistics = null;
    sparse_room_claims.pauses = null;
    sparse_room_claims.rank = null;
    try validateSoloJson(std.testing.allocator, solo_fixture, sparse_room_claims);
    // Official native taiko version30000004 lacks these newer fields. They
    // cannot be checked against values reconstructed by a newer decoder.
    try validateSoloJson(std.testing.allocator,
        \\{"mods":[{"acronym":"HD"},{"acronym":"DT","settings":{"speed_change":1.5}}],"statistics":{"great":10},"maximum_statistics":{"great":10}}
    , fixtureClaims(parsed.value));
}

test "native trailer cannot claim different stats maximums rates pauses ranks or totals" {
    const parsed = try std.json.parseFromSlice(std.json.Value, std.testing.allocator, submission_fixture, .{});
    defer parsed.deinit();
    var claims = fixtureClaims(parsed.value);
    try claims.statistics.put(std.testing.allocator, "great", .{ .integer = 11 });
    try std.testing.expectError(error.ReplayScoreMismatch, validateSoloJson(std.testing.allocator, solo_fixture, claims));
    try claims.statistics.put(std.testing.allocator, "great", .{ .integer = 10 });
    try claims.maximum_statistics.?.put(std.testing.allocator, "great", .{ .integer = 11 });
    try std.testing.expectError(error.ReplayScoreMismatch, validateSoloJson(std.testing.allocator, solo_fixture, claims));
    try claims.maximum_statistics.?.put(std.testing.allocator, "great", .{ .integer = 10 });
    try claims.mods.?.items[0].object.getPtr("settings").?.object.put(std.testing.allocator, "speed_change", .{ .float = 1.6 });
    try std.testing.expectError(error.ReplayScoreMismatch, validateSoloJson(std.testing.allocator, solo_fixture, claims));
    try claims.mods.?.items[0].object.getPtr("settings").?.object.put(std.testing.allocator, "speed_change", .{ .float = 1.5 });
    claims.pauses.?.items[0] = .{ .integer = -1912 };
    try std.testing.expectError(error.ReplayScoreMismatch, validateSoloJson(std.testing.allocator, solo_fixture, claims));
    claims.pauses.?.items[0] = .{ .integer = -1913 };
    claims.rank = "X";
    try std.testing.expectError(error.ReplayScoreMismatch, validateSoloJson(std.testing.allocator, solo_fixture, claims));
    claims.rank = "XH";
    claims.total_score_without_mods = claims.total_score_without_mods.? + 1;
    try std.testing.expectError(error.ReplayScoreMismatch, validateSoloJson(std.testing.allocator, solo_fixture, claims));
}

test "native solo JSON rejects corrupt deep duplicate and nonobject input" {
    for ([_][]const u8{ "", "[]", "null", "{broken}", "{\"mods\":[],\"mods\":[]}" }) |text| {
        try std.testing.expectError(error.InvalidReplay, validateSoloJson(std.testing.allocator, text, null));
    }
    var deep: [66]u8 = undefined;
    @memset(deep[0..33], '[');
    @memset(deep[33..], ']');
    try std.testing.expectError(error.InvalidReplay, boundedJsonDepth(&deep));
    try boundedJsonDepth("{\"text\":\"[\\\"{\"}");
    const too_big = try std.testing.allocator.alloc(u8, 1024 * 1024 + 1);
    defer std.testing.allocator.free(too_big);
    @memset(too_big, ' ');
    try std.testing.expectError(error.InvalidReplay, boundedJsonDepth(too_big));
}

test "native compressed trailer is decoded with its own output budget" {
    const empty_object = "\x5d\x00\x00\x80\x00\xff\xff\xff\xff\xff\xff\xff\xff\x00\x3d\x9f\x5c\xff\xff\xff\xff\xf0\x00\x00\x00";
    var info: Payload = .{ .version = 30_000_001, .ruleset = 0, .map_md5 = "", .frames = "", .mods = 0, .solo = empty_object };
    try std.testing.expectError(error.ReplayScoreMismatch, validateSoloClaims(std.testing.allocator, info, .{ .statistics = .{} }));
    info.version = 30_000_020;
    try std.testing.expectError(error.ReplayScoreMismatch, validateSoloClaims(std.testing.allocator, info, .{ .statistics = .{} }));
    info.solo = null;
    try std.testing.expectError(error.InvalidReplay, validateSoloClaims(std.testing.allocator, info, .{ .statistics = .{} }));
    info.solo = "corrupt lzma";
    try std.testing.expectError(error.InvalidReplay, validateSoloClaims(std.testing.allocator, info, .{ .statistics = .{} }));
    const decoded = replay.decompressLimited(std.testing.allocator, empty_object, 1);
    try std.testing.expectError(error.InvalidReplay, decoded);
}

test "native default mods and sparse zeros are equivalent but duplicate mods are not" {
    try std.testing.expect(sameJson(.{ .integer = 1 }, .{ .float = 1.0 }));
    try std.testing.expect(!sameJson(.{ .integer = 1 }, .{ .float = 1.01 }));
    const a = try std.json.parseFromSlice(std.json.Value, std.testing.allocator, "[{\"acronym\":\"HD\"}]", .{});
    defer a.deinit();
    const b = try std.json.parseFromSlice(std.json.Value, std.testing.allocator, "[{\"acronym\":\"HD\",\"settings\":null}]", .{});
    defer b.deinit();
    try std.testing.expect(sameMods(a.value.array.items, b.value.array.items));
    const duplicates = try std.json.parseFromSlice(std.json.Value, std.testing.allocator, "[{\"acronym\":\"HD\"},{\"acronym\":\"HD\"}]", .{});
    defer duplicates.deinit();
    try std.testing.expect(!sameMods(duplicates.value.array.items, duplicates.value.array.items));
}

test "native verifier propagates allocator exhaustion instead of accepting unchecked" {
    var failing = std.testing.FailingAllocator.init(std.testing.allocator, .{ .fail_index = 0 });
    try std.testing.expectError(error.OutOfMemory, validateSoloJson(failing.allocator(), solo_fixture, null));
}
