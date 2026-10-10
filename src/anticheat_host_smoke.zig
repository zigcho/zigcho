const std = @import("std");
const abi = @import("anticheat_abi.zig");
const anticheat = @import("anticheat_plugin.zig");

fn checkGameplayRevision(host: *anticheat.Host) !void {
    // Exercise rule 9 and result v2 through the real loader.
    // A same-frame pair is two presses for coverage, but its action order is
    // unknown and must not turn into exact-timing or alternation support.
    var paired_objects: [160]abi.HitObjectV1 = undefined;
    var paired_frames: [161]abi.ReplayFrameV1 = undefined;
    paired_frames[0] = .{ .time_ms = 0, .x = 64, .y = 64, .keys = 0 };
    for (0..80) |index| {
        const time: i64 = 1000 + @as(i64, @intCast(index)) * 200;
        paired_objects[index * 2] = .{ .time_ms = time, .x = 64, .y = 64, .kind = abi.HitObjectKind.circle };
        paired_objects[index * 2 + 1] = paired_objects[index * 2];
        paired_frames[index * 2 + 1] = .{ .time_ms = time, .x = 64, .y = 64, .keys = 12 };
        paired_frames[index * 2 + 2] = .{ .time_ms = time + 8, .x = 64, .y = 64, .keys = 0 };
    }
    const paired = try host.evaluateGameplay(.{
        .base = .{ .event_kind = abi.EventKind.score, .client_family = abi.ClientFamily.stable, .namespace = abi.Namespace.vanilla, .event_flags = abi.EventFlag.passed, .map_objects = paired_objects.len, .n300 = paired_objects.len },
        .passed_hits = paired_objects.len,
        .hit_window_ms = 80,
        .frames = &paired_frames,
        .frame_count = paired_frames.len,
        .objects = &paired_objects,
        .object_count = paired_objects.len,
    });
    if (paired.matched_clicks != 160 or paired.key_press_count != 160 or paired.exact_timing_bps != 0 or paired.alternation_bps != 0 or paired.decision.action != abi.Action.allow)
        return error.UnexpectedSimultaneousPressDecision;
    if (paired.input_basis_version != 1 or paired.timing_samples != 0 or paired.ambiguous_matched_presses != 160 or
        paired.simultaneous_press_frames != 80 or paired.alternation_opportunities != 0) return error.UnexpectedInputBasis;

    // Long complete map-bound trace: sustained ten-ms samples, varied manual
    // timing/holds. This is a review fixture, never a labelled cheater sample.
    var objects: [80]abi.HitObjectV1 = undefined;
    var frames: [4001]abi.ReplayFrameV1 = undefined;
    for (&frames, 0..) |*frame, index| frame.* = .{ .time_ms = @intCast(index * 10), .x = 64, .y = 64, .keys = 0 };
    for (&objects, 0..) |*object, index| {
        const time = 1000 + index * 480;
        object.* = .{ .time_ms = @intCast(time), .x = 64, .y = 64, .kind = abi.HitObjectKind.circle };
        const press = time / 10 + index % 5;
        for (frames[press .. press + 2 + index % 7]) |*frame| frame.keys = if (index % 2 == 0) 4 else 8;
    }
    var event: abi.GameplayEventV1 = .{
        .base = .{ .event_kind = abi.EventKind.score, .client_family = abi.ClientFamily.stable, .namespace = abi.Namespace.vanilla, .event_flags = abi.EventFlag.passed, .map_objects = objects.len, .n300 = objects.len },
        .passed_hits = objects.len,
        .hit_window_ms = 100,
        .frames = &frames,
        .frame_count = frames.len,
        .objects = &objects,
        .object_count = objects.len,
    };
    const cadence = try host.evaluateGameplay(event);
    if (cadence.input_basis_version != 1 or cadence.timing_samples != 80 or cadence.ambiguous_matched_presses != 0 or
        cadence.simultaneous_press_frames != 0 or cadence.alternation_opportunities != 79) return error.UnexpectedInputBasis;
    if (cadence.decision.reason != abi.Reason.suspicious_frame_cadence or cadence.decision.action != abi.Action.audit or
        cadence.decision.flags != abi.DecisionFlag.write_audit | abi.DecisionFlag.require_staff_review) return error.UnexpectedGameplayCadenceDecision;
    for ([_]u64{ 1 << 2, 1 << 7, 1 << 10, 1 << 13, 1 << 60, (1 << 6) | (1 << 8) }) |mods| {
        event.mods = mods;
        if ((try host.evaluateGameplay(event)).decision.reason == abi.Reason.suspicious_frame_cadence) return error.UnsupportedModCadenceDecision;
    }
    event.mods = 0;
    for ([_]u32{ abi.Namespace.relax, abi.Namespace.autopilot, abi.Namespace.score_v2, abi.Namespace.custom }) |namespace| {
        event.base.namespace = namespace;
        if ((try host.evaluateGameplay(event)).decision.reason == abi.Reason.suspicious_frame_cadence) return error.UnsupportedNamespaceCadenceDecision;
    }
    event.base.namespace = abi.Namespace.vanilla;
    event.base.client_family = abi.ClientFamily.lazer;
    if ((try host.evaluateGameplay(event)).decision.reason == abi.Reason.suspicious_frame_cadence) return error.NativeCadenceDecision;
    event.base.client_family = abi.ClientFamily.stable;
    event.base.event_flags = 0;
    if ((try host.evaluateGameplay(event)).decision.reason == abi.Reason.suspicious_frame_cadence) return error.FailedCadenceDecision;
    event.base.event_flags = abi.EventFlag.passed;
    event.base.map_objects += 1;
    if ((try host.evaluateGameplay(event)).decision.reason == abi.Reason.suspicious_frame_cadence) return error.PartialCadenceDecision;
    event.base.map_objects = objects.len;
    for (&frames, 0..) |*frame, index| frame.keys = if (index % 2 == 0) 4 else 8;
    if ((try host.evaluateGameplay(event)).decision.reason == abi.Reason.suspicious_frame_cadence) return error.KeyTransitionCadenceDecision;
}

fn checkGameplayContext(host: *anticheat.Host) !void {
    const objects = [_]abi.HitObjectV1{.{ .time_ms = 1000, .x = 256, .y = 192, .kind = abi.HitObjectKind.circle }};
    var frames = [_]abi.ReplayFrameV1{
        .{ .time_ms = 0, .x = 256, .y = 192, .keys = 0 },
        .{ .time_ms = 1149, .x = 256, .y = 192, .keys = 4 },
    };
    const event: abi.GameplayEventV1 = .{
        .base = .{ .event_kind = abi.EventKind.score, .client_family = abi.ClientFamily.lazer, .namespace = abi.Namespace.vanilla, .map_objects = 1, .n300 = 1 },
        .mods = 1 << 6,
        .passed_hits = 1,
        .hit_window_ms = 150,
        .frames = &frames,
        .frame_count = frames.len,
        .objects = &objects,
        .object_count = objects.len,
    };
    const context: abi.GameplayContextV1 = .{ .clock_rate = 2, .approach_rate = -10, .circle_size = 11, .classic_present = 1, .classic_flags = 3 };
    const inside = try host.evaluateGameplayContext(event, context);
    if (inside.timing_samples != 1 or inside.mean_abs_timing_error_milli != 149000) return error.UnexpectedContextTiming;
    frames[1].time_ms = 1150;
    const outside = try host.evaluateGameplayContext(event, context);
    if (outside.timing_samples != 0 or outside.matched_clicks != 0) return error.RoundedContextWindow;
    var invalid = context;
    invalid.geometry_basis = 1;
    if (host.evaluateGameplayContext(event, invalid)) |_| return error.GuessedCoordinateBasis else |err| {
        if (err != error.InvalidEvent) return err;
    }
    std.debug.print("gameplay_context=1\n", .{});
}

pub fn main(init: std.process.Init) !void {
    const allocator = std.heap.smp_allocator;
    const args = try init.minimal.args.toSlice(allocator);
    defer allocator.free(args);
    if (args.len != 2) {
        std.log.err("usage: anticheat-host-smoke <module>", .{});
        return error.InvalidArguments;
    }
    var host = try anticheat.Host.open(args[1]);
    defer host.close();
    if (host.ruleRevision() != abi.rule_revision) return error.UnexpectedRuleRevision;
    try checkGameplayRevision(&host);
    try checkGameplayContext(&host);
    const decision = try host.evaluate(.{
        .event_kind = abi.EventKind.score,
        .client_family = abi.ClientFamily.stable,
        .ruleset = 0,
        .namespace = abi.Namespace.vanilla,
    });
    const login_decision = try host.evaluate(.{
        .event_kind = abi.EventKind.login,
        .client_family = abi.ClientFamily.stable,
        .evidence = abi.Evidence.exact_hardware_match,
        .hardware_match_count = 1,
    });
    const client_signal_decision = try host.evaluate(.{
        .event_kind = abi.EventKind.heartbeat,
        .client_family = abi.ClientFamily.stable,
        .evidence = abi.Evidence.high_confidence_client_flag | abi.Evidence.registry_remnant,
    });
    const missing_replay_decision = try host.evaluate(.{
        .event_kind = abi.EventKind.score,
        .client_family = abi.ClientFamily.stable,
        .ruleset = 0,
        .namespace = abi.Namespace.vanilla,
        .event_flags = abi.EventFlag.passed | abi.EventFlag.replay_required,
        .evidence = abi.Evidence.required_replay_missing,
        .n300 = 80,
        .n100 = 10,
        .n50 = 2,
        .nmiss = 1,
    });
    const checksum_decision = try host.evaluate(.{
        .event_kind = abi.EventKind.score,
        .client_family = abi.ClientFamily.stable,
        .ruleset = 0,
        .namespace = abi.Namespace.vanilla,
        .event_flags = abi.EventFlag.passed | abi.EventFlag.replay_required,
        .evidence = abi.Evidence.checksum_mismatch,
        .n300 = 80,
        .n100 = 10,
        .n50 = 2,
        .nmiss = 1,
    });
    const reused_content_decision = try host.evaluate(.{
        .event_kind = abi.EventKind.score,
        .client_family = abi.ClientFamily.stable,
        .ruleset = 0,
        .namespace = abi.Namespace.vanilla,
        .event_flags = abi.EventFlag.passed | abi.EventFlag.replay_required,
        .evidence = abi.Evidence.replay_content_reused,
        .n300 = 80,
        .n100 = 10,
        .n50 = 2,
        .nmiss = 1,
    });
    const cadence_decision = try host.evaluate(.{
        .event_kind = abi.EventKind.score,
        .client_family = abi.ClientFamily.stable,
        .ruleset = 0,
        .namespace = abi.Namespace.vanilla,
        .event_flags = abi.EventFlag.passed | abi.EventFlag.replay_required,
        .evidence = abi.Evidence.suspicious_frame_cadence,
        .n300 = 80,
        .n100 = 10,
        .n50 = 2,
        .nmiss = 1,
    });
    const shadow_flags = abi.DecisionFlag.write_audit | abi.DecisionFlag.require_staff_review;
    if (login_decision.action != abi.Action.audit or login_decision.reason != abi.Reason.exact_hardware_match or
        login_decision.flags & abi.DecisionFlag.disconnect_session != 0 or login_decision.rule_revision == 0) return error.UnexpectedLoginDecision;
    if (client_signal_decision.action != abi.Action.audit or client_signal_decision.reason != abi.Reason.high_confidence_client_flag or
        client_signal_decision.flags & abi.DecisionFlag.disconnect_session != 0 or client_signal_decision.rule_revision != login_decision.rule_revision) return error.UnexpectedClientSignalDecision;
    if (missing_replay_decision.action != abi.Action.challenge or missing_replay_decision.reason != abi.Reason.required_replay_missing or
        missing_replay_decision.flags & abi.DecisionFlag.hold_score == 0 or missing_replay_decision.rule_revision != login_decision.rule_revision) return error.UnexpectedMissingReplayDecision;
    if (checksum_decision.action != abi.Action.challenge or checksum_decision.reason != abi.Reason.checksum_mismatch or
        checksum_decision.flags & abi.DecisionFlag.hold_score == 0 or checksum_decision.rule_revision != login_decision.rule_revision) return error.UnexpectedChecksumDecision;
    if (reused_content_decision.action != abi.Action.audit or reused_content_decision.reason != abi.Reason.replay_content_reused or
        reused_content_decision.flags != shadow_flags or reused_content_decision.rule_revision != host.ruleRevision()) return error.UnexpectedReusedContentDecision;
    if (cadence_decision.action != abi.Action.audit or cadence_decision.reason != abi.Reason.suspicious_frame_cadence or
        cadence_decision.flags != shadow_flags or cadence_decision.rule_revision != host.ruleRevision()) return error.UnexpectedCadenceDecision;
    var frames: [240]abi.ReplayFrameV1 = undefined;
    var objects: [80]abi.HitObjectV1 = undefined;
    for (0..80) |index| {
        const time: i64 = 1000 + @as(i64, @intCast(index)) * 100;
        const x: f32 = @floatFromInt(64 + index % 8 * 48);
        const y: f32 = @floatFromInt(72 + index % 6 * 44);
        frames[index * 3] = .{ .time_ms = time - 1, .x = x, .y = y, .keys = 0 };
        frames[index * 3 + 1] = .{ .time_ms = time, .x = x, .y = y, .keys = 4 };
        frames[index * 3 + 2] = .{ .time_ms = time + 1, .x = x, .y = y, .keys = 0 };
        objects[index] = .{ .time_ms = time, .x = x, .y = y, .kind = abi.HitObjectKind.circle };
    }
    const gameplay = try host.evaluateGameplay(.{
        .base = .{
            .event_kind = abi.EventKind.score,
            .client_family = abi.ClientFamily.stable,
            .ruleset = 0,
            .namespace = abi.Namespace.vanilla,
            .event_flags = abi.EventFlag.passed | abi.EventFlag.replay_required,
            .n300 = objects.len,
            .map_objects = objects.len,
            .map_duration_ms = @intCast(objects[objects.len - 1].time_ms),
        },
        .passed_hits = objects.len,
        .hit_window_ms = 150,
        .frames = &frames,
        .frame_count = frames.len,
        .objects = &objects,
        .object_count = objects.len,
    });
    std.debug.print("module={s} abi={d} rule_revision={d} action={d} login_action={d} client_signal_action={d} missing_replay_action={d} missing_replay_reason={d} checksum_action={d} checksum_reason={d} reused_content_action={d} cadence_action={d} gameplay_action={d} gameplay_reason={d} objects={d} clicks={d} exact_bps={d} center_bps={d}\n", .{
        host.name(), abi.version, host.ruleRevision(), decision.action, login_decision.action, client_signal_decision.action, missing_replay_decision.action, missing_replay_decision.reason, checksum_decision.action, checksum_decision.reason, reused_content_decision.action, cadence_decision.action, gameplay.decision.action, gameplay.decision.reason, gameplay.objects_checked, gameplay.matched_clicks, gameplay.exact_timing_bps, gameplay.center_hits_bps,
    });
}
