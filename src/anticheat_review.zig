const std = @import("std");
const abi = @import("anticheat_abi.zig");

const CodeInfo = struct {
    name: []const u8,
    description: []const u8,
};

pub const Metrics = struct {
    input_basis: ?abi.InputBasis = null,
    objects_checked: u32 = 0,
    matched_clicks: u32 = 0,
    mean_abs_timing_error_milli: u32 = 0,
    timing_stddev_milli: u32 = 0,
    exact_timing_bps: u32 = 0,
    center_hits_bps: u32 = 0,
    mean_center_distance_milli: u32 = 0,
    snap_events: u32 = 0,
    replay_match_count: u32 = 0,
    key_press_count: u32 = 0,
    key_hold_count: u32 = 0,
    mean_hold_duration_milli: u32 = 0,
    hold_duration_stddev_milli: u32 = 0,
    alternation_bps: u32 = 0,
    target_distance_stddev_milli: u32 = 0,
    velocity_spike_count: u32 = 0,
    movement_velocity_stddev_milli: u32 = 0,
};

pub const Observation = struct {
    module: []const u8 = "",
    enforced: bool = false,
    action: u32,
    reason: u32,
    risk_score: u32,
    confidence_bps: u32,
    evidence: u64,
    decision_flags: u64,
    rule_revision: u32,
    metrics: Metrics = .{},
};

fn actionInfo(code: u32) ?CodeInfo {
    return switch (code) {
        abi.Action.allow => .{ .name = "allow", .description = "the module found no action worth proposing" },
        abi.Action.audit => .{ .name = "audit", .description = "the module proposes staff review" },
        abi.Action.challenge => .{ .name = "challenge", .description = "the module proposes challenging or holding the score for review" },
        abi.Action.restrict => .{ .name = "restrict", .description = "the module proposes restricting the account and ending its game session" },
        else => null,
    };
}

fn reasonInfo(code: u32) ?CodeInfo {
    return switch (code) {
        abi.Reason.none => .{ .name = "none", .description = "no detection rule selected a reason" },
        abi.Reason.known_cheat_signature => .{ .name = "known cheat signature", .description = "normalized client evidence matched a known cheat signature" },
        abi.Reason.client_integrity_mismatch => .{ .name = "client integrity mismatch", .description = "normalized client integrity evidence did not match the expected client" },
        abi.Reason.high_confidence_client_flag => .{ .name = "high confidence client flag", .description = "the Stable client reported a high confidence integrity signal" },
        abi.Reason.exact_hardware_match => .{ .name = "exact hardware match", .description = "the Stable login hardware matched one or more other accounts exactly" },
        abi.Reason.impossible_accuracy => .{ .name = "impossible accuracy", .description = "the submitted accuracy is outside the valid range" },
        abi.Reason.impossible_hit_totals => .{ .name = "impossible hit totals", .description = "the submitted hit counts do not fit the beatmap object count" },
        abi.Reason.impossible_combo => .{ .name = "impossible combo", .description = "the submitted combo is above the beatmap maximum" },
        abi.Reason.checksum_mismatch => .{ .name = "checksum mismatch", .description = "a normalized score or client checksum signal did not match" },
        abi.Reason.replay_hash_reused => .{ .name = "replay reused across accounts", .description = "the same passed replay payload appeared on another account for the same map and mode" },
        abi.Reason.required_replay_missing => .{ .name = "required replay missing", .description = "a passed score arrived without its required replay" },
        abi.Reason.combined_anomalies => .{ .name = "combined anomalies", .description = "multiple independent score or client signals were present together" },
        abi.Reason.invalid_replay_payload => .{ .name = "invalid replay payload", .description = "the replay could not be decoded or validated safely" },
        abi.Reason.replay_score_mismatch => .{ .name = "replay score mismatch", .description = "native replay statistics, mods or other score claims disagree with the submitted score; this is not a re-scored cheat verdict" },
        abi.Reason.replay_content_reused => .{ .name = "replay content reused", .description = "normalized replay content matched another account after volatile metadata was removed" },
        abi.Reason.timing_outlier => .{ .name = "timing outlier", .description = "score or replay timing was outside the ordinary shape" },
        abi.Reason.pp_outlier => .{ .name = "performance outlier", .description = "performance value was unusual for the supplied score evidence" },
        abi.Reason.multiaccount_cluster => .{ .name = "multiaccount cluster", .description = "normalized evidence links the account to a wider account cluster" },
        abi.Reason.rate_anomaly => .{ .name = "rate anomaly", .description = "the client reported a suspicious playback-rate condition" },
        abi.Reason.registry_remnant => .{ .name = "registry remnant", .description = "the Stable client reported a known registry remnant" },
        abi.Reason.duplicate_score => .{ .name = "duplicate score", .description = "the submitted score duplicates an existing score signal" },
        abi.Reason.suspicious_frame_cadence => .{ .name = "frame cadence review", .description = "sustained low frame intervals outside key transitions in a supported complete Stable play; uncalibrated review cue, not proof of timewarp" },
        abi.Reason.relax_keyless_play => .{ .name = "keyless play pattern", .description = "the replay hit objects without the expected physical key input" },
        abi.Reason.relax_timing_lock => .{ .name = "timing lock pattern", .description = "replay hit timing is unusually exact and tightly grouped" },
        abi.Reason.relax_hold_lock => .{ .name = "hold lock pattern", .description = "key hold lengths and alternation are unusually consistent together" },
        abi.Reason.relax_alternation_lock => .{ .name = "alternation lock pattern", .description = "key input alternates with unusually little variation" },
        abi.Reason.aim_center_lock => .{ .name = "aim centre lock", .description = "cursor landings cluster unusually close to object centres" },
        abi.Reason.aim_snap_pattern => .{ .name = "aim snap pattern", .description = "cursor movement repeatedly snaps into object centres" },
        abi.Reason.aim_radial_lock => .{ .name = "aim radial lock", .description = "cursor landings keep an unusually fixed distance from object centres" },
        abi.Reason.aim_velocity_pattern => .{ .name = "aim velocity pattern", .description = "cursor speed changes form an unusual repeated pattern" },
        abi.Reason.combined_gameplay_anomalies => .{ .name = "combined gameplay anomalies", .description = "multiple independent replay behaviour signals were present together" },
        else => null,
    };
}

fn observationReasonInfo(observation: Observation) ?CodeInfo {
    if (observation.reason == abi.Reason.suspicious_frame_cadence and
        (!std.mem.eql(u8, observation.module, "zigcho-private-anticheat-v1") or observation.rule_revision < 7 or observation.evidence & abi.Evidence.suspicious_frame_cadence != 0))
        return .{ .name = "historical frame cadence review", .description = "older host frame-interval histogram signal; key-transition context and current cadence support were not recorded, so this is not evidence of timewarp" };
    return reasonInfo(observation.reason);
}

const BitInfo = struct {
    mask: u64,
    name: []const u8,
    description: []const u8,
};

const evidence_bits = [_]BitInfo{
    .{ .mask = abi.Evidence.exact_hardware_match, .name = "exact hardware match", .description = "normalized hardware matched another account" },
    .{ .mask = abi.Evidence.high_confidence_client_flag, .name = "high confidence client flag", .description = "Stable supplied a high confidence client signal" },
    .{ .mask = abi.Evidence.registry_remnant, .name = "registry remnant", .description = "Stable supplied a known registry remnant signal" },
    .{ .mask = abi.Evidence.running_under_wine, .name = "running under Wine", .description = "the client reported Wine; this is context, not cheating by itself" },
    .{ .mask = abi.Evidence.required_replay_missing, .name = "required replay missing", .description = "a passed score did not include its required replay" },
    .{ .mask = abi.Evidence.replay_hash_reused, .name = "replay hash reused", .description = "a passed replay hash matched another account on the same map and mode" },
    .{ .mask = abi.Evidence.impossible_hit_totals, .name = "impossible hit totals", .description = "hit counts exceed or contradict the map shape" },
    .{ .mask = abi.Evidence.impossible_accuracy, .name = "impossible accuracy", .description = "accuracy contradicts the supplied hit counts" },
    .{ .mask = abi.Evidence.impossible_combo, .name = "impossible combo", .description = "combo exceeds the known map maximum" },
    .{ .mask = abi.Evidence.timing_outlier, .name = "timing outlier", .description = "timing evidence is outside the ordinary shape" },
    .{ .mask = abi.Evidence.pp_outlier, .name = "performance outlier", .description = "performance evidence is outside the ordinary shape" },
    .{ .mask = abi.Evidence.client_integrity_mismatch, .name = "client integrity mismatch", .description = "normalized integrity evidence did not match" },
    .{ .mask = abi.Evidence.known_cheat_signature, .name = "known cheat signature", .description = "normalized evidence matched a known signature" },
    .{ .mask = abi.Evidence.multiaccount_cluster, .name = "multiaccount cluster", .description = "normalized evidence links multiple accounts" },
    .{ .mask = abi.Evidence.duplicate_score, .name = "duplicate score", .description = "score evidence duplicates another submission" },
    .{ .mask = abi.Evidence.checksum_mismatch, .name = "checksum mismatch", .description = "a submitted checksum signal did not match" },
    .{ .mask = abi.Evidence.rate_anomaly, .name = "rate anomaly", .description = "the client reported an unusual playback rate" },
    .{ .mask = abi.Evidence.replay_content_reused, .name = "replay content reused", .description = "normalized replay content matched another account after volatile metadata was removed" },
    .{ .mask = abi.Evidence.suspicious_frame_cadence, .name = "historical host cadence signal", .description = "an older host cadence signal retained for review history; current gameplay uses the private module's context-aware cadence rule" },
};

const decision_bits = [_]BitInfo{
    .{ .mask = abi.DecisionFlag.write_audit, .name = "write audit", .description = "module asks the host to retain an audit record" },
    .{ .mask = abi.DecisionFlag.hold_score, .name = "hold score", .description = "module proposes holding the score; observe-only mode does not hold it" },
    .{ .mask = abi.DecisionFlag.disconnect_session, .name = "disconnect session", .description = "module proposes disconnecting the client; observe-only mode does not disconnect it" },
    .{ .mask = abi.DecisionFlag.require_staff_review, .name = "staff review", .description = "module asks for a human review" },
    .{ .mask = abi.DecisionFlag.notify_player, .name = "notify player", .description = "module proposes notifying the player; observe-only mode does not send it" },
};

fn jsonString(writer: *std.Io.Writer, value: []const u8) !void {
    try std.json.Stringify.value(value, .{}, writer);
}

fn writeCode(writer: *std.Io.Writer, kind: []const u8, code: u32, info: ?CodeInfo) !void {
    try writer.print("{{\"code\":{d},\"known\":{},\"name\":", .{ code, info != null });
    if (info) |known| {
        try jsonString(writer, known.name);
        try writer.writeAll(",\"display\":");
        var display_buf: [128]u8 = undefined;
        const display = try std.fmt.bufPrint(&display_buf, "{s} ({d})", .{ known.name, code });
        try jsonString(writer, display);
        try writer.writeAll(",\"description\":");
        try jsonString(writer, known.description);
    } else {
        var name_buf: [80]u8 = undefined;
        const name = try std.fmt.bufPrint(&name_buf, "unknown {s}", .{kind});
        try jsonString(writer, name);
        try writer.writeAll(",\"display\":");
        var display_buf: [128]u8 = undefined;
        const display = try std.fmt.bufPrint(&display_buf, "unknown {s} ({d})", .{ kind, code });
        try jsonString(writer, display);
        try writer.writeAll(",\"description\":");
        var description_buf: [192]u8 = undefined;
        const description = try std.fmt.bufPrint(&description_buf, "code {d} is not known by this ABI decoder; its numeric value has been preserved", .{code});
        try jsonString(writer, description);
    }
    try writer.writeByte('}');
}

fn riskBand(value: u32) CodeInfo {
    if (value == 0) return .{ .name = "none", .description = "no risk points were assigned" };
    if (value < 250) return .{ .name = "low", .description = "low-priority review signal" };
    if (value < 500) return .{ .name = "elevated", .description = "worth reviewing with the supporting evidence" };
    if (value < 750) return .{ .name = "high", .description = "strong review signal; verify the replay and account context" };
    return .{ .name = "critical", .description = "highest review priority; still not an automatic verdict" };
}

fn writeBits(writer: *std.Io.Writer, value: u64, known_mask: u64, definitions: []const BitInfo, kind: []const u8) !void {
    try writer.writeByte('[');
    var first = true;
    for (definitions) |definition| {
        if (value & definition.mask == 0) continue;
        if (!first) try writer.writeByte(',');
        first = false;
        var mask_buf: [24]u8 = undefined;
        const mask = try std.fmt.bufPrint(&mask_buf, "0x{x}", .{definition.mask});
        try writer.writeAll("{\"known\":true,\"mask\":");
        try jsonString(writer, mask);
        try writer.writeAll(",\"name\":");
        try jsonString(writer, definition.name);
        try writer.writeAll(",\"description\":");
        try jsonString(writer, definition.description);
        try writer.writeByte('}');
    }
    const unknown = value & ~known_mask;
    if (unknown != 0) {
        if (!first) try writer.writeByte(',');
        var mask_buf: [24]u8 = undefined;
        const mask = try std.fmt.bufPrint(&mask_buf, "0x{x}", .{unknown});
        var name_buf: [96]u8 = undefined;
        const name = try std.fmt.bufPrint(&name_buf, "unknown {s} bits {s}", .{ kind, mask });
        try writer.writeAll("{\"known\":false,\"mask\":");
        try jsonString(writer, mask);
        try writer.writeAll(",\"name\":");
        try jsonString(writer, name);
        try writer.writeAll(",\"description\":\"this host does not know these future ABI bits; the mask has been preserved\"}");
    }
    try writer.writeByte(']');
}

fn writeMetric(writer: *std.Io.Writer, first: *bool, key: []const u8, label: []const u8, raw: u32, display: []const u8, description: []const u8) !void {
    return writeSupportedMetric(writer, first, key, label, raw, display, description, true);
}

fn writeSupportedMetric(writer: *std.Io.Writer, first: *bool, key: []const u8, label: []const u8, raw: ?u32, display: []const u8, description: []const u8, available: bool) !void {
    if (!first.*) try writer.writeByte(',');
    first.* = false;
    try writer.writeAll("{\"key\":");
    try jsonString(writer, key);
    try writer.writeAll(",\"label\":");
    try jsonString(writer, label);
    try writer.writeAll(",\"raw\":");
    if (raw) |value| try writer.print("{d}", .{value}) else try writer.writeAll("null");
    try writer.print(",\"available\":{},\"display\":", .{available});
    try jsonString(writer, if (available) display else "unavailable");
    try writer.writeAll(",\"description\":");
    try jsonString(writer, description);
    try writer.writeByte('}');
}

fn fixedTwo(value: u32, divisor: u32, suffix: []const u8, buffer: []u8) ![]const u8 {
    return std.fmt.bufPrint(buffer, "{d}.{d:0>2}{s}", .{ value / divisor, value % divisor * 100 / divisor, suffix });
}

fn fixedMilli(value: u32, suffix: []const u8, buffer: []u8) ![]const u8 {
    return std.fmt.bufPrint(buffer, "{d}.{d:0>3}{s}", .{ value / 1000, value % 1000, suffix });
}

fn writeMetrics(writer: *std.Io.Writer, metrics: Metrics) !void {
    try writer.writeByte('[');
    var first = true;
    const has_gameplay = metrics.objects_checked != 0 or metrics.matched_clicks != 0 or metrics.key_press_count != 0 or metrics.velocity_spike_count != 0;
    var buf: [64]u8 = undefined;
    if (has_gameplay) {
        try writeMetric(writer, &first, "objects_checked", "objects checked", metrics.objects_checked, try std.fmt.bufPrint(&buf, "{d}", .{metrics.objects_checked}), "non-spinner hit objects inspected by the gameplay analyser");
        try writeMetric(writer, &first, "matched_clicks", "temporal head matches", metrics.matched_clicks, try std.fmt.bufPrint(&buf, "{d}", .{metrics.matched_clicks}), "logical replay onsets matched by time to circle or slider heads; not re-scored hits or proof of physical input");
        const basis = metrics.input_basis;
        const timing_samples: ?u32 = if (basis) |known| known.timing_samples else null;
        const timing_available = if (timing_samples) |count| count > 0 else false;
        const spread_available = if (timing_samples) |count| count > 1 else false;
        try writeSupportedMetric(writer, &first, "timing_samples", "single-onset timing samples", timing_samples, try std.fmt.bufPrint(&buf, "{d}", .{timing_samples orelse 0}), "eligible temporal head matches; simultaneous onsets are excluded; older observations did not retain this count", timing_samples != null);
        try writeSupportedMetric(writer, &first, "ambiguous_matched_presses", "ambiguous temporal matches", if (basis) |known| known.ambiguous_matched_presses else null, try std.fmt.bufPrint(&buf, "{d}", .{if (basis) |known| known.ambiguous_matched_presses else 0}), "matched onsets whose same-frame input order is unknown", basis != null);
        try writeSupportedMetric(writer, &first, "simultaneous_press_frames", "simultaneous onset frames", if (basis) |known| known.simultaneous_press_frames else null, try std.fmt.bufPrint(&buf, "{d}", .{if (basis) |known| known.simultaneous_press_frames else 0}), "replay updates containing both logical lane onsets", basis != null);
        if (metrics.matched_clicks != 0) {
            try writeSupportedMetric(writer, &first, "mean_timing", "mean timing error", metrics.mean_abs_timing_error_milli, try fixedMilli(metrics.mean_abs_timing_error_milli, " ms", &buf), "mean absolute error of eligible single-onset temporal head matches; unavailable without a recorded sample basis", timing_available);
            try writeSupportedMetric(writer, &first, "timing_spread", "timing spread", metrics.timing_stddev_milli, try fixedMilli(metrics.timing_stddev_milli, " ms", &buf), "sample standard deviation of eligible single-onset timing; requires at least two samples", spread_available);
            try writeSupportedMetric(writer, &first, "exact_timing", "exact timing", metrics.exact_timing_bps, try fixedTwo(metrics.exact_timing_bps, 100, "%", &buf), "share of eligible single-onset timing samples within one millisecond; denominator is timing samples, not all temporal matches", timing_available);
        }
        // The host has no reliable stacked/mod-transformed target contract yet.
        // Its gated zero values must not look like measured perfect aim.
        try writeSupportedMetric(writer, &first, "centre_hits", "centre hits", metrics.center_hits_bps, try fixedTwo(metrics.center_hits_bps, 100, "%", &buf), "unavailable: stacked and mod-transformed targets were not verified by this host contract; raw value retained", false);
        try writeSupportedMetric(writer, &first, "mean_centre_distance", "mean centre distance", metrics.mean_center_distance_milli, try fixedMilli(metrics.mean_center_distance_milli, " px", &buf), "unavailable: target-coordinate basis was not verified; gated zeros are not centre-perfect landings", false);
        try writeSupportedMetric(writer, &first, "snap_events", "snap events", metrics.snap_events, try std.fmt.bufPrint(&buf, "{d}", .{metrics.snap_events}), "unavailable: approaches relative to targets require a reliable target-coordinate basis", false);
        try writeMetric(writer, &first, "key_presses", "logical presses", metrics.key_press_count, try std.fmt.bufPrint(&buf, "{d}", .{metrics.key_press_count}), "logical lane onsets in replay key states, with keyboard/mouse aliases collapsed; not hardware evidence");
        try writeMetric(writer, &first, "key_holds", "key holds", metrics.key_hold_count, try std.fmt.bufPrint(&buf, "{d}", .{metrics.key_hold_count}), "key presses with a measurable release");
        if (metrics.key_hold_count != 0) {
            try writeMetric(writer, &first, "mean_hold", "mean hold length", metrics.mean_hold_duration_milli, try fixedMilli(metrics.mean_hold_duration_milli, " ms", &buf), "mean time between key press and release");
            try writeMetric(writer, &first, "hold_spread", "hold spread", metrics.hold_duration_stddev_milli, try fixedMilli(metrics.hold_duration_stddev_milli, " ms", &buf), "standard deviation of key hold lengths");
        }
        const opportunities: ?u32 = if (basis) |known| known.alternation_opportunities else null;
        try writeSupportedMetric(writer, &first, "alternation_opportunities", "alternation opportunities", opportunities, try std.fmt.bufPrint(&buf, "{d}", .{opportunities orelse 0}), "adjacent unambiguous single onsets eligible for lane comparison; simultaneous onsets break the sequence", opportunities != null);
        try writeSupportedMetric(writer, &first, "alternation", "key alternation", metrics.alternation_bps, try fixedTwo(metrics.alternation_bps, 100, "%", &buf), "share of eligible alternation opportunities that switch input lanes; requires a recorded nonzero denominator", if (opportunities) |count| count > 0 else false);
        try writeSupportedMetric(writer, &first, "target_distance_spread", "target distance spread", metrics.target_distance_stddev_milli, try fixedMilli(metrics.target_distance_stddev_milli, " px", &buf), "unavailable: target-coordinate basis was not verified; gated zero is not a radial lock", false);
        try writeMetric(writer, &first, "velocity_spikes", "velocity spikes", metrics.velocity_spike_count, try std.fmt.bufPrint(&buf, "{d}", .{metrics.velocity_spike_count}), "large cursor-speed changes found between replay frames");
        try writeMetric(writer, &first, "velocity_spread", "velocity spread", metrics.movement_velocity_stddev_milli, try std.fmt.bufPrint(&buf, "{d} px/s", .{metrics.movement_velocity_stddev_milli}), "standard deviation of cursor movement velocity; the ABI stores px/ms multiplied by 1000, which is numerically px/s");
    }
    if (metrics.replay_match_count != 0) try writeMetric(writer, &first, "replay_matches", "other account replay matches", metrics.replay_match_count, try std.fmt.bufPrint(&buf, "{d}", .{metrics.replay_match_count}), "other accounts with the same passed replay on the same map and mode");
    try writer.writeByte(']');
}

pub fn writePolicyJson(writer: *std.Io.Writer) !void {
    try writer.print("{{\"mode\":\"observe_only\",\"abi_version\":{d},\"outcome\":\"module actions and flags are proposals recorded for staff; the host does not restrict, disconnect, hold, delete, or change stats from this queue\",\"risk_scale\":{{\"minimum\":0,\"maximum\":1000,\"meaning\":\"module risk points, not a probability or verdict; display bands only set review priority\"}},\"confidence_scale\":{{\"minimum_bps\":0,\"maximum_bps\":10000,\"meaning\":\"module confidence in its selected reason, expressed in basis points\"}}}}", .{abi.version});
}

pub fn writeObservationJson(writer: *std.Io.Writer, observation: Observation) !void {
    try writer.print("{{\"observe_only\":{},\"enforced\":{},\"outcome\":", .{ !observation.enforced, observation.enforced });
    try jsonString(writer, if (observation.enforced) "score rejected before persistence; stats and leaderboards were not changed; no account ban" else "recorded for human review; no automatic player or score action was applied from this observation");
    try writer.writeAll(",\"action\":");
    try writeCode(writer, "action", observation.action, actionInfo(observation.action));
    try writer.writeAll(",\"reason\":");
    try writeCode(writer, "reason", observation.reason, observationReasonInfo(observation));
    const risk = riskBand(observation.risk_score);
    var risk_display_buf: [64]u8 = undefined;
    const risk_display = try std.fmt.bufPrint(&risk_display_buf, "{d} / 1000 · {s}", .{ observation.risk_score, risk.name });
    try writer.print(",\"risk\":{{\"value\":{d},\"maximum\":1000,\"band\":", .{observation.risk_score});
    try jsonString(writer, risk.name);
    try writer.writeAll(",\"display\":");
    try jsonString(writer, risk_display);
    try writer.writeAll(",\"description\":");
    try jsonString(writer, risk.description);
    var confidence_buf: [64]u8 = undefined;
    const confidence = try fixedTwo(observation.confidence_bps, 100, "%", &confidence_buf);
    try writer.print("}},\"confidence\":{{\"basis_points\":{d},\"display\":", .{observation.confidence_bps});
    try jsonString(writer, confidence);
    try writer.writeAll(",\"description\":\"module confidence in the selected reason; it is not proof or a probability of guilt\"},\"evidence\":");
    try writeBits(writer, observation.evidence, abi.Evidence.known_mask, &evidence_bits, "evidence");
    try writer.writeAll(",\"decision_flags\":");
    try writeBits(writer, observation.decision_flags, abi.DecisionFlag.known_mask, &decision_bits, "decision flag");
    var revision_buf: [64]u8 = undefined;
    const revision = try std.fmt.bufPrint(&revision_buf, "revision {d}", .{observation.rule_revision});
    try writer.print(",\"rule_revision\":{{\"value\":{d},\"display\":", .{observation.rule_revision});
    try jsonString(writer, revision);
    try writer.writeAll(",\"description\":\"the detection ruleset version reported by this module; compare revisions only within the same module\"},\"metrics\":");
    try writeMetrics(writer, observation.metrics);
    try writer.writeByte('}');
}

test "shared replay descriptions do not mislabel native lazer findings as Stable" {
    for ([_]u32{ abi.Reason.required_replay_missing, abi.Reason.invalid_replay_payload }) |code| {
        try std.testing.expect(std.mem.indexOf(u8, reasonInfo(code).?.description, "Stable") == null);
    }
    try std.testing.expectEqualStrings("the submitted accuracy is outside the valid range", reasonInfo(abi.Reason.impossible_accuracy).?.description);
}

test "review decoder follows ABI codes and preserves unknown values" {
    var output: std.Io.Writer.Allocating = .init(std.testing.allocator);
    defer output.deinit();
    try writeObservationJson(&output.writer, .{
        .action = abi.Action.challenge,
        .reason = abi.Reason.impossible_hit_totals,
        .risk_score = 900,
        .confidence_bps = 9950,
        .evidence = abi.Evidence.impossible_hit_totals | (@as(u64, 1) << 40),
        .decision_flags = abi.DecisionFlag.hold_score | (@as(u64, 1) << 41),
        .rule_revision = 3,
    });
    const json = output.written();
    const parsed = try std.json.parseFromSlice(std.json.Value, std.testing.allocator, json, .{});
    defer parsed.deinit();
    try std.testing.expect(parsed.value.object.get("action") != null);
    try std.testing.expect(std.mem.indexOf(u8, json, "\"display\":\"challenge (2)\"") != null);
    try std.testing.expect(std.mem.indexOf(u8, json, "\"display\":\"impossible hit totals (2002)\"") != null);
    try std.testing.expect(std.mem.indexOf(u8, json, "\"display\":\"900 / 1000 · critical\"") != null);
    try std.testing.expect(std.mem.indexOf(u8, json, "unknown evidence bits 0x10000000000") != null);
    try std.testing.expect(std.mem.indexOf(u8, json, "unknown decision flag bits 0x20000000000") != null);

    var unknown: std.Io.Writer.Allocating = .init(std.testing.allocator);
    defer unknown.deinit();
    try writeObservationJson(&unknown.writer, .{ .action = 77, .reason = 4_294_967_000, .risk_score = 1, .confidence_bps = 1, .evidence = 0, .decision_flags = 0, .rule_revision = 999 });
    try std.testing.expect(std.mem.indexOf(u8, unknown.written(), "unknown action (77)") != null);
    try std.testing.expect(std.mem.indexOf(u8, unknown.written(), "unknown reason (4294967000)") != null);
}

test "review decoder explains production action and reason examples" {
    var output: std.Io.Writer.Allocating = .init(std.testing.allocator);
    defer output.deinit();
    try writeObservationJson(&output.writer, .{
        .action = abi.Action.restrict,
        .reason = abi.Reason.exact_hardware_match,
        .risk_score = 940,
        .confidence_bps = 9800,
        .evidence = abi.Evidence.exact_hardware_match,
        .decision_flags = abi.DecisionFlag.disconnect_session | abi.DecisionFlag.require_staff_review,
        .rule_revision = 3,
        .metrics = .{ .objects_checked = 80, .matched_clicks = 80, .mean_abs_timing_error_milli = 25, .movement_velocity_stddev_milli = 2_500 },
    });
    const json = output.written();
    try std.testing.expect(std.mem.indexOf(u8, json, "\"display\":\"restrict (3)\"") != null);
    try std.testing.expect(std.mem.indexOf(u8, json, "\"display\":\"exact hardware match (1004)\"") != null);
    try std.testing.expect(std.mem.indexOf(u8, json, "\"display\":\"revision 3\"") != null);
    try std.testing.expect(std.mem.indexOf(u8, json, "no automatic player or score action was applied from this observation") != null);
    try std.testing.expect(std.mem.indexOf(u8, json, "\"display\":\"0.025 ms\"") == null);
    try std.testing.expect(std.mem.indexOf(u8, json, "\"raw\":25,\"available\":false,\"display\":\"unavailable\"") != null);
    try std.testing.expect(std.mem.indexOf(u8, json, "\"display\":\"2500 px/s\"") != null);
}

test "review timing and alternation require their recorded denominators" {
    for ([_]?abi.InputBasis{
        null,
        .{ .version = 1, .timing_samples = 0, .ambiguous_matched_presses = 2, .simultaneous_press_frames = 1, .alternation_opportunities = 0 },
        .{ .version = 1, .timing_samples = 1, .ambiguous_matched_presses = 1, .simultaneous_press_frames = 1, .alternation_opportunities = 1 },
        .{ .version = 1, .timing_samples = 2, .ambiguous_matched_presses = 0, .simultaneous_press_frames = 0, .alternation_opportunities = 1 },
    }) |basis| {
        var output: std.Io.Writer.Allocating = .init(std.testing.allocator);
        defer output.deinit();
        try writeMetrics(&output.writer, .{ .objects_checked = 2, .matched_clicks = 2, .key_press_count = 2, .input_basis = basis });
        const parsed = try std.json.parseFromSlice(std.json.Value, std.testing.allocator, output.written(), .{});
        defer parsed.deinit();
        for (parsed.value.array.items) |metric| {
            const key = metric.object.get("key").?.string;
            const available = metric.object.get("available").?.bool;
            if (std.mem.eql(u8, key, "mean_timing") or std.mem.eql(u8, key, "exact_timing"))
                try std.testing.expectEqual(if (basis) |known| known.timing_samples > 0 else false, available);
            if (std.mem.eql(u8, key, "timing_spread"))
                try std.testing.expectEqual(if (basis) |known| known.timing_samples > 1 else false, available);
            if (std.mem.eql(u8, key, "alternation"))
                try std.testing.expectEqual(if (basis) |known| known.alternation_opportunities > 0 else false, available);
            if (std.mem.eql(u8, key, "centre_hits") or std.mem.eql(u8, key, "mean_centre_distance") or
                std.mem.eql(u8, key, "snap_events") or std.mem.eql(u8, key, "target_distance_spread"))
                try std.testing.expect(!available);
            if (std.mem.eql(u8, key, "timing_samples") and basis == null)
                try std.testing.expect(metric.object.get("raw").? == .null);
            if (!available) try std.testing.expectEqualStrings("unavailable", metric.object.get("display").?.string);
        }
    }
}

test "historical cadence reasons do not inherit current context-aware claims" {
    const old: Observation = .{ .action = abi.Action.audit, .reason = abi.Reason.suspicious_frame_cadence, .risk_score = 0, .confidence_bps = 0, .evidence = 0, .decision_flags = 0, .rule_revision = 6 };
    try std.testing.expectEqualStrings("historical frame cadence review", observationReasonInfo(old).?.name);
    var current = old;
    current.module = "zigcho-private-anticheat-v1";
    current.rule_revision = 9;
    try std.testing.expectEqualStrings("frame cadence review", observationReasonInfo(current).?.name);
    current.evidence = abi.Evidence.suspicious_frame_cadence;
    try std.testing.expectEqualStrings("historical frame cadence review", observationReasonInfo(current).?.name);
    current.evidence = 0;
    current.module = "another-module";
    try std.testing.expectEqualStrings("historical frame cadence review", observationReasonInfo(current).?.name);
}
