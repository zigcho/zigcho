const std = @import("std");
const abi = @import("anticheat_abi.zig");
const beatmap = @import("beatmap.zig");
const stable_mods = @import("stable_mods.zig");

pub const Prepared = struct { mods: u32, context: abi.GameplayContextV1 };

fn number(value: std.json.Value) !f64 {
    const result: f64 = switch (value) {
        .integer => |v| @floatFromInt(v),
        .float => |v| v,
        else => return error.UnsupportedNativeContext,
    };
    if (!std.math.isFinite(result)) return error.UnsupportedNativeContext;
    return result;
}

fn boolean(value: std.json.Value) !bool {
    return if (value == .bool) value.bool else error.UnsupportedNativeContext;
}

fn range(od: f64, low: f64, mid: f64, high: f64) f64 {
    if (od > 5) return mid + (high - mid) * ((od - 5) / 5);
    if (od < 5) return mid + (mid - low) * ((od - 5) / 5);
    return mid;
}

pub fn setWindows(context: *abi.GameplayContextV1) void {
    context.great_window_ms = @floor(range(context.overall_difficulty, 80, 50, 20)) - 0.5;
    context.good_window_ms = @floor(range(context.overall_difficulty, 140, 100, 60)) - 0.5;
    context.meh_window_ms = @floor(range(context.overall_difficulty, 200, 150, 100)) - 0.5;
    context.miss_window_ms = 400;
}

pub fn valid(context: abi.GameplayContextV1, event: abi.GameplayEventV1) bool {
    const supported: u64 = (1 << 0) | (1 << 1) | (1 << 2) | (1 << 3) | (1 << 4) | (1 << 5) |
        (1 << 6) | (1 << 7) | (1 << 8) | (1 << 9) | (1 << 10) | (1 << 12) | (1 << 13) | (1 << 14) | (1 << 29);
    if (context.context_version != 1 or context.struct_size != @sizeOf(abi.GameplayContextV1) or
        context.timestamp_basis != 1 or context.geometry_basis != 0 or event.mods & ~supported != 0 or
        event.base.client_family != abi.ClientFamily.lazer or event.base.ruleset != 0 or
        context.classic_present > 1 or context.classic_flags & ~abi.ClassicFlag.known_mask != 0 or
        (context.classic_present == 0 and context.classic_flags != 0) or !std.math.isFinite(context.clock_rate) or
        context.clock_rate < 0.5 or context.clock_rate > 2) return false;
    const difficulty = [_]f32{ context.circle_size, context.approach_rate, context.overall_difficulty, context.drain_rate };
    for (difficulty, 0..) |value, i| if (!std.math.isFinite(value) or value < (if (i == 1) @as(f32, -10) else 0) or value > 11) return false;
    for (context.reserved) |word| if (word != 0) return false;
    if (event.mods & (1 << 1) != 0 and event.mods & (1 << 4) != 0) return false;
    if (event.mods & (1 << 7) != 0 and event.mods & (1 << 13) != 0) return false;
    var expected: abi.GameplayContextV1 = .{ .overall_difficulty = context.overall_difficulty };
    setWindows(&expected);
    if (context.great_window_ms != expected.great_window_ms or context.good_window_ms != expected.good_window_ms or
        context.meh_window_ms != expected.meh_window_ms or context.miss_window_ms != 400 or
        event.hit_window_ms != @as(u32, @intFromFloat(@ceil(expected.meh_window_ms)))) return false;
    const fast = event.mods & ((@as(u64, 1) << 6) | (@as(u64, 1) << 9)) != 0;
    const slow = event.mods & (@as(u64, 1) << 8) != 0;
    if (fast and slow) return false;
    if (fast) {
        if (context.clock_rate < 1.01) return false;
    } else if (slow) {
        if (context.clock_rate > 0.99) return false;
    } else if (context.clock_rate != 1) return false;
    return @abs(context.clock_rate * 100 - @round(context.clock_rate * 100)) <= 0.000001;
}

fn mapDifficulty(map: []const u8) !abi.GameplayContextV1 {
    if (map.len == 0 or map.len > 32 * 1024 * 1024) return error.UnsupportedNativeContext;
    const content = beatmap.withoutUtf8Bom(map);
    if (!std.mem.startsWith(u8, content, "osu file format v")) return error.UnsupportedNativeContext;
    var context: abi.GameplayContextV1 = .{};
    var ar: ?f32 = null;
    var in_difficulty = false;
    var lines = std.mem.splitScalar(u8, content, '\n');
    while (lines.next()) |raw| {
        const line = std.mem.trim(u8, raw, " \t\r");
        if (line.len == 0 or std.mem.startsWith(u8, line, "//")) continue;
        if (line[0] == '[') {
            in_difficulty = std.mem.eql(u8, line, "[Difficulty]");
            continue;
        }
        if (!in_difficulty) continue;
        const colon = std.mem.indexOfScalar(u8, line, ':') orelse continue;
        const key = std.mem.trim(u8, line[0..colon], " \t");
        const field: ?*f32 = if (std.mem.eql(u8, key, "CircleSize")) &context.circle_size else if (std.mem.eql(u8, key, "OverallDifficulty")) &context.overall_difficulty else if (std.mem.eql(u8, key, "HPDrainRate")) &context.drain_rate else null;
        if (field == null and !std.mem.eql(u8, key, "ApproachRate")) continue;
        const value = std.fmt.parseFloat(f32, std.mem.trim(u8, line[colon + 1 ..], " \t")) catch return error.UnsupportedNativeContext;
        if (!std.math.isFinite(value) or value < 0 or value > 10) return error.UnsupportedNativeContext;
        if (field) |pointer| pointer.* = value else ar = value;
    }
    context.approach_rate = ar orelse context.overall_difficulty;
    return context;
}

// Caller first validates the bounded native mod claim array and replay/score
// binding. Unknown settings never silently become a supported default mod.
pub fn derive(mods: []const std.json.Value, map: []const u8) !Prepared {
    var result: Prepared = .{ .mods = 0, .context = try mapDifficulty(map) };
    var rate_seen = false;
    var da_seen = false;
    var da_values: [4]?f32 = .{ null, null, null, null };
    for (mods) |mod| {
        if (mod != .object) return error.UnsupportedNativeContext;
        const name = mod.object.get("acronym") orelse return error.UnsupportedNativeContext;
        if (name != .string) return error.UnsupportedNativeContext;
        const acronym = name.string;
        const is_da = std.mem.eql(u8, acronym, "DA");
        const is_classic = std.mem.eql(u8, acronym, "CL");
        const fast = std.mem.eql(u8, acronym, "DT") or std.mem.eql(u8, acronym, "NC");
        const slow = std.mem.eql(u8, acronym, "HT") or std.mem.eql(u8, acronym, "DC");
        if (is_classic) {
            result.context.classic_present = 1;
            result.context.classic_flags = abi.ClassicFlag.known_mask;
        } else if (is_da) {
            da_seen = true;
        } else {
            const allowed = [_][]const u8{ "NF", "EZ", "TD", "HD", "HR", "SD", "DT", "RX", "HT", "NC", "FL", "SO", "AP", "PF", "DC" };
            var known = false;
            for (allowed) |item| if (std.mem.eql(u8, item, acronym)) {
                known = true;
                break;
            };
            if (!known) return error.UnsupportedNativeContext;
            const mask = stable_mods.parseCompact(if (std.mem.eql(u8, acronym, "DC")) "HT" else acronym) orelse return error.UnsupportedNativeContext;
            result.mods |= @intCast(mask);
        }
        if (fast or slow) {
            if (rate_seen) return error.UnsupportedNativeContext;
            rate_seen = true;
            result.context.clock_rate = if (fast) 1.5 else 0.75;
        }
        const settings = mod.object.get("settings") orelse continue;
        if (settings == .null) continue;
        if (settings != .object) return error.UnsupportedNativeContext;
        var extended = false;
        if (is_da) if (settings.object.get("extended_limits")) |value| {
            extended = try boolean(value);
        };
        var entries = settings.object.iterator();
        while (entries.next()) |entry| {
            const key = entry.key_ptr.*;
            const value = entry.value_ptr.*;
            if (fast or slow) {
                if (std.mem.eql(u8, key, "speed_change")) {
                    const speed = try number(value);
                    if (speed < (if (fast) @as(f64, 1.01) else 0.5) or speed > (if (fast) @as(f64, 2) else 0.99) or
                        @abs(speed * 100 - @round(speed * 100)) > 0.000001) return error.UnsupportedNativeContext;
                    result.context.clock_rate = speed;
                } else if (std.mem.eql(u8, key, "adjust_pitch")) {
                    _ = try boolean(value);
                } else return error.UnsupportedNativeContext;
            } else if (is_da) {
                if (std.mem.eql(u8, key, "extended_limits")) continue;
                const names = [_][]const u8{ "circle_size", "approach_rate", "overall_difficulty", "drain_rate" };
                var index: ?usize = null;
                for (names, 0..) |item, i| if (std.mem.eql(u8, item, key)) {
                    index = i;
                    break;
                };
                const i = index orelse return error.UnsupportedNativeContext;
                // Null DifficultyBindable values mean no override, not zero.
                if (value == .null) continue;
                const raw_value = try number(value);
                if (raw_value < (if (extended and i == 1) @as(f64, -10) else 0) or raw_value > (if (extended) @as(f64, 11) else 10)) return error.UnsupportedNativeContext;
                const adjusted: f32 = @floatCast(raw_value);
                if (@abs(@as(f64, adjusted) * 10 - @round(@as(f64, adjusted) * 10)) > 0.00001) return error.UnsupportedNativeContext;
                da_values[i] = adjusted;
            } else if (is_classic) {
                const names = [_][]const u8{ "no_slider_head_accuracy", "classic_note_lock", "always_play_tail_sample", "fade_hit_circle_early", "classic_health" };
                var bit: ?u32 = null;
                for (names, 0..) |item, i| if (std.mem.eql(u8, item, key)) {
                    bit = @as(u32, 1) << @intCast(i);
                    break;
                };
                const mask = bit orelse return error.UnsupportedNativeContext;
                if (try boolean(value)) result.context.classic_flags |= mask else result.context.classic_flags &= ~mask;
            } else return error.UnsupportedNativeContext;
        }
    }
    if (result.mods & (1 << 1) != 0 and result.mods & (1 << 4) != 0) return error.UnsupportedNativeContext;
    if (result.mods & (1 << 7) != 0 and result.mods & (1 << 13) != 0) return error.UnsupportedNativeContext;
    if (da_seen and result.mods & ((1 << 1) | (1 << 4)) != 0) return error.UnsupportedNativeContext;
    const fields = [_]*f32{ &result.context.circle_size, &result.context.approach_rate, &result.context.overall_difficulty, &result.context.drain_rate };
    for (fields, 0..) |field, i| {
        if (result.mods & (1 << 1) != 0) field.* *= 0.5;
        if (result.mods & (1 << 4) != 0) field.* = @min(@as(f32, 10), field.* * (if (i == 0) @as(f32, 1.3) else 1.4));
        if (da_values[i]) |value| field.* = value;
    }
    setWindows(&result.context);
    return result;
}
