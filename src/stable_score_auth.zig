const std = @import("std");
const sessions_mod = @import("sessions.zig");
const stable_client = @import("stable_client.zig");
const storage = @import("runtime_storage.zig");

pub const grace_lifetime_seconds: i64 = 5 * 60;

pub const Decision = enum {
    exact,
    client_bound,
    grace,
    missing,
    foreign,
    offline,
    unknown,
    expired,
    consumed,
    revoked,
    current_not_grace,
    client_version_mismatch,
    client_hardware_mismatch,
    missing_login_client_binding,
    invalid_client_binding,
};

pub fn authorize(store: *storage.Store, sessions: *sessions_mod.Sessions, token: ?[]const u8, user_id: i32, submitted_binding: ?stable_client.Binding, submission_checksum: []const u8, now: i64) !Decision {
    return authorizeWithBackend(storage.is_postgres, store, sessions, token, user_id, submitted_binding, submission_checksum, now);
}

fn authorizeWithBackend(comptime is_postgres: bool, store: anytype, sessions: *sessions_mod.Sessions, token: ?[]const u8, user_id: i32, submitted_binding: ?stable_client.Binding, submission_checksum: []const u8, now: i64) !Decision {
    const present_token = token orelse return .missing;
    if (present_token.len == 0) return .missing;
    if (!validSubmissionToken(present_token)) return .unknown;
    return switch (sessions.authorizeScoreToken(token, user_id, submitted_binding)) {
        .exact => .exact,
        .missing => .missing,
        .foreign_live => .foreign,
        .offline => .offline,
        .client_version_mismatch => .client_version_mismatch,
        .client_hardware_mismatch => .client_hardware_mismatch,
        .missing_login_client_binding => .missing_login_client_binding,
        .invalid_client_binding => .invalid_client_binding,
        .grace_candidate => grace: {
            if (comptime !is_postgres) break :grace .client_bound;
            const binding = submitted_binding orelse break :grace .invalid_client_binding;
            break :grace switch (try store.consumeStableScoreGrace(present_token, user_id, binding, submission_checksum, now)) {
                .accepted => .grace,
                .unknown => .client_bound,
                .foreign => .foreign,
                .version_mismatch => .client_version_mismatch,
                .hardware_mismatch => .client_hardware_mismatch,
                .current_not_grace => .current_not_grace,
                .expired => .expired,
                .consumed => .consumed,
                .revoked => .revoked,
            };
        },
    };
}

fn validSubmissionToken(token: []const u8) bool {
    if (token.len == 0 or token.len > 4096) return false;
    for (token) |byte| if (byte < 0x21 or byte > 0x7e) return false;
    return true;
}

test "stable submission token is opaque and bounded" {
    try std.testing.expect(validSubmissionToken("client-generated-score-token"));
    try std.testing.expect(validSubmissionToken("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"));
    try std.testing.expect(!validSubmissionToken(""));
    try std.testing.expect(!validSubmissionToken("token\r\ninjected"));
    try std.testing.expect(!validSubmissionToken("x" ** 4097));
}
test "stable submission token keeps active binding and known grace denials" {
    const FakeStore = struct {
        result: @import("postgres_stable_sessions.zig").GraceResult = .unknown,
        pub fn consumeStableScoreGrace(self: *@This(), _: []const u8, _: i32, _: stable_client.Binding, _: []const u8, _: i64) !@import("postgres_stable_sessions.zig").GraceResult {
            return self.result;
        }
    };
    var store: FakeStore = .{};
    var sessions = sessions_mod.Sessions.init(std.testing.allocator, std.testing.io);
    defer sessions.deinit();
    const binding: stable_client.Binding = .{ .version_date = "20260711".*, .hardware_digest = .{1} ** 32 };
    const user = try sessions.createBound(.{
        .id = 4,
        .name = try std.testing.allocator.dupe(u8, "score player"),
        .safe_name = try std.testing.allocator.dupe(u8, "score_player"),
    }, 0, 0, 0, binding);
    const foreign = try sessions.createBound(.{
        .id = 5,
        .name = try std.testing.allocator.dupe(u8, "other player"),
        .safe_name = try std.testing.allocator.dupe(u8, "other_player"),
    }, 0, 0, 0, binding);
    const submission_token = "a-client-submission-token-not-issued-by-bancho";
    const checksum = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    try std.testing.expectEqual(Decision.client_bound, try authorizeWithBackend(true, &store, &sessions, submission_token, 4, binding, checksum, 1));
    try std.testing.expectEqual(Decision.exact, try authorizeWithBackend(true, &store, &sessions, &user.token, 4, binding, checksum, 1));
    try std.testing.expectEqual(Decision.foreign, try authorizeWithBackend(true, &store, &sessions, &foreign.token, 4, binding, checksum, 1));
    try std.testing.expectEqual(Decision.missing, try authorizeWithBackend(true, &store, &sessions, null, 4, binding, checksum, 1));
    var wrong = binding;
    wrong.hardware_digest[0] = 2;
    try std.testing.expectEqual(Decision.client_hardware_mismatch, try authorizeWithBackend(true, &store, &sessions, submission_token, 4, wrong, checksum, 1));
    wrong = binding;
    wrong.version_date = "20260712".*;
    try std.testing.expectEqual(Decision.client_version_mismatch, try authorizeWithBackend(true, &store, &sessions, submission_token, 4, wrong, checksum, 1));
    for ([_]struct { result: @import("postgres_stable_sessions.zig").GraceResult, expected: Decision }{
        .{ .result = .accepted, .expected = .grace },
        .{ .result = .expired, .expected = .expired },
        .{ .result = .revoked, .expected = .revoked },
        .{ .result = .consumed, .expected = .consumed },
        .{ .result = .foreign, .expected = .foreign },
    }) |case| {
        store.result = case.result;
        try std.testing.expectEqual(case.expected, try authorizeWithBackend(true, &store, &sessions, submission_token, 4, binding, checksum, 1));
    }
    user.presence_suppressed = true;
    try std.testing.expectEqual(Decision.offline, try authorizeWithBackend(true, &store, &sessions, submission_token, 4, binding, checksum, 1));
}
