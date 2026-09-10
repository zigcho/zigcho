const std = @import("std");
const beatmap = @import("../../beatmap.zig");
const stable = @import("../../stable_score.zig");
const domain = @import("../../domain.zig");

pub fn verify(store: anytype) !void {
    const allocator = std.testing.allocator;
    const user = try store.register("page player", "pages@example.invalid", "00000000000000000000000000000000");
    try verifySetup(store, user);
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
        const stable_id = try store.insertStableScore(user, score, 100 + @as(f64, @floatFromInt(index)), "replay", 1_000);
        const lazer_id = try store.insertLazerScore(user, .{
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
        if (index == 0) {
            _ = try store.setScorePinned(user, hash, 0, 0, "vanilla", true);
            const detail_store = @import("../profile_details.zig");
            for ([_]i64{ stable_id, lazer_id }, [_]bool{ false, true }) |score_id, is_lazer| {
                const json = (try detail_store.scoreJudgements(store, allocator, user, score_id, is_lazer, true, true)).?;
                defer allocator.free(json);
                var parsed = try std.json.parseFromSlice(std.json.Value, allocator, json, .{});
                defer parsed.deinit();
                try std.testing.expectEqual(@as(i64, 0), parsed.value.object.get("mode").?.integer);
                if (!is_lazer) try std.testing.expectEqual(@as(i64, 10), parsed.value.object.get("statistics").?.object.get("n300").?.integer);
                try std.testing.expect((try detail_store.scoreJudgements(store, allocator, user, score_id, is_lazer, false, false)) == null);
                try std.testing.expect((try detail_store.scoreJudgements(store, allocator, user + 999, score_id, is_lazer, true, true)) == null);
            }
        }
    }
    for ([_]domain.SiteScoreSource{ .all, .stable, .lazer }) |source| {
        const details = @import("../profile_details.zig");
        const filter: details.Filter = .{ .source = source, .mode = 0 };
        const metrics = try details.metrics(store, allocator, user, filter);
        defer allocator.free(metrics);
        var metrics_json = try std.json.parseFromSlice(std.json.Value, allocator, metrics, .{});
        defer metrics_json.deinit();
        try std.testing.expectEqual(@as(i64, 61), metrics_json.value.object.get("played_beatmap_count").?.integer);
        try std.testing.expectEqual(@as(i64, 61), metrics_json.value.object.get("grade_ss").?.integer);
        try std.testing.expectEqual(@as(i64, if (source == .lazer) 0 else 610), metrics_json.value.object.get("total_hits").?.integer);
        const monthly = try details.monthly(store, allocator, user, filter, false);
        defer allocator.free(monthly);
        var monthly_json = try std.json.parseFromSlice(std.json.Value, allocator, monthly, .{});
        defer monthly_json.deinit();
        try std.testing.expectEqual(@as(i64, if (source == .all) 122 else 61), monthly_json.value.array.items[0].object.get("count").?.integer);
        for ([_]bool{ false, true }) |activity| {
            const rows = try details.collection(store, allocator, user, filter, activity, 0);
            defer allocator.free(rows);
            var rows_json = try std.json.parseFromSlice(std.json.Value, allocator, rows, .{});
            defer rows_json.deinit();
            try std.testing.expectEqual(@as(usize, 25), rows_json.value.array.items.len);
            if (!activity) try std.testing.expectEqual(@as(i64, if (source == .all) 2 else 1), rows_json.value.array.items[0].object.get("count").?.integer);
            if (activity and source != .all) for (rows_json.value.array.items) |row| try std.testing.expectEqualStrings(@tagName(source), row.object.get("client").?.string);
        }
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
    for ([_]@import("../profile_details.zig").Filter{ .{ .source = .all, .mode = 4 }, .{ .source = .all, .mode = 8 }, .{ .source = .scorev2, .mode = 0 }, .{ .source = .stable, .mode = 1 } }) |filter| {
        const rows = try @import("../profile_details.zig").collection(store, allocator, user, filter, true, 0);
        defer allocator.free(rows);
        try std.testing.expectEqualStrings("[]", rows);
    }
    try std.testing.expectError(error.InvalidScoreOffset, store.siteProfilePageForViewer(allocator, user, .all, 0, false, 26));
    try store.updateSiteProfile(user, .{ .bio = "", .title = "", .pronouns = "", .location = "", .website = "", .accent = .pink, .preferred_mode = 0, .profile_source = .all, .avatar_key = 1, .show_country = true, .show_profile_stats = false, .show_recent_scores = false });
    const hidden = (try store.siteProfilePageForViewer(allocator, user, .all, 0, false, 25)).?;
    defer allocator.free(hidden);
    var parsed = try std.json.parseFromSlice(std.json.Value, allocator, hidden, .{});
    defer parsed.deinit();
    for ([_][]const u8{ "top_scores", "recent_scores", "first_place_scores", "pinned_scores" }) |field| try std.testing.expectEqual(@as(usize, 0), parsed.value.object.get(field).?.array.items.len);
    for ([_][]const u8{ "top_more", "recent_more", "first_more" }) |field| try std.testing.expect(!parsed.value.object.get("score_page").?.object.get(field).?.bool);
    try store.setRestricted(3, user, true, "profile visibility fixture");
    try std.testing.expect((try store.siteProfilePageForViewer(allocator, user, .all, 0, false, 0)) == null);
    try std.testing.expect((try store.siteNameHistoryJson(allocator, user)) == null);
    const history = (try store.siteNameHistoryForViewerJson(allocator, user, true)).?;
    defer allocator.free(history);
    for ([_]domain.SiteScoreSource{ .all, .stable, .lazer }) |source| {
        const owned = (try store.siteProfilePageForViewer(allocator, user, source, 0, true, 25)).?;
        defer allocator.free(owned);
        var visible = try std.json.parseFromSlice(std.json.Value, allocator, owned, .{});
        defer visible.deinit();
        try std.testing.expect(visible.value.object.get("restricted").?.bool);
        try std.testing.expectEqual(@as(usize, 25), visible.value.object.get("top_scores").?.array.items.len);
        try std.testing.expectEqual(@as(i64, 0), visible.value.object.get("selected_stats").?.object.get("global_rank").?.integer);
        try std.testing.expectEqual(@as(i64, 0), visible.value.object.get("first_place_count").?.integer);
    }
}

fn verifySetup(store: anytype, user: i32) !void {
    const allocator = std.testing.allocator;
    var settings: domain.SiteProfileSettings = .{ .setup = "desktop,tablet,keyboard,pure-luck", .bio = "", .title = "", .pronouns = "", .location = "", .website = "", .accent = .pink, .preferred_mode = 0, .profile_source = .all, .avatar_key = 1, .show_country = true, .show_profile_stats = true, .show_recent_scores = true };
    try store.updateSiteProfile(user, settings);
    settings.setup = null;
    try store.updateSiteProfile(user, settings);
    const account = (try store.siteAccountJson(allocator, user)).?;
    defer allocator.free(account);
    const profile = (try store.siteProfile(allocator, user, .all, 0)).?;
    defer allocator.free(profile);
    for ([_][]const u8{ account, profile }) |json| {
        var parsed = try std.json.parseFromSlice(std.json.Value, allocator, json, .{});
        defer parsed.deinit();
        try std.testing.expectEqualStrings("desktop,tablet,keyboard,pure-luck", parsed.value.object.get("profile_setup").?.string);
    }
    settings.setup = "verified";
    try std.testing.expectError(error.InvalidProfileSetup, store.updateSiteProfile(user, settings));
    settings.setup = "";
    try store.updateSiteProfile(user, settings);
    const cleared = (try store.siteAccountJson(allocator, user)).?;
    defer allocator.free(cleared);
    var parsed = try std.json.parseFromSlice(std.json.Value, allocator, cleared, .{});
    defer parsed.deinit();
    try std.testing.expectEqualStrings("", parsed.value.object.get("profile_setup").?.string);
}
