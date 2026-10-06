const std = @import("std");
const abi = @import("anticheat_abi.zig");

// Module risk scores are not calibrated probabilities. Production may reject
// verifiable score-integrity failures, but behavioural suspicions still need
// reviewed replay evidence before they can become automatic enforcement.
pub fn rejectScore(enabled: bool, passed: bool, decision: abi.DecisionV1) bool {
    if (!enabled or !passed or decision.action < abi.Action.challenge or decision.flags & abi.DecisionFlag.hold_score == 0) return false;
    return switch (decision.reason) {
        abi.Reason.impossible_accuracy, abi.Reason.impossible_hit_totals, abi.Reason.impossible_combo, abi.Reason.replay_hash_reused => true,
        else => false,
    };
}

test "integrity enforcement never promotes uncalibrated behavioural flags" {
    const held: abi.DecisionV1 = .{ .action = abi.Action.challenge, .flags = abi.DecisionFlag.hold_score, .reason = abi.Reason.impossible_combo };
    try std.testing.expect(rejectScore(true, true, held));
    try std.testing.expect(!rejectScore(false, true, held));
    try std.testing.expect(!rejectScore(true, false, held));
    for ([_]u32{ abi.Reason.checksum_mismatch, abi.Reason.combined_anomalies, abi.Reason.relax_timing_lock, abi.Reason.relax_keyless_play, abi.Reason.suspicious_frame_cadence }) |reason| {
        var suspicion = held;
        suspicion.reason = reason;
        try std.testing.expect(!rejectScore(true, true, suspicion));
    }
}
