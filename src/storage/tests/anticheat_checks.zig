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
    try std.testing.expectError(error.InvalidAnticheatObservation, storage.validateAnticheatObservation(5, .{ .source = .lazer_score, .score_id = 42, .module = "fixture", .action = 1 }));
    try std.testing.expectError(error.InvalidAnticheatObservation, storage.validateAnticheatObservation(5, .{ .source = .stable_score, .lazer_score_id = 42, .module = "fixture", .action = 1 }));
    try storage.validateAnticheatObservation(5, .{ .source = .lazer_score, .lazer_score_id = 42, .module = "fixture", .action = 1 });
}
