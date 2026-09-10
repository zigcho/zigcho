const std = @import("std");

pub const options = [_][]const u8{ "desktop", "mobile", "mouse", "tablet", "keyboard", "touchscreen", "controller", "trackpad", "mouse-only", "tablet-only", "feet", "toaster", "mind-control", "pure-luck" };

pub fn valid(value: []const u8) bool {
    if (value.len == 0) return true;
    if (value.len > 160) return false;
    var seen: u16 = 0;
    var count: usize = 0;
    var items = std.mem.splitScalar(u8, value, ',');
    while (items.next()) |item| {
        var found = false;
        for (options, 0..) |option, index| {
            if (!std.mem.eql(u8, item, option)) continue;
            const bit = @as(u16, 1) << @as(u4, @intCast(index));
            if (seen & bit != 0) return false;
            seen |= bit;
            found = true;
            break;
        }
        count += 1;
        if (!found or count > 8) return false;
    }
    return true;
}

test "profile setup is bounded optional and self selected" {
    try std.testing.expect(valid(""));
    try std.testing.expect(valid("desktop,mobile,tablet,keyboard,pure-luck"));
    for ([_][]const u8{ "mouse,mouse", "mouse,", "verified", "<script>", " mouse", "desktop,mobile,mouse,tablet,keyboard,touchscreen,controller,trackpad,feet" }) |value| try std.testing.expect(!valid(value));
}
