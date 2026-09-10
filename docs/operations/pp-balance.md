# zigcho relax pp balance

`src/pp_balance.zig` owns our balance numbers. the pinned rosu and akatsuki libraries still calculate the underlying difficulty and performance. this is our scoring policy on top, not a claim that we wrote their maths.

- baseline: 1.25x pp for Relax only, on both stable and lazer
- hidden: another 1.01x
- hard rock: another 1.02x
- flashlight: another 1.03x
- rate adjustment: actual clock rate raised to 0.05, not the name of the mod

the extra modifiers combine, then clamp between 0.9x and 1.1x before the baseline. the final multiplier stays between 1.125x and 1.375x. DT and NC at the same rate get the same adjustment. existing miss, accuracy and mod penalties stay in the underlying calculation. vanilla, autopilot and ScoreV2 bypass this balance entirely.

Relax on lazer now passes the actual DT, NC or HT rate into akatsuki. default rates keep the same raw result. custom rates change the real difficulty and pp before our balance is applied. other custom mod settings are not newly supported by this change.

the policy changes pp, not stars, combo, raw score or accuracy. failed plays still don't contribute to aggregate pp. submissions, PostgreSQL recalculation, the legacy Stable recalculation tool and bot pp estimates use the same balance boundary. map importing and exact upstream comparison fixtures stay unscaled.

developer pp metadata exposes the coefficients. preview compares the previous raw calculation with the new policy, including rate fixes. tune the constants and bump the balance and engine versions together; don't change stored values by multiplying them in place.

existing scores need one recalculation from their saved maps, hit results and mods. the changed engine marker makes release activation request that rebuild, with the normal backup and rollback checks. this also restores the non-Relax scores that received the previous broad boost.
