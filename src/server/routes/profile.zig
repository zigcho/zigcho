const std = @import("std");
const domain = @import("../../domain.zig");
const auth = @import("../../web_auth.zig");
const access_mod = @import("../../profile_access.zig");
const form = @import("../../form_urlencoded.zig");
const Context = @import("../http/context.zig").Context;
const http = @import("../http/primitives.zig");
const details = @import("../../storage/profile_details.zig");
const no_store = [_]std.http.Header{ .{ .name = "cache-control", .value = "private, no-store" }, .{ .name = "vary", .value = "Cookie" } };

pub fn handle(self: anytype, req: *std.http.Server.Request, ctx: *const Context) !bool {
    const prefix = "/api/v1/users/";
    if (!std.mem.startsWith(u8, ctx.path, prefix)) return false;
    const rest = ctx.path[prefix.len..];
    const slash = std.mem.indexOfScalar(u8, rest, '/') orelse return false;
    const kind = rest[slash + 1 ..];
    if (!std.mem.eql(u8, kind, "details") and !std.mem.eql(u8, kind, "collection") and !std.mem.eql(u8, kind, "relationship") and !std.mem.eql(u8, kind, "score")) return false;
    if (!auth.websiteHost(ctx.host_owned)) {
        try http.respond(req, .not_found, "application/json", "{\"error\":\"not found\"}", &no_store);
        return true;
    }
    const id = std.fmt.parseInt(i32, rest[0..slash], 10) catch 0;
    const target = (if (id > 0) try self.store.userById(self.allocator, id) else null) orelse {
        try http.respond(req, .not_found, "application/json", "{\"error\":\"player not found\"}", &no_store);
        return true;
    };
    defer self.allocator.free(target.name);
    defer self.allocator.free(target.safe_name);
    const access = try access_mod.resolve(&self.store, self.allocator, ctx.cookie_owned, id);
    if (target.restricted and !access.privateView()) {
        try http.respond(req, .not_found, "application/json", "{\"error\":\"player not found\"}", &no_store);
        return true;
    }
    if (std.mem.eql(u8, kind, "relationship")) {
        try relationship(self, req, ctx, target);
        return true;
    }
    if (req.head.method != .GET) {
        try http.respond(req, .method_not_allowed, "application/json", "{\"error\":\"method not allowed\"}", &no_store);
        return true;
    }
    const summary = (try self.store.lazerProfileSummary(id)) orelse {
        try http.respond(req, .not_found, "application/json", "{\"error\":\"player not found\"}", &no_store);
        return true;
    };
    const stats_visible = access.privateView() or summary.show_profile_stats;
    const recent_visible = access.privateView() or summary.show_recent_scores;
    if (std.mem.eql(u8, kind, "score")) {
        const client = http.queryField(ctx.target, "client") orelse "";
        const score_id = std.fmt.parseInt(i64, http.queryField(ctx.target, "id") orelse "0", 10) catch 0;
        if (score_id <= 0 or (!std.mem.eql(u8, client, "stable") and !std.mem.eql(u8, client, "lazer"))) {
            try http.respond(req, .bad_request, "application/json", "{\"error\":\"invalid score\"}", &no_store);
            return true;
        }
        const json = (try details.scoreJudgements(&self.store, self.allocator, id, score_id, std.mem.eql(u8, client, "lazer"), recent_visible, stats_visible)) orelse {
            try http.respond(req, .not_found, "application/json", "{\"error\":\"score not available\"}", &no_store);
            return true;
        };
        defer self.allocator.free(json);
        try http.respond(req, .ok, "application/json", json, &no_store);
        return true;
    }
    const source = std.meta.stringToEnum(domain.SiteScoreSource, http.queryField(ctx.target, "source") orelse "all");
    const mode = std.fmt.parseInt(u8, http.queryField(ctx.target, "mode") orelse "0", 10) catch 255;
    if (source == null or !domain.validSiteMode(source.?, mode)) {
        try http.respond(req, .bad_request, "application/json", "{\"error\":\"invalid score view\"}", &no_store);
        return true;
    }
    const filter: details.Filter = .{ .source = source.?, .mode = mode };
    if (std.mem.eql(u8, kind, "collection")) {
        const collection = http.queryField(ctx.target, "kind") orelse "all";
        const offset = std.fmt.parseInt(u16, http.queryField(ctx.target, "offset") orelse "0", 10) catch 65535;
        if (offset > 10000 or offset % 25 != 0) {
            try http.respond(req, .bad_request, "application/json", "{\"error\":\"invalid page\"}", &no_store);
            return true;
        }
        var output: std.Io.Writer.Allocating = .init(self.allocator);
        defer output.deinit();
        if (std.mem.eql(u8, collection, "most_played") or std.mem.eql(u8, collection, "activity")) {
            if (!recent_visible or (std.mem.eql(u8, collection, "most_played") and !stats_visible)) {
                try http.respond(req, .ok, "application/json", "[]", &no_store);
                return true;
            }
            const json = try details.collection(&self.store, self.allocator, id, filter, std.mem.eql(u8, collection, "activity"), offset);
            defer self.allocator.free(json);
            try output.writer.writeAll(json);
        } else if (std.mem.eql(u8, collection, "favourite")) {
            const ids = try self.store.favouriteSetIds(self.allocator, id);
            defer self.allocator.free(ids);
            try output.writer.writeByte('[');
            var count: usize = 0;
            for (ids[@min(offset, ids.len)..@min(ids.len, @as(usize, offset) + 25)]) |set_id| {
                const set = (try self.store.lazerBeatmapSet(self.allocator, set_id, access.viewer_id)) orelse continue;
                defer self.allocator.free(set);
                if (count != 0) try output.writer.writeByte(',');
                try output.writer.writeAll(set);
                count += 1;
            }
            try output.writer.writeByte(']');
        } else {
            const allowed = [_][]const u8{ "all", "ranked", "loved", "pending", "graveyard", "nominated", "guest" };
            var valid = false;
            for (allowed) |value| valid = valid or std.mem.eql(u8, collection, value);
            if (!valid) {
                try http.respond(req, .bad_request, "application/json", "{\"error\":\"invalid collection\"}", &no_store);
                return true;
            }
            const sets = try self.store.lazerUserBeatmapSetsJson(self.allocator, id, collection, offset, 25, access.viewer_id);
            defer self.allocator.free(sets);
            try output.writer.writeAll(sets);
        }
        try http.respond(req, .ok, "application/json", output.written(), &no_store);
        return true;
    }
    const metrics = if (stats_visible) try details.metrics(&self.store, self.allocator, id, filter) else try self.allocator.dupe(u8, "null");
    defer self.allocator.free(metrics);
    const monthly = if (stats_visible and recent_visible) try details.monthly(&self.store, self.allocator, id, filter, false) else try self.allocator.dupe(u8, "[]");
    defer self.allocator.free(monthly);
    const watched = if (stats_visible and recent_visible) try details.monthly(&self.store, self.allocator, id, filter, true) else try self.allocator.dupe(u8, "[]");
    defer self.allocator.free(watched);
    var output: std.Io.Writer.Allocating = .init(self.allocator);
    defer output.deinit();
    try output.writer.writeAll("{\"metrics\":");
    try output.writer.writeAll(metrics);
    try output.writer.print(",\"last_visit\":{d},\"preferred_mode\":{d},\"favourite_count\":{d},\"ranked_count\":{d},\"loved_count\":{d},\"pending_count\":{d},\"graveyard_count\":{d},\"nominated_count\":{d},\"guest_count\":{d},\"monthly_playcounts\":", .{ summary.last_visit, summary.preferred_mode, summary.favourite_count, summary.ranked_count, summary.loved_count, summary.pending_count, summary.graveyard_count, summary.nominated_count, summary.guest_count });
    try output.writer.writeAll(monthly);
    try output.writer.writeAll(",\"replays_watched_counts\":");
    try output.writer.writeAll(watched);
    try output.writer.writeByte('}');
    try http.respond(req, .ok, "application/json", output.written(), &no_store);
    return true;
}

fn relationship(self: anytype, req: *std.http.Server.Request, ctx: *const Context, target: domain.User) !void {
    const token = auth.playerSessionToken(ctx.cookie_owned) orelse return http.respond(req, .unauthorized, "application/json", "{\"error\":\"sign in required\"}", &no_store);
    const actor = (try self.store.authenticateToken(self.allocator, token, auth.player_scope)) orelse return http.respond(req, .unauthorized, "application/json", "{\"error\":\"session ended\"}", &no_store);
    defer self.allocator.free(actor.name);
    defer self.allocator.free(actor.safe_name);
    if (req.head.method == .POST) {
        if (!auth.sameOrigin(ctx.origin_owned, ctx.host_owned) or !auth.csrfMatches(token, ctx.csrf_owned)) return http.respond(req, .forbidden, "application/json", "{\"error\":\"invalid request\"}", &no_store);
        if (actor.restricted or target.restricted or actor.id == target.id or target.id == 3) return http.respond(req, .forbidden, "application/json", "{\"error\":\"relationship cannot be changed\"}", &no_store);
        const action = (try form.requestField(self.allocator, ctx.body, ctx.content_type_owned, &.{"action"})) orelse return http.respond(req, .bad_request, "application/json", "{\"error\":\"action required\"}", &no_store);
        defer self.allocator.free(action);
        if (std.mem.eql(u8, action, "follow")) {
            if (try self.store.addFriend(actor.id, target.id) == .ineligible) return http.respond(req, .forbidden, "application/json", "{\"error\":\"player cannot be followed\"}", &no_store);
        } else if (std.mem.eql(u8, action, "unfollow")) {
            _ = try self.store.removeFriend(actor.id, target.id);
        } else if (std.mem.eql(u8, action, "block")) {
            _ = try self.store.addBlock(actor.id, target.id);
        } else if (std.mem.eql(u8, action, "unblock")) {
            _ = try self.store.removeBlock(actor.id, target.id);
        } else return http.respond(req, .bad_request, "application/json", "{\"error\":\"invalid action\"}", &no_store);
    } else if (req.head.method != .GET) return http.respond(req, .method_not_allowed, "application/json", "{\"error\":\"method not allowed\"}", &no_store);
    const friends = try self.store.friendIds(self.allocator, actor.id);
    defer self.allocator.free(friends);
    const blocks = try self.store.blockIds(self.allocator, actor.id);
    defer self.allocator.free(blocks);
    var buffer: [180]u8 = undefined;
    const json = try std.fmt.bufPrint(&buffer, "{{\"following\":{},\"blocked\":{},\"mutual\":{},\"can_change\":{}}}", .{ std.mem.indexOfScalar(i32, friends, target.id) != null, std.mem.indexOfScalar(i32, blocks, target.id) != null, try self.store.friendsAreMutual(actor.id, target.id), !actor.restricted and !target.restricted and actor.id != target.id and target.id != 3 });
    return http.respond(req, .ok, "application/json", json, &no_store);
}
