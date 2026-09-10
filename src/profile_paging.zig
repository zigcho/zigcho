const std = @import("std");

pub const page_size: usize = 25;
pub const max_offset: u32 = 1_000_000;

pub fn validOffset(offset: u32) bool {
    return offset <= max_offset and offset % page_size == 0;
}

pub fn query(allocator: std.mem.Allocator, sql: []const u8, postgres: bool) ![:0]u8 {
    const needle = if (std.mem.indexOf(u8, sql, "LIMIT 100") != null) "LIMIT 100" else "LIMIT 20";
    const at = std.mem.indexOf(u8, sql, needle) orelse return error.MissingProfileLimit;
    return std.fmt.allocPrintSentinel(allocator, "{s}{s}{s}", .{ sql[0..at], if (postgres) "LIMIT $4 OFFSET $5" else "LIMIT ?4 OFFSET ?5", sql[at + needle.len ..] }, 0);
}

test "profile score pages preserve the first place hydration query" {
    const allocator = std.testing.allocator;
    const paged = try query(allocator, "WITH picked AS (SELECT id FROM scores LIMIT 20) SELECT * FROM picked;", true);
    defer allocator.free(paged);
    try std.testing.expectEqualStrings("WITH picked AS (SELECT id FROM scores LIMIT $4 OFFSET $5) SELECT * FROM picked;", paged);
    try std.testing.expect(validOffset(0) and validOffset(25) and validOffset(50));
    try std.testing.expect(!validOffset(26) and !validOffset(max_offset + 25));
}
