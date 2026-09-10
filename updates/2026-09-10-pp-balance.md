# pp has its own balance now

pp gets a 25% baseline bump across stable and lazer, with smaller bonuses for hidden, hard rock, flashlight and the actual playback rate. the extra adjustments are capped. RX and AP still use their own underlying calculations, and this doesn't inflate star ratings or raw scores.

relax was ignoring custom DT/NC speeds and treating them as normal DT. the selected rate now reaches the calculator properly, including HT. changing speed changes the actual difficulty before the balance is applied.

bot pp estimates use the same policy as submitted plays. existing scores get recalculated from their saved maps and hit results, then their best plays and combined stats get rebuilt. failed plays still don't count towards ranked pp.

the tuning numbers are exposed in the developer pp tools and live in `src/pp_balance.zig`. the difficulty maths underneath still comes from the pinned rosu and akatsuki libraries.
