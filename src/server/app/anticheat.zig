const d = @import("../deps.zig");
const std = d.std;
const builtin = d.builtin;
const domain = d.domain;
const storage = d.storage;
const sqlite_storage = d.sqlite_storage;
const sessions_mod = d.sessions_mod;
const bancho = d.bancho;
const lazer = d.lazer;
const lazer_bot = d.lazer_bot;
const lazer_multiplayer = d.lazer_multiplayer;
const lazer_notifications = d.lazer_notifications;
const lazer_spectator = d.lazer_spectator;
const multipart = d.multipart;
const score_crypto = d.score_crypto;
const stable_score = d.stable_score;
const stable_mods = d.stable_mods;
const stable_response = d.stable_response;
const server_control = d.server_control;
const server_control_route = d.server_control_route;
const account_roles = d.account_roles;
const achievements = d.achievements;
const changelog = d.changelog;
const lazer_wiki = d.lazer_wiki;
const rate_limit = d.rate_limit;
const pp = d.pp;
const pp_admin = d.pp_admin;
const screenshot = d.screenshot;
const index_page = d.index_page;
const form_urlencoded = d.form_urlencoded;
const registration = d.registration;
const routing = d.routing;
const beatmap_sync = d.beatmap_sync;
const beatmap_media = d.beatmap_media;
const bss = d.bss;
const irc = d.irc;
const media_contract = d.media_contract;
const webhook = d.webhook;
const protocol = d.protocol;
const country = d.country;
const log = d.log;
const config_mod = d.config_mod;
const web_auth = d.web_auth;
const proxy = d.proxy;
const user_json = d.user_json;
const upstream_user = d.upstream_user;
const profile_avatar = d.profile_avatar;
const profile_banner = d.profile_banner;
const team_image = d.team_image;
const avatar_cache = d.avatar_cache;
const r2 = d.r2;
const object_keys = d.object_keys;
const anticheat_abi = d.anticheat_abi;
const anticheat_evidence = d.anticheat_evidence;
const anticheat_plugin = d.anticheat_plugin;
const anticheat_replay = d.anticheat_replay;
const lazer_replay = @import("../../anticheat_lazer_replay.zig");
const anticheat_policy = @import("../../anticheat_policy.zig");
const player_routes = d.player_routes;
const http_boundary = d.http_boundary;
const stable_score_auth = d.stable_score_auth;
const stable_login = d.stable_login;
const default_avatar_1 = d.default_avatar_1;
const default_avatar_2 = d.default_avatar_2;
const lazer_access_lifetime_seconds = d.lazer_access_lifetime_seconds;
const lazer_refresh_lifetime_seconds = d.lazer_refresh_lifetime_seconds;

const support = @import("../support.zig");
const primitives = @import("../http/primitives.zig");
const respond = primitives.respond;
const header = primitives.header;
const freeUser = support.freeUser;
const rollbackFailedLazerLogin = support.rollbackFailedLazerLogin;
const randomMessageUuid = support.randomMessageUuid;
const parseWebsiteRoomPath = support.parseWebsiteRoomPath;
const parseTeamPath = support.parseTeamPath;
const parsePinPath = support.parsePinPath;
const ppNamespace = support.ppNamespace;
const lazerPpNamespace = support.lazerPpNamespace;
const staffPpComparisonJson = support.staffPpComparisonJson;
const lazerPerformance = support.lazerPerformance;
const intLines = support.intLines;
const validWebText = support.validWebText;
const validWebLine = support.validWebLine;
const validProfileWebsite = support.validProfileWebsite;
const stableClientPrivileges = support.stableClientPrivileges;
const scoreLog = support.scoreLog;
const announceScore = support.announceScore;
const announceLazerScore = support.announceLazerScore;

pub fn anticheatNamespace(mods: i32) u32 {
    if (mods & stable_mods.autopilot != 0) return anticheat_abi.Namespace.autopilot;
    if (mods & stable_mods.relax != 0) return anticheat_abi.Namespace.relax;
    if (mods & stable_mods.score_v2 != 0) return anticheat_abi.Namespace.score_v2;
    return anticheat_abi.Namespace.vanilla;
}

pub fn anticheatChecksExcluded(self: anytype, user_id: i32, source: storage.AnticheatSource) bool {
    // Never grant an exemption after a failed lookup. Read on each request so
    // expiry and revocation do not wait for a cache or restart.
    return self.store.anticheatChecksExcluded(user_id, source) catch |err| {
        std.log.warn("event=anticheat_exclusion_lookup_failed user_id={d} source={s} error={t}", .{ user_id, source.text(), err });
        return false;
    };
}

pub const LazerGameplayObservation = union(enum) {
    none,
    invalid_replay,
    missing_replay,
    result: struct { result: anticheat_abi.GameplayResultV1, evidence: u64 },
};

fn judgement(score: lazer.ScoreInput, name: []const u8) u32 {
    const value = score.statistics.get(name) orelse return 0;
    return if (value == .integer) @intCast(std.math.clamp(value.integer, 0, std.math.maxInt(u32))) else 0;
}

pub fn observeLazerGameplay(self: anytype, user_id: i32, score: lazer.ScoreInput, bytes: []const u8, mods_json: []const u8, performance: anytype) LazerGameplayObservation {
    if (self.anticheatChecksExcluded(user_id, .lazer_score)) return .none;
    if (bytes.len == 0) return if (score.passed) .missing_replay else .none;
    const timer = @import("../../telemetry.zig").Timer.start(.replay_analysis);
    defer timer.finish();
    const map = (self.store.beatmapFileById(self.allocator, @intCast(score.beatmap_id)) catch return .none) orelse return .none;
    defer self.allocator.free(map);
    var map_digest: [16]u8 = undefined;
    std.crypto.hash.Md5.hash(map, &map_digest, .{});
    const map_md5 = std.fmt.bytesToHex(map_digest, .lower);
    const info = lazer_replay.payload(bytes, @intCast(score.ruleset_id), &map_md5) catch |err| {
        std.log.warn("event=anticheat_lazer_replay_parse_failed user_id={d} ruleset={d} error={t}", .{ user_id, score.ruleset_id, err });
        return .invalid_replay;
    };
    if (score.ruleset_id != 0) {
        anticheat_replay.validatePayload(self.allocator, info.frames, @intCast(score.ruleset_id)) catch |err| return if (err == error.OutOfMemory) .none else .invalid_replay;
        return .none;
    }
    var prepared = anticheat_replay.prepare(self.allocator, info.frames, map, info.mods) catch |err| {
        std.log.warn("event=anticheat_lazer_replay_prepare_failed user_id={d} error={t}", .{ user_id, err });
        return if (err == error.InvalidReplay) .invalid_replay else .none;
    };
    defer prepared.deinit();
    const host = if (self.anticheat) |*loaded| loaded else return .none;
    const supported = lazer_replay.compatibleMods(mods_json);
    const authoritative_mods = if (supported) lazer_replay.legacyMods(mods_json) catch return .none else info.mods;
    // Never let a replay header claim RX/AP while the authenticated submission
    // says otherwise, or select different difficulty transforms for analysis.
    if (supported and (info.mods & ((1 << 1) | (1 << 4) | (1 << 7) | (1 << 13))) != (authoritative_mods & ((1 << 1) | (1 << 4) | (1 << 7) | (1 << 13)))) return .invalid_replay;
    const cadence = anticheat_replay.frameCadence(prepared.frames);
    const evidence = stableReplayShadowEvidence(score.passed, cadence.suspicious, 0);
    const base: anticheat_abi.EventV1 = .{
        .event_kind = anticheat_abi.EventKind.score,
        .client_family = anticheat_abi.ClientFamily.lazer,
        .ruleset = @intCast(score.ruleset_id),
        .namespace = switch (score.namespace) {
            .vanilla => anticheat_abi.Namespace.vanilla,
            .relax => anticheat_abi.Namespace.relax,
            .autopilot => anticheat_abi.Namespace.autopilot,
            .custom => anticheat_abi.Namespace.custom,
        },
        .event_flags = if (score.passed) anticheat_abi.EventFlag.passed | anticheat_abi.EventFlag.replay_required else 0,
        .evidence = evidence,
        .score = @intCast(score.total_score),
        .pp_milli = @intFromFloat(@min(performance.pp * 1000, @as(f64, 1e15))),
        .accuracy_ppm = @intFromFloat(@round(score.accuracy * 1_000_000)),
        .max_combo = @intCast(score.max_combo),
        .map_max_combo = performance.max_combo,
        .n300 = judgement(score, "great"),
        .n100 = judgement(score, "ok"),
        .n50 = judgement(score, "meh"),
        .nmiss = judgement(score, "miss"),
        .map_objects = if (supported) prepared.map_object_count else 0,
    };
    var result: anticheat_abi.GameplayResultV1 = .{};
    if (supported) {
        result = host.evaluateGameplay(.{
            .base = base,
            .mods = authoritative_mods,
            .passed_hits = base.n300 +| base.n100 +| base.n50,
            .hit_window_ms = prepared.hit_window_ms,
            .frames = prepared.frames.ptr,
            .frame_count = @intCast(prepared.frames.len),
            .objects = prepared.objects.ptr,
            .object_count = @intCast(prepared.objects.len),
        }) catch |err| {
            std.log.warn("event=anticheat_lazer_evaluation_failed user_id={d} error={t}", .{ user_id, err });
            return .none;
        };
        gateUnreliableCursorEvidence(&result);
    } else {
        result.decision = host.evaluate(base) catch return .none;
    }
    return .{ .result = .{ .result = result, .evidence = evidence } };
}

pub fn rejectLazerAnticheat(self: anytype, user_id: i32, score: lazer.ScoreInput, observation: LazerGameplayObservation) bool {
    if (!self.anticheat_enforce_integrity or !score.passed) return false;
    const reject = switch (observation) {
        .invalid_replay, .missing_replay => true,
        .result => |value| anticheat_policy.rejectScore(true, score.passed, value.result.decision),
        .none => false,
    };
    if (!reject) return false;
    switch (observation) {
        .result => |value| self.persistRejectedGameplayObservation(user_id, .lazer_score, value.evidence, 0, value.result),
        else => self.persistRejectedHostAnticheatObservation(user_id, .lazer_score, anticheat_evidence.stableReplay(if (std.meta.activeTag(observation) == .missing_replay) .missing else .invalid_payload, 0)),
    }
    std.log.warn("event=anticheat_score_rejected source=lazer user_id={d} beatmap_id={d} reason=score_integrity", .{ user_id, score.beatmap_id });
    return true;
}

pub fn persistLazerAnticheat(self: anytype, user_id: i32, score_id: i64, observation: LazerGameplayObservation) void {
    switch (observation) {
        .none => {},
        .invalid_replay, .missing_replay => self.persistHostAnticheatObservation(user_id, .lazer_score, score_id, anticheat_evidence.stableReplay(if (std.meta.activeTag(observation) == .missing_replay) .missing else .invalid_payload, 0)),
        .result => |value| {
            const sampled = value.result.decision.action == anticheat_abi.Action.allow and self.anticheat_allow_sample_modulus != 0 and @mod(score_id, @as(i64, self.anticheat_allow_sample_modulus)) == 0;
            if (value.result.decision.action != anticheat_abi.Action.allow or sampled) self.persistGameplayObservation(user_id, .lazer_score, score_id, if (sampled) self.anticheat_allow_sample_modulus else 1, value.evidence, 0, value.result);
        },
    }
}

pub fn stableScoreEvidence(score: stable_score.Submission) u64 {
    const flags = stable_score.clientFlags(score.client_flags);
    var evidence: u64 = 0;
    if (flags & (1 << 1) != 0) evidence |= anticheat_abi.Evidence.rate_anomaly;
    if (flags & ((1 << 4) | (1 << 5)) != 0) evidence |= anticheat_abi.Evidence.checksum_mismatch;
    if (flags & ((1 << 8) | (1 << 9) | (1 << 11) | (1 << 12) | (1 << 13)) != 0) evidence |= anticheat_abi.Evidence.high_confidence_client_flag;
    return evidence;
}

pub fn stableGameplayEvidence(score: stable_score.Submission, replay_match_count: u32) u64 {
    return stableScoreEvidence(score) | (if (replay_match_count != 0) anticheat_abi.Evidence.replay_hash_reused else 0);
}

pub fn stableReplayShadowEvidence(passed: bool, suspicious_cadence: bool, replay_content_match_count: u32) u64 {
    if (!passed) return 0;
    return (if (suspicious_cadence) anticheat_abi.Evidence.suspicious_frame_cadence else 0) |
        (if (replay_content_match_count != 0) anticheat_abi.Evidence.replay_content_reused else 0);
}

pub fn persistHostAnticheatObservation(self: anytype, user_id: i32, source: storage.AnticheatSource, score_id: ?i64, observation: anticheat_evidence.Observation) void {
    persistHostObservation(self, user_id, source, score_id, observation, false);
}

pub fn persistRejectedHostAnticheatObservation(self: anytype, user_id: i32, source: storage.AnticheatSource, observation: anticheat_evidence.Observation) void {
    persistHostObservation(self, user_id, source, null, observation, true);
}

fn persistHostObservation(self: anytype, user_id: i32, source: storage.AnticheatSource, score_id: ?i64, observation: anticheat_evidence.Observation, enforced: bool) void {
    _ = self.store.recordAnticheatObservation(user_id, .{
        .source = source,
        .module = anticheat_evidence.module_name,
        .score_id = if (source == .stable_score) score_id else null,
        .lazer_score_id = if (source == .lazer_score) score_id else null,
        .enforced = enforced,
        .action = observation.action,
        .reason = observation.reason,
        .risk_score = observation.risk_score,
        .confidence_bps = observation.confidence_bps,
        .evidence = observation.evidence,
        .replay_match_count = observation.replay_match_count,
        .decision_flags = observation.decision_flags,
        .rule_revision = observation.rule_revision,
    }) catch |err| {
        std.log.warn("event=anticheat_observation_write_failed module={s} source={s} user_id={d} score_id={d} error={t}", .{ anticheat_evidence.module_name, source.text(), user_id, score_id orelse 0, err });
    };
}

pub fn observeStableSignal(self: anytype, user_id: i32, source: storage.AnticheatSource, signal: anticheat_evidence.Signal) void {
    if (self.anticheatChecksExcluded(user_id, source)) return;
    const host = if (self.anticheat) |*loaded| loaded else {
        self.persistHostAnticheatObservation(user_id, source, null, signal.fallback);
        return;
    };
    const decision = host.evaluate(signal.event) catch |err| {
        std.log.warn("event=anticheat_module_evaluation_failed module={s} source={s} error={t}", .{ host.name(), source.text(), err });
        self.persistHostAnticheatObservation(user_id, source, null, signal.fallback);
        return;
    };
    if (decision.action == anticheat_abi.Action.allow) {
        self.persistHostAnticheatObservation(user_id, source, null, signal.fallback);
        return;
    }
    _ = self.store.recordAnticheatObservation(user_id, .{
        .source = source,
        .module = host.name(),
        .action = decision.action,
        .reason = decision.reason,
        .risk_score = decision.risk_score,
        .confidence_bps = decision.confidence_bps,
        .evidence = signal.event.evidence,
        .decision_flags = decision.flags,
        .rule_revision = decision.rule_revision,
    }) catch |err| {
        std.log.warn("event=anticheat_observation_write_failed module={s} source={s} user_id={d} score_id=0 error={t}", .{ host.name(), source.text(), user_id, err });
        return;
    };
    std.log.warn("event=anticheat_observation module={s} source={s} mode=observe proposed_action={d} reason={d} risk={d} confidence_bps={d}", .{ host.name(), source.text(), decision.action, decision.reason, decision.risk_score, decision.confidence_bps });
}

pub fn observeStableLogin(self: anytype, result: bancho.LoginResult) void {
    if (result.user_id <= 0) return;
    const signal = anticheat_evidence.stableLoginSignal(result.hardware_match_count, result.running_under_wine) orelse return;
    self.observeStableSignal(result.user_id, .stable_login, signal);
}

pub fn observeStableLastFmFlags(self: anytype, user_id: i32, flags: u32) void {
    const signal = anticheat_evidence.stableLastFmSignal(flags) orelse return;
    self.observeStableSignal(user_id, .stable_lastfm, signal);
}

pub const StableGameplayObservation = union(enum) {
    none,
    invalid_replay,
    result: struct {
        result: anticheat_abi.GameplayResultV1,
        evidence: u64,
        replay_content_digest: [32]u8,
        replay_content_match_count: u32,
    },
};

fn cursorFamilyReason(reason: u32) bool {
    return reason == anticheat_abi.Reason.aim_center_lock or
        reason == anticheat_abi.Reason.aim_snap_pattern or
        reason == anticheat_abi.Reason.aim_radial_lock or
        reason == anticheat_abi.Reason.aim_velocity_pattern;
}

pub fn gateUnreliableCursorEvidence(result: *anticheat_abi.GameplayResultV1) void {
    if (cursorFamilyReason(result.decision.reason)) {
        const rule_revision = result.decision.rule_revision;
        result.decision = .{ .rule_revision = rule_revision };
    } else if (result.decision.reason == anticheat_abi.Reason.combined_gameplay_anomalies) {
        result.decision.action = anticheat_abi.Action.audit;
        result.decision.flags = anticheat_abi.DecisionFlag.write_audit | anticheat_abi.DecisionFlag.require_staff_review;
    }
    result.center_hits_bps = 0;
    result.mean_center_distance_milli = 0;
    result.snap_events = 0;
    result.target_distance_stddev_milli = 0;
}

pub fn observeStableGameplay(self: anytype, user_id: i32, score: stable_score.Submission, replay: []const u8, map: []const u8, performance: pp.Output, elapsed_ms: u32, replay_match_count: u32) StableGameplayObservation {
    if (self.anticheatChecksExcluded(user_id, .stable_score)) return .none;
    if (replay.len == 0) return .none;
    const timer = @import("../../telemetry.zig").Timer.start(.replay_analysis);
    defer timer.finish();
    if (score.mode != 0) {
        anticheat_replay.validatePayload(self.allocator, replay, score.mode) catch |err| {
            std.log.warn("event=anticheat_replay_parse_failed user_id={d} ruleset={d} error={t}", .{ user_id, score.mode, err });
            return if (score.passed and err == error.InvalidReplay) .invalid_replay else .none;
        };
        return .none;
    }
    var prepared = anticheat_replay.prepare(self.allocator, replay, map, @intCast(score.mods)) catch |err| {
        std.log.warn("event=anticheat_replay_parse_failed user_id={d} error={t}", .{ user_id, err });
        return if (score.passed and err == error.InvalidReplay) .invalid_replay else .none;
    };
    defer prepared.deinit();
    const replay_content_digest = anticheat_replay.contentDigest(prepared.frames);
    const replay_content_match_count = if (score.passed) self.store.crossAccountReplayContentMatches(user_id, score.map_md5, score.mode, &replay_content_digest) catch |err| blk: {
        std.log.warn("event=anticheat_replay_content_match_lookup_failed user_id={d} error={t}", .{ user_id, err });
        break :blk 0;
    } else 0;
    const host = if (self.anticheat) |*loaded| loaded else return .none;
    const cadence = anticheat_replay.frameCadence(prepared.frames);
    const evidence = stableGameplayEvidence(score, replay_match_count) |
        stableReplayShadowEvidence(score.passed, cadence.suspicious, replay_content_match_count);
    if (cadence.suspicious) {
        std.log.warn("event=anticheat_suspicious_frame_cadence user_id={d} passed={} intervals={d} ignored_short={d} dominant_ms={d} dominant={d} distinct={d} duration_ms={d}", .{
            user_id,
            score.passed,
            cadence.interval_count,
            cadence.ignored_short_intervals,
            cadence.dominant_interval_ms,
            cadence.dominant_intervals,
            cadence.distinct_intervals,
            cadence.duration_ms,
        });
    }
    if (score.passed and replay_content_match_count != 0) {
        std.log.warn("event=anticheat_replay_content_reused user_id={d} cross_account_matches={d}", .{ user_id, replay_content_match_count });
    }
    const passed_hits_i64 = @as(i64, score.n300) + @as(i64, score.n100) + @as(i64, score.n50);
    const accuracy_ppm: u32 = @intFromFloat(@round(@min(1.0, @max(0.0, score.accuracy())) * 1_000_000.0));
    const pp_milli: u64 = @intFromFloat(@round(@min(performance.pp * 1000.0, @as(f64, @floatFromInt(std.math.maxInt(u64))))));
    const event_flags = (if (score.passed) anticheat_abi.EventFlag.passed else 0) |
        (if (score.passed) anticheat_abi.EventFlag.replay_required else 0);
    const event: anticheat_abi.GameplayEventV1 = .{
        .base = .{
            .event_kind = anticheat_abi.EventKind.score,
            .client_family = anticheat_abi.ClientFamily.stable,
            .ruleset = score.mode,
            .namespace = anticheatNamespace(score.mods),
            .event_flags = event_flags,
            .evidence = evidence,
            .score = @intCast(score.total_score),
            .pp_milli = pp_milli,
            .accuracy_ppm = accuracy_ppm,
            .max_combo = @intCast(score.max_combo),
            .map_max_combo = performance.max_combo,
            .n300 = @intCast(score.n300),
            .n100 = @intCast(score.n100),
            .n50 = @intCast(score.n50),
            .nmiss = @intCast(score.nmiss),
            .ngeki = @intCast(score.ngeki),
            .nkatu = @intCast(score.nkatu),
            .map_objects = prepared.map_object_count,
            .elapsed_ms = elapsed_ms,
            .map_duration_ms = prepared.map_duration_ms,
            .replay_match_count = replay_match_count,
        },
        .mods = @intCast(score.mods),
        .passed_hits = @intCast(@min(passed_hits_i64, @as(i64, std.math.maxInt(u32)))),
        .hit_window_ms = prepared.hit_window_ms,
        .frames = prepared.frames.ptr,
        .frame_count = @intCast(prepared.frames.len),
        .objects = prepared.objects.ptr,
        .object_count = @intCast(prepared.objects.len),
    };
    var result = host.evaluateGameplay(event) catch |err| {
        std.log.warn("event=anticheat_module_evaluation_failed module={s} error={t}", .{ host.name(), err });
        return .none;
    };
    if (!prepared.gameplay_coordinates_reliable) {
        const cursor_reason = cursorFamilyReason(result.decision.reason);
        const combined_reason = result.decision.reason == anticheat_abi.Reason.combined_gameplay_anomalies;
        gateUnreliableCursorEvidence(&result);
        if (cursor_reason or combined_reason) std.log.warn("event=anticheat_cursor_evidence_gated module={s} coordinate_space=raw_unstacked cursor_only={any}", .{ host.name(), cursor_reason });
    }
    if (result.decision.action != anticheat_abi.Action.allow) std.log.warn("event=anticheat_observation module={s} action={d} reason={d} risk={d} confidence_bps={d} objects={d} clicks={d}", .{
        host.name(), result.decision.action, result.decision.reason, result.decision.risk_score, result.decision.confidence_bps, result.objects_checked, result.matched_clicks,
    });
    return .{ .result = .{
        .result = result,
        .evidence = evidence,
        .replay_content_digest = replay_content_digest,
        .replay_content_match_count = replay_content_match_count,
    } };
}

pub fn persistAnticheatObservation(self: anytype, user_id: i32, score_id: i64, sample_weight: u32, evidence: u64, replay_match_count: u32, result: anticheat_abi.GameplayResultV1) void {
    persistGameplayObservation(self, user_id, .stable_score, score_id, sample_weight, evidence, replay_match_count, result);
}

pub fn persistGameplayObservation(self: anytype, user_id: i32, source: storage.AnticheatSource, score_id: ?i64, sample_weight: u32, evidence: u64, replay_match_count: u32, result: anticheat_abi.GameplayResultV1) void {
    persistGameplayObservationImpl(self, user_id, source, score_id, sample_weight, evidence, replay_match_count, result, false);
}

pub fn persistRejectedGameplayObservation(self: anytype, user_id: i32, source: storage.AnticheatSource, evidence: u64, replay_match_count: u32, result: anticheat_abi.GameplayResultV1) void {
    persistGameplayObservationImpl(self, user_id, source, null, 1, evidence, replay_match_count, result, true);
}

fn persistGameplayObservationImpl(self: anytype, user_id: i32, source: storage.AnticheatSource, score_id: ?i64, sample_weight: u32, evidence: u64, replay_match_count: u32, result: anticheat_abi.GameplayResultV1, enforced: bool) void {
    const host = if (self.anticheat) |*loaded| loaded else return;
    _ = self.store.recordAnticheatObservation(user_id, .{
        .source = source,
        .module = host.name(),
        .score_id = if (source == .stable_score) score_id else null,
        .lazer_score_id = if (source == .lazer_score) score_id else null,
        .enforced = enforced,
        .action = result.decision.action,
        .sample_weight = sample_weight,
        .reason = result.decision.reason,
        .risk_score = result.decision.risk_score,
        .confidence_bps = result.decision.confidence_bps,
        .evidence = evidence,
        .decision_flags = result.decision.flags,
        .rule_revision = result.decision.rule_revision,
        .objects_checked = result.objects_checked,
        .matched_clicks = result.matched_clicks,
        .mean_abs_timing_error_milli = result.mean_abs_timing_error_milli,
        .timing_stddev_milli = result.timing_stddev_milli,
        .exact_timing_bps = result.exact_timing_bps,
        .center_hits_bps = result.center_hits_bps,
        .mean_center_distance_milli = result.mean_center_distance_milli,
        .snap_events = result.snap_events,
        .replay_match_count = replay_match_count,
        .key_press_count = result.key_press_count,
        .key_hold_count = result.key_hold_count,
        .mean_hold_duration_milli = result.mean_hold_duration_milli,
        .hold_duration_stddev_milli = result.hold_duration_stddev_milli,
        .alternation_bps = result.alternation_bps,
        .target_distance_stddev_milli = result.target_distance_stddev_milli,
        .velocity_spike_count = result.velocity_spike_count,
        .movement_velocity_stddev_milli = result.movement_velocity_stddev_milli,
    }) catch |err| {
        std.log.warn("event=anticheat_observation_write_failed score_id={d} error={t}", .{ score_id orelse 0, err });
    };
}
