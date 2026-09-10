const std = @import("std");
const auth = @import("../../web_auth.zig");
const profile = @import("../../server/routes/profile.zig");
const Context = @import("../../server/http/context.zig").Context;

fn request(app: anytype, target: []const u8, method: []const u8, cookie: ?[]const u8, body: []const u8, csrf: ?[]const u8) ![]u8 {
    const allocator = std.testing.allocator;
    const wire = try std.fmt.allocPrint(allocator, "{s} {s} HTTP/1.1\r\nHost: localhost\r\nContent-Length: {d}\r\n\r\n{s}", .{ method, target, body.len, body });
    defer allocator.free(wire);
    var input: std.Io.Reader = .fixed(wire);
    var output: std.Io.Writer.Allocating = .init(allocator);
    defer output.deinit();
    var server: std.http.Server = .init(&input, &output.writer);
    var req = try server.receiveHead();
    const path = target[0 .. std.mem.indexOfScalar(u8, target, '?') orelse target.len];
    const ctx: Context = .{ .target = target, .raw_path = path, .path = path, .trusted_proxy = false, .auth_owned = null, .osu_token_owned = null, .score_token_owned = null, .content_type_owned = "application/x-www-form-urlencoded", .country_owned = null, .host_owned = "localhost", .cookie_owned = cookie, .csrf_owned = csrf, .origin_owned = "http://localhost", .client_ip_owned = null, .body = body };
    try std.testing.expect(try profile.handle(app, &req, &ctx));
    return allocator.dupe(u8, output.written());
}

pub fn verify(app: anytype) !void {
    const store = &app.store;
    const allocator = std.testing.allocator;
    const owner = try store.register("review owner", "review-owner@example.invalid", "00000000000000000000000000000000");
    const visitor = try store.register("review visitor", "review-visitor@example.invalid", "11111111111111111111111111111111");
    try store.setRestricted(3, owner, true, "profile route fixture");
    const token = try store.issueToken(owner, auth.player_scope, 3600);
    const cookie = try std.fmt.allocPrint(allocator, "{s}={s}", .{ auth.player_cookie_name, token });
    defer allocator.free(cookie);
    const url = try std.fmt.allocPrint(allocator, "/api/v1/users/{d}/details", .{owner});
    defer allocator.free(url);
    for ([_]?[]const u8{ null, cookie }) |credential| {
        const response = try request(app, url, "GET", credential, "", null);
        defer allocator.free(response);
        try std.testing.expect(std.mem.startsWith(u8, response, if (credential == null) "HTTP/1.1 404" else "HTTP/1.1 200"));
        try std.testing.expect(std.mem.indexOf(u8, response, "private, no-store") != null);
    }
    _ = try store.revokeToken(&token);
    const revoked = try request(app, url, "GET", cookie, "", null);
    defer allocator.free(revoked);
    try std.testing.expect(std.mem.startsWith(u8, revoked, "HTTP/1.1 404"));
    const visitor_token = try store.issueToken(visitor, auth.player_scope, 3600);
    const visitor_cookie = try std.fmt.allocPrint(allocator, "{s}={s}", .{ auth.player_cookie_name, visitor_token });
    defer allocator.free(visitor_cookie);
    const hidden = try request(app, url, "GET", visitor_cookie, "", null);
    defer allocator.free(hidden);
    try std.testing.expect(std.mem.startsWith(u8, hidden, "HTTP/1.1 404"));
    _ = try store.changePrivileges(3, visitor, 1 << 12, true);
    const staff_token = try store.issueToken(visitor, auth.scope, 3600);
    const staff_cookie = try std.fmt.allocPrint(allocator, "{s}={s}", .{ auth.cookie_name, staff_token });
    defer allocator.free(staff_cookie);
    const staff_view = try request(app, url, "GET", staff_cookie, "", null);
    defer allocator.free(staff_view);
    try std.testing.expect(std.mem.startsWith(u8, staff_view, "HTTP/1.1 200"));
    _ = try store.changePrivileges(3, visitor, 1 << 12, false);
    const former_staff = try request(app, url, "GET", staff_cookie, "", null);
    defer allocator.free(former_staff);
    try std.testing.expect(std.mem.startsWith(u8, former_staff, "HTTP/1.1 404"));
    const relation_url = try std.fmt.allocPrint(allocator, "/api/v1/users/{d}/relationship", .{owner});
    defer allocator.free(relation_url);
    try store.setRestricted(3, owner, false, "profile route fixture finished");
    const denied = try request(app, relation_url, "POST", visitor_cookie, "action=follow", null);
    defer allocator.free(denied);
    try std.testing.expect(std.mem.startsWith(u8, denied, "HTTP/1.1 403"));
    const csrf = auth.csrfToken(&visitor_token);
    const followed = try request(app, relation_url, "POST", visitor_cookie, "action=follow", &csrf);
    defer allocator.free(followed);
    try std.testing.expect(std.mem.startsWith(u8, followed, "HTTP/1.1 200"));
    try std.testing.expect(std.mem.indexOf(u8, followed, "\"following\":true") != null);
    const friends = try store.friendIds(allocator, visitor);
    defer allocator.free(friends);
    try std.testing.expect(std.mem.indexOfScalar(i32, friends, owner) != null);
}
