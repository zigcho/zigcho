const std = @import("std");
const storage = @import("../../storage.zig");
const roles = @import("../../account_roles.zig");

test "check exemptions are explicit scoped expiring revocable and distinct from review hiding" {
    var tmp = std.testing.tmpDir(.{});
    defer tmp.cleanup();
    var path_buf: [256]u8 = undefined;
    const path = try std.fmt.bufPrintZ(&path_buf, ".zig-cache/tmp/{s}/checks.db", .{tmp.sub_path});
    var store = try storage.Store.open(std.testing.allocator, std.testing.io, path);
    defer store.close();
    try store.migrate();
    const admin = try store.register("checks admin", "checks-admin@example.invalid", "00000000000000000000000000000000");
    const player = try store.register("checks player", "checks-player@example.invalid", "11111111111111111111111111111111");
    var sql_buf: [512]u8 = undefined;
    try store.exec(try std.fmt.bufPrintZ(&sql_buf, "UPDATE users SET privileges=privileges|{d} WHERE id={d}", .{ roles.Role.administrator.definition().bit, admin }));
    _ = try store.createAnticheatExclusion(admin, player, .all, 3600, "review noise only");
    try std.testing.expect(!try store.anticheatChecksExcluded(player, .stable_score));
    const check = try store.createAnticheatCheckExclusion(admin, player, .stable_score, 3600, "verified test account");
    try std.testing.expect(try store.anticheatChecksExcluded(player, .stable_score));
    try std.testing.expect(!try store.anticheatChecksExcluded(player, .stable_login));
    try std.testing.expect(!try store.anticheatChecksExcluded(player, .lazer_score));
    try std.testing.expectError(error.AnticheatExclusionOverlap, store.createAnticheatCheckExclusion(admin, player, .all, 3600, "overlapping checks"));
    try std.testing.expectError(error.InvalidAnticheatExclusion, store.createAnticheatCheckExclusion(admin, admin, .all, 3600, "cannot exempt myself"));
    try store.revokeAnticheatExclusion(admin, check, "resume normal checks");
    try std.testing.expect(!try store.anticheatChecksExcluded(player, .stable_score));
    const all = try store.createAnticheatCheckExclusion(admin, player, .all, 3600, "all client test account");
    try std.testing.expect(try store.anticheatChecksExcluded(player, .stable_score));
    try std.testing.expect(try store.anticheatChecksExcluded(player, .lazer_score));
    const json = try store.staffAnticheatJson(std.testing.allocator);
    defer std.testing.allocator.free(json);
    try std.testing.expect(std.mem.indexOf(u8, json, "\"skip_checks\":true") != null);
    try std.testing.expect(std.mem.indexOf(u8, json, "\"skip_checks\":false") != null);
    try store.exec(try std.fmt.bufPrintZ(&sql_buf, "UPDATE anticheat_review_exclusions SET created_at=unixepoch()-7200,expires_at=unixepoch()-3600 WHERE id={d}", .{all}));
    try std.testing.expect(!try store.anticheatChecksExcluded(player, .stable_score));
    try std.testing.expect(!try store.anticheatChecksExcluded(player, .lazer_score));
}

test "lazer observations cannot accidentally point to a stable score" {
    try std.testing.expectError(error.InvalidAnticheatObservation, storage.validateAnticheatObservation(5, .{ .source = .lazer_score, .score_id = 42, .module = "fixture", .action = 1, .reason = 0, .risk_score = 0, .confidence_bps = 0 }));
    try std.testing.expectError(error.InvalidAnticheatObservation, storage.validateAnticheatObservation(5, .{ .source = .stable_score, .lazer_score_id = 42, .module = "fixture", .action = 1, .reason = 0, .risk_score = 0, .confidence_bps = 0 }));
    try storage.validateAnticheatObservation(5, .{ .source = .lazer_score, .lazer_score_id = 42, .module = "fixture", .action = 1, .reason = 0, .risk_score = 0, .confidence_bps = 0 });
}

test "applied integrity rejections do not coalesce into old observe-only findings" {
    var tmp = std.testing.tmpDir(.{});
    defer tmp.cleanup();
    var buf: [256]u8 = undefined;
    const path = try std.fmt.bufPrintZ(&buf, ".zig-cache/tmp/{s}/rejections.db", .{tmp.sub_path});
    var store = try storage.Store.open(std.testing.allocator, std.testing.io, path);
    defer store.close();
    try store.migrate();
    const player = try store.register("rejection player", "rejection@example.invalid", "00000000000000000000000000000000");
    var observation: storage.AnticheatObservation = .{ .source = .lazer_score, .module = "fixture", .action = 1, .reason = 2008, .risk_score = 500, .confidence_bps = 8000 };
    const proposed = try store.recordAnticheatObservation(player, observation);
    observation.enforced = true;
    const rejected = try store.recordAnticheatObservation(player, observation);
    try std.testing.expect(proposed != rejected);
    try std.testing.expectEqual(rejected, try store.recordAnticheatObservation(player, observation));
    const json = try store.staffAnticheatJson(std.testing.allocator);
    defer std.testing.allocator.free(json);
    try std.testing.expect(std.mem.indexOf(u8, json, "\"enforced\":true") != null);
    try std.testing.expect(std.mem.indexOf(u8, json, "score rejected before persistence") != null);
    const audit = try store.staffAuditJson(std.testing.allocator);
    defer std.testing.allocator.free(audit);
    try std.testing.expect(std.mem.indexOf(u8, audit, "anticheat.reject") != null);
    try std.testing.expect(std.mem.indexOf(u8, audit, "mode=integrity") != null);
}

test "score-less lazer findings never coalesce into persisted score evidence" {
    var tmp = std.testing.tmpDir(.{});
    defer tmp.cleanup();
    var buf: [512]u8 = undefined;
    const path = try std.fmt.bufPrintZ(&buf, ".zig-cache/tmp/{s}/lazer-evidence.db", .{tmp.sub_path});
    var store = try storage.Store.open(std.testing.allocator, std.testing.io, path);
    defer store.close();
    try store.migrate();
    const player = try store.register("lazer evidence", "lazer-evidence@example.invalid", "00000000000000000000000000000000");
    try store.exec(try std.fmt.bufPrintZ(&buf, "INSERT INTO lazer_scores(id,user_id,beatmap_id,ruleset_id,total_score,total_score_without_mods,accuracy,max_combo,passed,mods_json,statistics_json,rank_namespace) VALUES(42,{d},75,0,100,100,1.0,10,1,'[]','{{}}','vanilla')", .{player}));
    var observation: storage.AnticheatObservation = .{ .source = .lazer_score, .lazer_score_id = 42, .module = "fixture", .action = 1, .reason = 2008, .risk_score = 500, .confidence_bps = 8000 };
    const attached = try store.recordAnticheatObservation(player, observation);
    observation.lazer_score_id = null;
    const unattached = try store.recordAnticheatObservation(player, observation);
    try std.testing.expect(attached != unattached);
    try std.testing.expectEqual(unattached, try store.recordAnticheatObservation(player, observation));
}

test "sqlite timing basis round trips without coalescing unknown history" {
    var tmp = std.testing.tmpDir(.{});
    defer tmp.cleanup();
    var buf: [256]u8 = undefined;
    const path = try std.fmt.bufPrintZ(&buf, ".zig-cache/tmp/{s}/input-basis.db", .{tmp.sub_path});
    var store = try storage.Store.open(std.testing.allocator, std.testing.io, path);
    defer store.close();
    try store.migrate();
    const player = try store.register("basis player", "basis@example.invalid", "00000000000000000000000000000000");
    try @import("input_basis.zig").verify(&store, player);
    try std.testing.expectError(error.DatabaseQueryFailed, store.exec("UPDATE anticheat_observations SET timing_samples=99 WHERE input_basis_version=1"));
    try std.testing.expectError(error.DatabaseQueryFailed, store.exec("UPDATE anticheat_observations SET input_basis_version=1 WHERE input_basis_version IS NULL"));
    try store.migrate();
    try @import("input_basis.zig").verify(&store, player);
}

test "sqlite migration 49 retains raw history and survives restart" {
    var tmp = std.testing.tmpDir(.{});
    defer tmp.cleanup();
    var buf: [256]u8 = undefined;
    const path = try std.fmt.bufPrintZ(&buf, ".zig-cache/tmp/{s}/basis-migration.db", .{tmp.sub_path});
    {
        var store = try storage.Store.open(std.testing.allocator, std.testing.io, path);
        defer store.close();
        try store.migrate();
        const player = try store.register("old basis", "old-basis@example.invalid", "00000000000000000000000000000000");
        _ = try store.recordAnticheatObservation(player, .{ .source = .lazer_score, .module = "old-basis-fixture", .rule_revision = 8, .action = 1, .reason = 4002, .risk_score = 1, .confidence_bps = 1, .objects_checked = 2, .matched_clicks = 2, .mean_abs_timing_error_milli = 25 });
        // Isolated fixture: restore the old table shape, not a production downgrade.
        try store.exec("ALTER TABLE anticheat_observations DROP COLUMN alternation_opportunities; ALTER TABLE anticheat_observations DROP COLUMN simultaneous_press_frames; ALTER TABLE anticheat_observations DROP COLUMN ambiguous_matched_presses; ALTER TABLE anticheat_observations DROP COLUMN timing_samples; ALTER TABLE anticheat_observations DROP COLUMN input_basis_version; PRAGMA user_version=48");
        try store.migrate();
    }
    var reopened = try storage.Store.open(std.testing.allocator, std.testing.io, path);
    defer reopened.close();
    try reopened.migrate();
    const json = try reopened.staffAnticheatJson(std.testing.allocator);
    defer std.testing.allocator.free(json);
    try std.testing.expect(std.mem.indexOf(u8, json, "\"mean_timing_milli\":25") != null);
    try std.testing.expect(std.mem.indexOf(u8, json, "\"raw\":null,\"available\":false") != null);
}
