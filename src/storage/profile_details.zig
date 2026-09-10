const std = @import("std");
const domain = @import("../domain.zig");
const postgres = @import("../postgres.zig");
const c = @import("../storage.zig").c;

const stable_grade = "CASE WHEN s.mode IN(0,1) THEN CASE WHEN s.n300+s.n100+s.nmiss+CASE s.mode WHEN 0 THEN s.n50 ELSE 0 END=0 THEN 'N' WHEN s.n100+s.nmiss+CASE s.mode WHEN 0 THEN s.n50 ELSE 0 END=0 THEN 'X' WHEN s.n300*1.0/(s.n300+s.n100+s.nmiss+CASE s.mode WHEN 0 THEN s.n50 ELSE 0 END)>0.9 AND s.nmiss=0 AND (s.mode=1 OR s.n50*1.0/(s.n300+s.n100+s.n50+s.nmiss)<=0.01) THEN 'S' WHEN (s.n300*1.0/(s.n300+s.n100+s.nmiss+CASE s.mode WHEN 0 THEN s.n50 ELSE 0 END)>0.8 AND s.nmiss=0) OR s.n300*1.0/(s.n300+s.n100+s.nmiss+CASE s.mode WHEN 0 THEN s.n50 ELSE 0 END)>0.9 THEN 'A' ELSE 'other' END WHEN s.accuracy>=1 THEN 'X' WHEN (s.mode=2 AND s.accuracy>0.98) OR (s.mode=3 AND s.accuracy>0.95) THEN 'S' WHEN (s.mode=2 AND s.accuracy>0.94) OR (s.mode=3 AND s.accuracy>0.9) THEN 'A' ELSE 'other' END";
const plays = "WITH plays AS (SELECT s.id,'stable' client,b.id beatmap_id,b.set_id,s.pp,s.passed,b.status,s.submitted_at,s.n300+s.n100+s.n50+CASE WHEN s.mode IN(1,3) THEN s.ngeki+s.nkatu ELSE 0 END hits,(s.mods&1032)!=0 hidden," ++ stable_grade ++ " grade FROM zigcho.scores s JOIN zigcho.beatmaps b ON b.md5=s.map_md5 WHERE s.user_id=$1 AND s.mode=$2 AND s.rank_namespace=$4 AND $3 IN('all','stable','scorev2') UNION ALL SELECT s.id,'lazer',s.beatmap_id,b.set_id,s.pp,s.passed,b.status,s.submitted_at,coalesce(CAST(s.statistics_json->>'meh' AS BIGINT),0)+coalesce(CAST(s.statistics_json->>'ok' AS BIGINT),0)+coalesce(CAST(s.statistics_json->>'good' AS BIGINT),0)+coalesce(CAST(s.statistics_json->>'great' AS BIGINT),0)+coalesce(CAST(s.statistics_json->>'perfect' AS BIGINT),0),false,s.rank FROM zigcho.lazer_scores s JOIN zigcho.beatmaps b ON b.id=s.beatmap_id WHERE s.user_id=$1 AND s.ruleset_id=$2 AND s.rank_namespace=$4 AND $3 IN('all','lazer')) ";

const Rows = struct {
    arena: std.heap.ArenaAllocator,
    items: []const []const []const u8,

    fn deinit(self: *Rows) void {
        self.arena.deinit();
    }
};

fn sqliteSql(comptime sql: []const u8) [:0]const u8 {
    return comptime blk: {
        @setEvalBranchQuota(100000);
        var result: [sql.len]u8 = undefined;
        var size: usize = 0;
        var i: usize = 0;
        while (i < sql.len) {
            if (std.mem.startsWith(u8, sql[i..], "zigcho.")) {
                i += 7;
                continue;
            }
            result[size] = if (sql[i] == '$') '?' else sql[i];
            size += 1;
            i += 1;
        }
        break :blk (result[0..size].* ++ .{0})[0..size :0];
    };
}

fn query(store: anytype, allocator: std.mem.Allocator, comptime sql: [:0]const u8, params: []const []const u8) !Rows {
    var arena: std.heap.ArenaAllocator = .init(allocator);
    errdefer arena.deinit();
    const a = arena.allocator();
    var rows: std.ArrayList([]const []const u8) = .empty;
    if (@hasField(@TypeOf(store.*), "pool")) {
        var lease = store.pool.acquire();
        defer lease.release();
        const values = try a.alloc(?[]const u8, params.len);
        for (params, values) |p, *value| value.* = p;
        var result = try postgres.queryParams(a, lease.conn, sql, values);
        defer result.deinit();
        for (0..result.rows()) |r| {
            const fields = try a.alloc([]const u8, result.columns());
            for (fields, 0..) |*field, column| field.* = try a.dupe(u8, result.value(r, column));
            try rows.append(a, fields);
        }
    } else {
        store.mutex.lockUncancelable(store.io);
        defer store.mutex.unlock(store.io);
        var stmt: ?*c.sqlite3_stmt = null;
        if (c.sqlite3_prepare_v2(store.db, sqliteSql(sql), -1, &stmt, null) != c.SQLITE_OK) return error.DatabaseQueryFailed;
        defer _ = c.sqlite3_finalize(stmt);
        for (params, 1..) |p, index| {
            if (c.sqlite3_bind_text(stmt, @intCast(index), p.ptr, @intCast(p.len), null) != c.SQLITE_OK) return error.DatabaseQueryFailed;
        }
        while (true) {
            const status = c.sqlite3_step(stmt);
            if (status == c.SQLITE_DONE) break;
            if (status != c.SQLITE_ROW) return error.DatabaseQueryFailed;
            const fields = try a.alloc([]const u8, @intCast(c.sqlite3_column_count(stmt)));
            for (fields, 0..) |*field, column| {
                const ptr = c.sqlite3_column_text(stmt, @intCast(column));
                const len: usize = @intCast(c.sqlite3_column_bytes(stmt, @intCast(column)));
                field.* = try a.dupe(u8, if (len == 0) "" else ptr[0..len]);
            }
            try rows.append(a, fields);
        }
    }
    const items = try rows.toOwnedSlice(a);
    return .{ .arena = arena, .items = items };
}

pub const Filter = struct {
    source: domain.SiteScoreSource,
    mode: u8,

    fn params(self: Filter, user_id: i32, buffers: *[2][24]u8) ![4][]const u8 {
        if (!domain.validSiteMode(self.source, self.mode)) return error.InvalidScoreSource;
        return .{ try std.fmt.bufPrint(&buffers[0], "{d}", .{user_id}), try std.fmt.bufPrint(&buffers[1], "{d}", .{domain.siteScoreMode(self.mode)}), @tagName(self.source), domain.siteNamespace(self.source, self.mode) };
    }
};

pub fn metrics(store: anytype, allocator: std.mem.Allocator, user_id: i32, filter: Filter) ![]u8 {
    var buffers: [2][24]u8 = undefined;
    const params = try filter.params(user_id, &buffers);
    var totals = try query(store, allocator, plays ++ "SELECT coalesce(sum(hits),0),count(DISTINCT beatmap_id) FROM plays", &params);
    defer totals.deinit();
    var grades = try query(store, allocator, plays ++ ", best AS (SELECT *,row_number() OVER(PARTITION BY beatmap_id ORDER BY pp DESC,CASE client WHEN 'stable' THEN 0 ELSE 1 END,id ASC) place FROM plays WHERE passed AND status IN(3,4)) SELECT CASE WHEN hidden AND grade IN('X','S') THEN grade||'H' ELSE grade END,count(*) FROM best WHERE place=1 GROUP BY 1", &params);
    defer grades.deinit();
    var counts: [5]i64 = @splat(0);
    for (grades.items) |row| for ([_][]const u8{ "XH", "X", "SH", "S", "A" }, 0..) |grade, index| {
        if (std.mem.eql(u8, grade, row[0])) counts[index] = try std.fmt.parseInt(i64, row[1], 10);
    };
    return std.fmt.allocPrint(allocator, "{{\"total_hits\":{s},\"played_beatmap_count\":{s},\"grade_ssh\":{d},\"grade_ss\":{d},\"grade_sh\":{d},\"grade_s\":{d},\"grade_a\":{d}}}", .{ totals.items[0][0], totals.items[0][1], counts[0], counts[1], counts[2], counts[3], counts[4] });
}

pub fn monthly(store: anytype, allocator: std.mem.Allocator, user_id: i32, filter: Filter, replays: bool) ![]u8 {
    var buffers: [2][24]u8 = undefined;
    var params = try filter.params(user_id, &buffers);
    const pg = @hasField(@TypeOf(store.*), "pool");
    const month = if (pg) "to_char(to_timestamp(submitted_at) AT TIME ZONE 'UTC','YYYY-MM-01')" else "strftime('%Y-%m-01',submitted_at,'unixepoch')";
    const replay_month = if (pg) "to_char(to_timestamp(viewed_at) AT TIME ZONE 'UTC','YYYY-MM-01')" else "strftime('%Y-%m-01',viewed_at,'unixepoch')";
    if (replays) params[1] = try std.fmt.bufPrint(&buffers[1], "{d}", .{filter.mode});
    var rows = if (replays)
        try query(store, allocator, "SELECT " ++ replay_month ++ " AS period,count(*) FROM zigcho.score_replay_views WHERE owner_id=$1 AND mode=$2 AND rank_namespace=$4 AND ($3='all' OR ($3='scorev2' AND source='stable') OR source=$3) GROUP BY 1 ORDER BY 1 DESC LIMIT 24", &params)
    else
        try query(store, allocator, plays ++ "SELECT " ++ month ++ " AS period,count(*) FROM plays GROUP BY 1 ORDER BY 1 DESC LIMIT 24", &params);
    defer rows.deinit();
    var output: std.Io.Writer.Allocating = .init(allocator);
    defer output.deinit();
    try output.writer.writeByte('[');
    for (0..rows.items.len) |index| {
        const row = rows.items[rows.items.len - index - 1];
        if (index != 0) try output.writer.writeByte(',');
        try output.writer.writeAll("{\"start_date\":");
        try std.json.Stringify.value(row[0], .{}, &output.writer);
        try output.writer.print(",\"count\":{s}}}", .{row[1]});
    }
    try output.writer.writeByte(']');
    var list = output.toArrayList();
    return list.toOwnedSlice(allocator);
}

pub fn collection(store: anytype, allocator: std.mem.Allocator, user_id: i32, filter: Filter, activity: bool, offset: u16) ![]u8 {
    var buffers: [2][24]u8 = undefined;
    const base = try filter.params(user_id, &buffers);
    var offset_buffer: [16]u8 = undefined;
    const params = base ++ .{try std.fmt.bufPrint(&offset_buffer, "{d}", .{offset})};
    const columns = " SELECT p.beatmap_id,p.set_id,b.artist,b.title,b.version,";
    var rows = if (activity)
        try query(store, allocator, plays ++ columns ++ "p.submitted_at,p.client,p.id,CASE WHEN p.passed THEN 'passed' ELSE 'failed' END FROM plays p JOIN zigcho.beatmaps b ON b.id=p.beatmap_id ORDER BY p.submitted_at DESC,p.id DESC,p.client LIMIT 25 OFFSET $5", &params)
    else
        try query(store, allocator, plays ++ ", counts AS (SELECT beatmap_id,set_id,count(*) count FROM plays GROUP BY beatmap_id,set_id)" ++ columns ++ "p.count FROM counts p JOIN zigcho.beatmaps b ON b.id=p.beatmap_id ORDER BY p.count DESC,p.beatmap_id LIMIT 25 OFFSET $5", &params);
    defer rows.deinit();
    var output: std.Io.Writer.Allocating = .init(allocator);
    defer output.deinit();
    try output.writer.writeByte('[');
    for (rows.items, 0..) |row, index| {
        if (index != 0) try output.writer.writeByte(',');
        try output.writer.print("{{\"beatmap_id\":{s},\"set_id\":{s},\"artist\":", .{ row[0], row[1] });
        try std.json.Stringify.value(row[2], .{}, &output.writer);
        try output.writer.writeAll(",\"title\":");
        try std.json.Stringify.value(row[3], .{}, &output.writer);
        try output.writer.writeAll(",\"version\":");
        try std.json.Stringify.value(row[4], .{}, &output.writer);
        if (activity) {
            try output.writer.print(",\"submitted_at\":{s},\"client\":\"{s}\",\"score_id\":{s},\"passed\":{s}", .{ row[5], row[6], row[7], if (std.mem.eql(u8, row[8], "passed")) "true" else "false" });
        } else try output.writer.print(",\"count\":{s}", .{row[5]});
        try output.writer.writeByte('}');
    }
    try output.writer.writeByte(']');
    var list = output.toArrayList();
    return list.toOwnedSlice(allocator);
}
