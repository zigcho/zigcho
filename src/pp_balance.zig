const std = @import("std");

pub const version = "zigcho-relax-balance-1";
pub const base_multiplier: f64 = 1.25;
pub const hidden_multiplier: f64 = 1.01;
pub const hard_rock_multiplier: f64 = 1.02;
pub const flashlight_multiplier: f64 = 1.03;
pub const rate_exponent: f64 = 0.05;

pub fn multiplier(mods: u32, rate: f64) !f64 {
    if (!std.math.isFinite(rate) or rate < 0.01 or rate > 100) return error.InvalidClockRate;
    var adjustment = std.math.pow(f64, rate, rate_exponent);
    if (mods & (1 << 3) != 0) adjustment *= hidden_multiplier;
    if (mods & (1 << 4) != 0) adjustment *= hard_rock_multiplier;
    if (mods & (1 << 10) != 0) adjustment *= flashlight_multiplier;
    return base_multiplier * std.math.clamp(adjustment, 0.9, 1.1);
}

pub fn apply(pp: f64, mods: u32, rate: f64) !f64 {
    if (!std.math.isFinite(pp) or pp < 0) return error.InvalidPerformance;
    const result = pp * try multiplier(mods, rate);
    if (!std.math.isFinite(result)) return error.InvalidPerformance;
    return result;
}

test "pp balance keeps zero scores zero and bounds stacked mod bonuses" {
    try std.testing.expectEqual(@as(f64, 125), try apply(100, 0, 1));
    try std.testing.expectEqual(@as(f64, 0), try apply(0, 8 | 16 | 64, 1.5));
    try std.testing.expectApproxEqAbs(try apply(100, 64, 1.25), try apply(100, 64 | 512, 1.25), 0.000001);
    try std.testing.expect(try apply(100, 64, 1.9) > try apply(100, 64, 1.1));
    try std.testing.expectApproxEqAbs(@as(f64, 137.5), try apply(100, 8 | 16 | 1024, 100), 0.000001);
    try std.testing.expectError(error.InvalidClockRate, apply(100, 0, std.math.nan(f64)));
    try std.testing.expectError(error.InvalidPerformance, apply(std.math.inf(f64), 0, 1));
}
