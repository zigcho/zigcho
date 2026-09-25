const std = @import("std");
const replay_decoder = @import("anticheat_replay.zig");

const max_replay_bytes = 16 * 1024 * 1024;
const max_map_bytes = 32 * 1024 * 1024;
const max_frames = 120_000;
const max_objects = 50_000;
const max_time_ms: i64 = 24 * 60 * 60 * 1000;

pub const Header = struct {
    mode: u8,
    md5: []const u8,
    mods: i32,
    compressed_frames: []const u8,
};

const Reader = struct {
    bytes: []const u8,
    pos: usize = 0,

    fn take(self: *Reader, count: usize) ![]const u8 {
        if (count > self.bytes.len - self.pos) return error.InvalidReplay;
        const value = self.bytes[self.pos..][0..count];
        self.pos += count;
        return value;
    }

    fn integer(self: *Reader, comptime T: type) !T {
        const bytes = try self.take(@sizeOf(T));
        return std.mem.readInt(T, bytes[0..@sizeOf(T)], .little);
    }

    fn string(self: *Reader) ![]const u8 {
        const marker = (try self.take(1))[0];
        if (marker == 0) return "";
        if (marker != 0x0b) return error.InvalidReplay;
        var length: usize = 0;
        for (0..5) |part| {
            const byte = (try self.take(1))[0];
            length |= @as(usize, byte & 0x7f) << @intCast(part * 7);
            if (byte & 0x80 == 0) {
                if (length > 4096) return error.InvalidReplay;
                return self.take(length);
            }
        }
        return error.InvalidReplay;
    }
};

pub fn parseHeader(bytes: []const u8) !Header {
    if (bytes.len < 32 or bytes.len > max_replay_bytes) return error.InvalidReplay;
    var reader = Reader{ .bytes = bytes };
    const mode = try reader.integer(u8);
    const version = try reader.integer(i32);
    if (mode > 3 or version < 20_100_101) return error.InvalidReplay;
    const md5 = try reader.string();
    if (md5.len != 32) return error.InvalidReplay;
    for (md5) |char| if (!std.ascii.isHex(char)) return error.InvalidReplay;
    _ = try reader.string();
    _ = try reader.string();
    for (0..6) |_| _ = try reader.integer(i16);
    _ = try reader.integer(i32);
    _ = try reader.integer(i16);
    _ = try reader.integer(u8);
    const mods = try reader.integer(i32);
    _ = try reader.string();
    _ = try reader.integer(i64);
    const frame_length = try reader.integer(i32);
    if (frame_length < 1 or frame_length > max_replay_bytes) return error.InvalidReplay;
    return .{ .mode = mode, .md5 = md5, .mods = mods, .compressed_frames = try reader.take(@intCast(frame_length)) };
}

const Frame = struct { time: i64, x: f32, y: f32, keys: u32 };
const Object = struct { time: i64, x: f32, y: f32, kind: u8 };

fn framesFromText(allocator: std.mem.Allocator, decoded: []const u8, mode: u8) ![]Frame {
    var frames: std.ArrayList(Frame) = .empty;
    errdefer frames.deinit(allocator);
    var elapsed: i64 = 0;
    var seen_end = false;
    var records = std.mem.splitScalar(u8, decoded, ',');
    while (records.next()) |record| {
        if (record.len == 0) continue;
        if (seen_end) return error.InvalidReplay;
        var fields = std.mem.splitScalar(u8, record, '|');
        const delta_text = fields.next() orelse return error.InvalidReplay;
        const x_text = fields.next() orelse return error.InvalidReplay;
        const y_text = fields.next() orelse return error.InvalidReplay;
        const keys = std.fmt.parseInt(u32, fields.next() orelse return error.InvalidReplay, 10) catch return error.InvalidReplay;
        if (fields.next() != null) return error.InvalidReplay;
        if (std.mem.eql(u8, delta_text, "-12345")) {
            if (!std.mem.eql(u8, x_text, "0") or !std.mem.eql(u8, y_text, "0")) return error.InvalidReplay;
            seen_end = true;
            continue;
        }
        const delta = replay_decoder.parseReplayDelta(delta_text) catch return error.InvalidReplay;
        elapsed = std.math.add(i64, elapsed, delta) catch return error.InvalidReplay;
        if (elapsed < -60_000 or elapsed > max_time_ms) return error.InvalidReplay;
        const x = std.fmt.parseFloat(f32, x_text) catch return error.InvalidReplay;
        const y = std.fmt.parseFloat(f32, y_text) catch return error.InvalidReplay;
        const coordinate_limit: f32 = if (mode == 3) 1_048_575 else 131_072;
        if (!std.math.isFinite(x) or !std.math.isFinite(y) or @abs(x) > coordinate_limit or @abs(y) > 131_072 or keys & ~@as(u32, 31) != 0) return error.InvalidReplay;
        if (frames.items.len < 2 and x == 256 and y == -500) continue;
        const previous = if (frames.items.len == 0) null else frames.items[frames.items.len - 1];
        if (previous == null or elapsed < previous.?.time or elapsed - previous.?.time >= 16 or previous.?.keys != keys) {
            if (frames.items.len >= max_frames) return error.ReplayTooLong;
            try frames.append(allocator, .{ .time = elapsed, .x = x, .y = y, .keys = keys });
        }
    }
    if (!seen_end or frames.items.len < 2) return error.InvalidReplay;
    if (frames.items[1].time < frames.items[0].time) {
        frames.items[1].time = frames.items[0].time;
        frames.items[0].time = 0;
    }
    var kept: usize = 0;
    for (frames.items) |frame| {
        if (kept != 0 and frame.time < frames.items[kept - 1].time) continue;
        frames.items[kept] = frame;
        kept += 1;
    }
    frames.items.len = kept;
    if (kept < 2) return error.InvalidReplay;
    return frames.toOwnedSlice(allocator);
}

const Map = struct { objects: []Object, circle_size: f32 };

fn mapObjects(allocator: std.mem.Allocator, file: []const u8) !Map {
    if (file.len == 0 or file.len > max_map_bytes or !std.mem.startsWith(u8, file, "osu file format v")) return error.InvalidBeatmap;
    var objects: std.ArrayList(Object) = .empty;
    errdefer objects.deinit(allocator);
    var in_objects = false;
    var in_difficulty = false;
    var circle_size: f32 = 5;
    var lines = std.mem.splitScalar(u8, file, '\n');
    while (lines.next()) |raw| {
        const line = std.mem.trim(u8, raw, " \t\r");
        if (line.len == 0 or std.mem.startsWith(u8, line, "//")) continue;
        if (line[0] == '[' and line[line.len - 1] == ']') {
            in_objects = std.mem.eql(u8, line, "[HitObjects]");
            in_difficulty = std.mem.eql(u8, line, "[Difficulty]");
            continue;
        }
        if (in_difficulty and std.mem.startsWith(u8, line, "CircleSize:")) {
            circle_size = std.fmt.parseFloat(f32, std.mem.trim(u8, line["CircleSize:".len..], " \t")) catch return error.InvalidBeatmap;
            if (!std.math.isFinite(circle_size) or circle_size < 0 or circle_size > 18) return error.InvalidBeatmap;
        }
        if (!in_objects) continue;
        var fields = std.mem.splitScalar(u8, line, ',');
        const x = std.fmt.parseFloat(f32, fields.next() orelse return error.InvalidBeatmap) catch return error.InvalidBeatmap;
        const y = std.fmt.parseFloat(f32, fields.next() orelse return error.InvalidBeatmap) catch return error.InvalidBeatmap;
        const time = std.fmt.parseInt(i64, fields.next() orelse return error.InvalidBeatmap, 10) catch return error.InvalidBeatmap;
        const raw_kind = std.fmt.parseInt(u32, fields.next() orelse return error.InvalidBeatmap, 10) catch return error.InvalidBeatmap;
        if (!std.math.isFinite(x) or !std.math.isFinite(y) or x < 0 or x > 512 or y < 0 or y > 384 or time < 0 or time > max_time_ms) return error.InvalidBeatmap;
        const kind: u8 = if (raw_kind & 8 != 0) 8 else if (raw_kind & 2 != 0) 2 else if (raw_kind & 1 != 0) 1 else continue;
        if (objects.items.len >= max_objects) return error.BeatmapTooLong;
        try objects.append(allocator, .{ .time = time, .x = x, .y = y, .kind = kind });
    }
    if (objects.items.len == 0) return error.InvalidBeatmap;
    std.mem.sort(Object, objects.items, {}, struct {
        fn lessThan(_: void, left: Object, right: Object) bool {
            return left.time < right.time;
        }
    }.lessThan);
    return .{ .objects = try objects.toOwnedSlice(allocator), .circle_size = circle_size };
}

pub fn render(allocator: std.mem.Allocator, header: Header, map_file: []const u8) ![]u8 {
    const decoded = try replay_decoder.decompress(allocator, header.compressed_frames);
    defer allocator.free(decoded);
    const frames = try framesFromText(allocator, decoded, header.mode);
    defer allocator.free(frames);
    const map = try mapObjects(allocator, map_file);
    defer allocator.free(map.objects);

    var output: std.Io.Writer.Allocating = .init(allocator);
    errdefer output.deinit();
    const mods: u32 = @bitCast(header.mods);
    const circle_size = if (header.mode == 0 and mods & (1 << 4) != 0) @min(10, map.circle_size * 1.3) else if (header.mode == 0 and mods & (1 << 1) != 0) map.circle_size * 0.5 else map.circle_size;
    try output.writer.print("{{\"mode\":{d},\"mods\":{d},\"circle_size\":{d:.2},\"duration\":{d},\"frames\":[", .{ header.mode, header.mods, circle_size, @max(0, frames[frames.len - 1].time) });
    for (frames, 0..) |frame, index| {
        if (index != 0) try output.writer.writeByte(',');
        try output.writer.print("[{d},{d:.2},{d:.2},{d}]", .{ frame.time, frame.x, frame.y, frame.keys });
    }
    try output.writer.writeAll("],\"objects\":[");
    for (map.objects, 0..) |object, index| {
        if (index != 0) try output.writer.writeByte(',');
        const y = if (header.mode == 0 and mods & (1 << 4) != 0) 384 - object.y else object.y;
        try output.writer.print("[{d},{d:.2},{d:.2},{d}]", .{ object.time, object.x, y, object.kind });
    }
    try output.writer.writeAll("]}");
    var list = output.toArrayList();
    return list.toOwnedSlice(allocator);
}

test "replay preview reads the same complete score file used for download" {
    const site_replay = @import("site_replay.zig");
    const file = try site_replay.build(std.testing.allocator, .{
        .score_id = 42,
        .username = "ari",
        .map_md5 = "0123456789abcdef0123456789abcdef",
        .mode = 0,
        .n300 = 1,
        .n100 = 0,
        .n50 = 0,
        .ngeki = 0,
        .nkatu = 0,
        .nmiss = 0,
        .score = 300,
        .max_combo = 1,
        .perfect = true,
        .mods = 0,
        .submitted_at = 1_700_000_000,
    }, "replay frames");
    defer std.testing.allocator.free(file);
    const header = try parseHeader(file);
    try std.testing.expectEqualStrings("0123456789abcdef0123456789abcdef", header.md5);
    try std.testing.expectEqualStrings("replay frames", header.compressed_frames);
}

test "preview keeps presses while sampling and rejects missing end marker" {
    const text = "0|256|192|0,8|257|192|1,8|258|192|1,8|259|192|0,-12345|0|0|0";
    const frames = try framesFromText(std.testing.allocator, text, 0);
    defer std.testing.allocator.free(frames);
    try std.testing.expectEqual(@as(usize, 3), frames.len);
    try std.testing.expectError(error.InvalidReplay, framesFromText(std.testing.allocator, "0|256|192|0,8|257|192|1", 0));
}

test "preview accepts historical fractional deltas and removes prelude frames" {
    const text = "0|256|-500|0,0|256|192|0,1.5|257|192|1,17|258|192|0,-12345|0|0|0";
    const frames = try framesFromText(std.testing.allocator, text, 0);
    defer std.testing.allocator.free(frames);
    try std.testing.expectEqual(@as(usize, 3), frames.len);
    try std.testing.expectEqual(@as(i64, 2), frames[1].time);
}

test "stable and lazer score files produce browser replay frames" {
    const compressed = [_]u8{
        0x5d, 0x00, 0x00, 0x80, 0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
        0xff, 0x00, 0x18, 0x1f, 0x02, 0x43, 0x51, 0x03, 0xb4, 0x0e, 0x86, 0xc3,
        0xc9, 0x39, 0xf9, 0x20, 0x95, 0xd9, 0xda, 0x1c, 0xcb, 0x83, 0x5a, 0x58,
        0x94, 0xad, 0x97, 0xfd, 0x29, 0xcb, 0xc9, 0x26, 0x32, 0x88, 0x42, 0x3c,
        0x97, 0x0b, 0x5f, 0xff, 0xbb, 0x80, 0x80, 0x00,
    };
    const file = try @import("site_replay.zig").build(std.testing.allocator, .{
        .score_id = 42,
        .username = "ari",
        .map_md5 = "0123456789abcdef0123456789abcdef",
        .mode = 0,
        .n300 = 2,
        .n100 = 0,
        .n50 = 0,
        .ngeki = 0,
        .nkatu = 0,
        .nmiss = 0,
        .score = 600,
        .max_combo = 2,
        .perfect = true,
        .mods = 0,
        .submitted_at = 1_700_000_000,
    }, &compressed);
    defer std.testing.allocator.free(file);
    const header = try parseHeader(file);
    const json = try render(std.testing.allocator, header, @embedFile("testdata/synthetic-standard.osu"));
    defer std.testing.allocator.free(json);
    var parsed = try std.json.parseFromSlice(std.json.Value, std.testing.allocator, json, .{});
    defer parsed.deinit();
    try std.testing.expect(std.mem.indexOf(u8, json, "\"frames\":[[0,") != null);
    try std.testing.expect(std.mem.indexOf(u8, json, "\"objects\":[[") != null);
    try std.testing.expect(std.mem.indexOf(u8, json, "\"duration\":32") != null);
    var hard_rock = header;
    hard_rock.mods = 16;
    const hard_rock_json = try render(std.testing.allocator, hard_rock, @embedFile("testdata/synthetic-standard.osu"));
    defer std.testing.allocator.free(hard_rock_json);
    try std.testing.expect(std.mem.indexOf(u8, hard_rock_json, "[1000,64.00,320.00,1]") != null);
    const lazer_file = try std.testing.allocator.dupe(u8, file);
    defer std.testing.allocator.free(lazer_file);
    std.mem.writeInt(i32, lazer_file[1..5], 20_260_921, .little);
    const lazer_header = try parseHeader(lazer_file);
    try std.testing.expectEqualSlices(u8, header.compressed_frames, lazer_header.compressed_frames);
}

test "preview reads beatmap objects for all four rulesets" {
    const maps = [_][]const u8{
        @embedFile("testdata/synthetic-standard.osu"),
        @embedFile("testdata/synthetic-taiko.osu"),
        @embedFile("testdata/synthetic-catch.osu"),
        @embedFile("testdata/synthetic-mania.osu"),
    };
    for (maps) |file| {
        const result = try mapObjects(std.testing.allocator, file);
        defer std.testing.allocator.free(result.objects);
        try std.testing.expect(result.objects.len > 0);
    }
}
