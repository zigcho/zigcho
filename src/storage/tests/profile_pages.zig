const std = @import("std");
const beatmap = @import("../../beatmap.zig");
const stable = @import("../../stable_score.zig");
const domain = @import("../../domain.zig");

pub fn verify(store: anytype) !void {
    const allocator = std.testing.allocator;
    const user = try store.register("page player", "pages@example.invalid", "00000000000000000000000000000000");
    const map = @embedFile("../../testdata/synthetic-standard.osu");
    const base = try beatmap.parse(map);
    for (0..61) |index| {
        var metadata = base;
        metadata.id = 920_000_001 + @as(i32, @intCast(index));
        metadata.set_id = metadata.id;
        var hash_buffer: [32]u8 = undefined;
        const hash = try std.fmt.bufPrint(&hash_buffer, "{x:0>32}", .{index + 1});
        try store.upsertBeatmap(metadata, hash, 3, 1.8, 10, map);
        const score: stable.Submission = .{
            .map_md5 = hash,
            .username = "page player",
            .online_checksum = hash,
            .n300 = 10,
            .n100 = 0,
            .n50 = 0,
            .ngeki = 0,
            .nkatu = 0,
            .nmiss = 0,
            .total_score = 1_000_000 + @as(i64, @intCast(index)),
            .max_combo = 10,
            .perfect = true,
            .grade = "X",
            .mods = 0,
            .passed = true,
            .mode = 0,
            .client_time = "260910000000",
            .client_flags = "0",
        };
        _ = try store.insertStableScore(user, score, 100 + @as(f64, @floatFromInt(index)), "replay", 1_000);
        _ = try store.insertLazerScore(user, .{
            .beatmap_id = metadata.id,
            .ruleset_id = 0,
            .total_score = score.total_score,
            .total_score_without_mods = score.total_score,
            .legacy_total_score = @intCast(score.total_score),
            .accuracy = 1,
            .max_combo = 10,
            .passed = true,
            .mods = null,
            .statistics = .empty,
            .namespace = .vanilla,
            .rank = "X",
        }, 101 + @as(f64, @floatFromInt(index)), "[]", "{}", "{}", "[]", "replay");
        if (index == 0) _ = try store.setScorePinned(user, hash, 0, 0, "vanilla", true);
    }
    for ([_]domain.SiteScoreSource{ .all, .stable, .lazer }) |source| {
        var previous: [3]i64 = .{ 0, 0, 0 };
        for ([_]u32{ 0, 25, 50, 75 }) |offset| {
            const body = (try store.siteProfilePageForViewer(allocator, user, source, 0, false, offset)).?;
            defer allocator.free(body);
            var parsed = try std.json.parseFromSlice(std.json.Value, allocator, body, .{});
            defer parsed.deinit();
            const profile = parsed.value.object;
            const page = profile.get("score_page").?.object;
            try std.testing.expectEqual(@as(i64, offset), page.get("offset").?.integer);
            try std.testing.expectEqual(@as(i64, 61), profile.get("first_place_count").?.integer);
            for ([_][]const u8{ "top_scores", "recent_scores", "first_place_scores" }, [_][]const u8{ "top_more", "recent_more", "first_more" }, 0..) |field, more, slot| {
                const total: usize = if (source == .all and slot == 1) 122 else 61;
                const count = @min(25, total -| offset);
                const rows = profile.get(field).?.array.items;
                try std.testing.expectEqual(count, rows.len);
                try std.testing.expectEqual(total > offset + 25, page.get(more).?.bool);
                if (rows.len > 0) {
                    const first_id = rows[0].object.get("id").?.integer;
                    if (source != .all or slot != 1) try std.testing.expect(first_id != previous[slot]);
                    previous[slot] = rows[rows.len - 1].object.get("id").?.integer;
                    if (slot == 0) try std.testing.expectApproxEqAbs(100.0 * std.math.pow(f64, 0.95, @floatFromInt(offset)), rows[0].object.get("weight").?.object.get("percentage").?.float, 0.006);
                }
            }
            try std.testing.expectEqual(@as(usize, if (source == .lazer) 0 else 1), profile.get("pinned_scores").?.array.items.len);
        }
    }
    try std.testing.expectError(error.InvalidScoreOffset, store.siteProfilePageForViewer(allocator, user, .all, 0, false, 26));
    try store.updateSiteProfile(user, .{ .bio = "", .title = "", .pronouns = "", .location = "", .website = "", .accent = .pink, .preferred_mode = 0, .profile_source = .all, .avatar_key = 1, .show_country = true, .show_profile_stats = false, .show_recent_scores = false });
    const hidden = (try store.siteProfilePageForViewer(allocator, user, .all, 0, false, 25)).?;
    defer allocator.free(hidden);
    var parsed = try std.json.parseFromSlice(std.json.Value, allocator, hidden, .{});
    defer parsed.deinit();
    for ([_][]const u8{ "top_scores", "recent_scores", "first_place_scores", "pinned_scores" }) |field| try std.testing.expectEqual(@as(usize, 0), parsed.value.object.get(field).?.array.items.len);
    for ([_][]const u8{ "top_more", "recent_more", "first_more" }) |field| try std.testing.expect(!parsed.value.object.get("score_page").?.object.get(field).?.bool);
}
