const std = @import("std");
const domain = @import("domain.zig");
const auth = @import("web_auth.zig");

pub const Access = struct {
    viewer_id: ?i32 = null,
    owner: bool = false,
    staff: bool = false,
    staff_session: bool = false,
    moderate: bool = false,
    admin: bool = false,
    develop: bool = false,
    can_manage: bool = false,

    pub fn privateView(self: Access) bool {
        return self.owner or self.staff;
    }
};

pub fn forUsers(player: ?domain.User, staff_user: ?domain.User, target: domain.User) Access {
    const staff_actor = if (staff_user) |user| if (auth.allowed(user)) user else null else null;
    const actor = staff_actor orelse player;
    var result: Access = .{
        .viewer_id = if (player) |user| user.id else if (staff_actor) |user| user.id else null,
        .staff_session = staff_actor != null,
    };
    result.owner = result.viewer_id != null and result.viewer_id.? == target.id;
    if (actor) |user| {
        result.staff = auth.allowed(user);
        result.moderate = auth.canModerate(user);
        result.admin = auth.canAdmin(user);
        result.develop = auth.canDevelop(user);
        result.can_manage = result.moderate and auth.canManage(user, target);
    }
    return result;
}

pub fn resolve(store: anytype, allocator: std.mem.Allocator, cookies: ?[]const u8, target_id: i32) !Access {
    const player = if (auth.playerSessionToken(cookies)) |token| try store.authenticateToken(allocator, token, auth.player_scope) else null;
    defer if (player) |user| {
        allocator.free(user.name);
        allocator.free(user.safe_name);
    };
    const staff_user = if (auth.sessionToken(cookies)) |token| try store.authenticateToken(allocator, token, auth.scope) else null;
    defer if (staff_user) |user| {
        allocator.free(user.name);
        allocator.free(user.safe_name);
    };
    const target = (try store.userById(allocator, target_id)) orelse return .{};
    defer allocator.free(target.name);
    defer allocator.free(target.safe_name);
    return forUsers(player, staff_user, target);
}

pub fn attach(allocator: std.mem.Allocator, profile: []const u8, access: Access) ![]u8 {
    if (profile.len == 0 or profile[profile.len - 1] != '}') return error.InvalidProfile;
    var output: std.Io.Writer.Allocating = .init(allocator);
    errdefer output.deinit();
    try output.writer.writeAll(profile[0 .. profile.len - 1]);
    try output.writer.writeAll(",\"profile_access\":");
    try std.json.Stringify.value(access, .{}, &output.writer);
    try output.writer.writeByte('}');
    var list = output.toArrayList();
    return list.toOwnedSlice(allocator);
}

test "restricted profile access keeps owner staff and action permissions separate" {
    const target: domain.User = .{ .id = 5, .name = "player", .safe_name = "player", .privileges = 3, .restricted = true };
    const visitor: domain.User = .{ .id = 6, .name = "visitor", .safe_name = "visitor", .privileges = 3 };
    var moderator = visitor;
    moderator.privileges |= 1 << 12;
    try std.testing.expect(!forUsers(null, null, target).privateView());
    try std.testing.expect(!forUsers(visitor, null, target).privateView());
    const owner = forUsers(target, null, target);
    try std.testing.expect(owner.owner and owner.privateView() and !owner.staff and !owner.can_manage);
    const staff = forUsers(null, moderator, target);
    try std.testing.expect(staff.privateView() and staff.staff_session and staff.can_manage and !staff.admin);
    try std.testing.expect(forUsers(moderator, null, target).staff and !forUsers(moderator, null, target).staff_session);
    try std.testing.expect(!forUsers(null, moderator, moderator).can_manage);
    var bot = target;
    bot.id = 3;
    try std.testing.expect(!forUsers(null, moderator, bot).can_manage);
    moderator.restricted = true;
    try std.testing.expect(!forUsers(moderator, moderator, target).privateView());
}
