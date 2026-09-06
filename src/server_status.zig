const std = @import("std");
const builtin = @import("builtin");
const storage = @import("runtime_storage.zig");
const pp = @import("exact_pp.zig");

pub const Provider = struct {
    context: *anyopaque,
    write: *const fn (*anyopaque, *std.Io.Writer) anyerror!void,
};

pub fn bind(app: anytype) Provider {
    return .{ .context = app, .write = struct {
        fn write(context: *anyopaque, writer: *std.Io.Writer) !void {
            const self: @TypeOf(app) = @ptrCast(@alignCast(context));
            const uptime = @max(@as(i64, 0), std.Io.Clock.real.now(self.store.io).toSeconds() - self.started_at);
            try writer.print("server | up {d}d {d}h {d}m {d}s | {s}/{s}\n", .{ @divTrunc(uptime, 86400), @mod(@divTrunc(uptime, 3600), 24), @mod(@divTrunc(uptime, 60), 60), @mod(uptime, 60), @tagName(builtin.os.tag), @tagName(builtin.cpu.arch) });
            try writeProcess(self.allocator, self.store.io, writer, uptime);
            try writer.print("http | {d}/{d} active | {d} rejected | {d} timed out | irc {d}\n", .{ self.http_gate.active.load(.acquire), self.http_gate.limit, self.http_gate.rejected.load(.acquire), self.http_gate.timed_out.load(.acquire), self.irc_clients.load(.acquire) });
            if (comptime @hasField(@TypeOf(self.store), "pool")) {
                if (self.store.pool.mutex.tryLock()) {
                    var busy: usize = 0;
                    for (self.store.pool.in_use) |used| busy += @intFromBool(used);
                    self.store.pool.mutex.unlock(self.store.io);
                    try writer.print("database | postgres | pool {d}/{d} in use | schema {d}\n", .{ busy, self.store.pool.connections.len, storage.schema_version });
                } else try writer.print("database | postgres | pool busy | schema {d}\n", .{storage.schema_version});
            } else try writer.print("database | sqlite | schema {d}\n", .{storage.schema_version});
            try writer.print("deps | zig {s} | object storage {s} | anticheat {s}\n", .{ builtin.zig_version_string, if (self.store.object_store.enabled()) "configured (not probed)" else "disabled", if (self.anticheat != null) "loaded" else "disabled" });
            try writer.print("pp | {s}\n", .{pp.engine_version});
            const maps = self.map_sync.metrics();
            const media = self.media_sync.metrics();
            try writer.print("maps | {d} fetches | {d} ok | {d} failed | {d} backed off | {d} capacity skips\n", .{ maps.attempts, maps.successes, maps.failures, maps.backoff_skips, maps.capacity_skips });
            try writer.print("mirror | {d} hits | {d} misses | {d} fills | {d} failed | {d} MiB served\n", .{ maps.mirror_hits, maps.mirror_misses, maps.mirror_fills, maps.mirror_failures, maps.mirror_bytes_served / (1024 * 1024) });
            try writer.print("media | {d} fetches | {d} ok | {d} failed | geo {d}/{d} active, {d} timeouts", .{ media.attempts, media.successes, media.failures, self.geo_gate.active.load(.acquire), self.geo_gate.limit, self.geo_gate.timed_out.load(.acquire) });
        }
    }.write };
}

fn writeProcess(allocator: std.mem.Allocator, io: std.Io, writer: *std.Io.Writer, uptime: i64) !void {
    if (comptime builtin.os.tag != .linux and builtin.os.tag != .macos) {
        try writer.writeAll("process | cpu and memory unavailable on this platform\n");
        return;
    }
    const usage = std.posix.getrusage(0);
    const cpu_seconds = @as(f64, @floatFromInt(usage.utime.sec + usage.stime.sec)) + @as(f64, @floatFromInt(usage.utime.usec + usage.stime.usec)) / 1_000_000;
    const average = if (uptime > 0) cpu_seconds / @as(f64, @floatFromInt(uptime)) * 100 else 0;
    const peak_bytes: u64 = @as(u64, @intCast(@max(usage.maxrss, 0))) * (if (builtin.os.tag == .macos) @as(u64, 1) else 1024);
    try writer.print("cpu | {d:.2}% average since start (100% = one core) | {d:.2}s cpu time\n", .{ average, cpu_seconds });
    if (comptime builtin.os.tag == .linux) {
        const bytes = std.Io.Dir.cwd().readFileAlloc(io, "/proc/self/status", allocator, .limited(16384)) catch {
            try writer.print("ram | current unavailable | peak {d} MiB\n", .{peak_bytes / (1024 * 1024)});
            return;
        };
        defer allocator.free(bytes);
        try writer.print("ram | rss {d} MiB | peak {d} MiB | virtual {d} MiB | swap {d} MiB | threads {d}\n", .{ value(bytes, "VmRSS:") / 1024, peak_bytes / (1024 * 1024), value(bytes, "VmSize:") / 1024, value(bytes, "VmSwap:") / 1024, value(bytes, "Threads:") });
    } else try writer.print("ram | current unavailable | peak {d} MiB\n", .{peak_bytes / (1024 * 1024)});
}

fn value(bytes: []const u8, key: []const u8) u64 {
    var lines = std.mem.splitScalar(u8, bytes, '\n');
    while (lines.next()) |line| {
        if (!std.mem.startsWith(u8, line, key)) continue;
        var words = std.mem.tokenizeAny(u8, line[key.len..], " \t\r");
        return std.fmt.parseInt(u64, words.next() orelse return 0, 10) catch 0;
    }
    return 0;
}

test "serverstats reads process fields without exposing unrelated values" {
    const fixture = "Name:\tprivate-name\nVmRSS:\t2048 kB\nVmSize:\t8192 kB\nVmSwap:\t0 kB\nThreads:\t12\n";
    try std.testing.expectEqual(@as(u64, 2048), value(fixture, "VmRSS:"));
    try std.testing.expectEqual(@as(u64, 12), value(fixture, "Threads:"));
    try std.testing.expectEqual(@as(u64, 0), value(fixture, "missing:"));
    var output: std.Io.Writer.Allocating = .init(std.testing.allocator);
    defer output.deinit();
    try writeProcess(std.testing.allocator, std.testing.io, &output.writer, 10);
    try std.testing.expect(std.mem.indexOf(u8, output.written(), "cpu") != null);
}
