const std = @import("std");
const storage = @import("../../storage.zig");

// Both stores must retain unknown history as NULL, not manufacture denominators.
pub fn verify(store: anytype, player: i32) !void {
    var observation: storage.AnticheatObservation = .{
        .source = .lazer_score,
        .module = "input-basis-fixture",
        .rule_revision = 9,
        .action = 1,
        .reason = 4002,
        .risk_score = 100,
        .confidence_bps = 100,
        .objects_checked = 2,
        .matched_clicks = 2,
        .key_press_count = 4,
        .mean_abs_timing_error_milli = 25,
    };
    const historical = try store.recordAnticheatObservation(player, observation);
    try std.testing.expectEqual(historical, try store.recordAnticheatObservation(player, observation));
    observation.input_basis = .{ .version = 1, .timing_samples = 2, .ambiguous_matched_presses = 0, .simultaneous_press_frames = 1, .alternation_opportunities = 1 };
    const measured = try store.recordAnticheatObservation(player, observation);
    try std.testing.expect(measured != historical);
    try std.testing.expectEqual(measured, try store.recordAnticheatObservation(player, observation));
    observation.input_basis.?.alternation_opportunities = 2;
    const different = try store.recordAnticheatObservation(player, observation);
    try std.testing.expect(different != measured);
    try std.testing.expectEqual(different, try store.recordAnticheatObservation(player, observation));
    const json = try store.staffAnticheatJson(std.testing.allocator);
    defer std.testing.allocator.free(json);
    const parsed = try std.json.parseFromSlice(std.json.Value, std.testing.allocator, json, .{});
    defer parsed.deinit();
    var found: u32 = 0;
    for (parsed.value.object.get("observations").?.array.items) |item| {
        const id = item.object.get("id").?.integer;
        if (id != historical and id != measured and id != different) continue;
        found += 1;
        const decoded = item.object.get("meaning").?;
        for (decoded.object.get("metrics").?.array.items) |metric| {
            const key = metric.object.get("key").?.string;
            if (std.mem.eql(u8, key, "timing_samples")) {
                try std.testing.expectEqual(id != historical, metric.object.get("available").?.bool);
                if (id == historical) try std.testing.expect(metric.object.get("raw").? == .null) else try std.testing.expectEqual(@as(i64, 2), metric.object.get("raw").?.integer);
            }
            if (std.mem.eql(u8, key, "mean_timing")) {
                try std.testing.expectEqual(@as(i64, 25), metric.object.get("raw").?.integer);
                try std.testing.expectEqual(id != historical, metric.object.get("available").?.bool);
            }
            if (std.mem.eql(u8, key, "alternation_opportunities") and id != historical)
                try std.testing.expectEqual(@as(i64, if (id == measured) 1 else 2), metric.object.get("raw").?.integer);
        }
    }
    try std.testing.expectEqual(@as(u32, 3), found);
    observation.input_basis.?.timing_samples = 3;
    try std.testing.expectError(error.InvalidAnticheatObservation, store.recordAnticheatObservation(player, observation));
}
