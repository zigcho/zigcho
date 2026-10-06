# lazer replay claims have to match the upload

we were checking the replay frames but only measuring the compressed score-info
trailer. that trailer is now decoded with its own size, nesting and memory limits.

new native submissions have to carry matching statistics, maximum statistics,
mods and settings, pauses, rank and the supplied unmodded score. reordering mods,
omitting zero hit counts and using default settings still work. older room requests
aren't compared against fields the server had to invent for compatibility.

changing the replay version does not bypass the check. changing a replay name or
local account id does not authenticate a player either. old stored replays remain
downloadable; this does not rewrite or judge historical scores.

the staff panel has a separate replay score mismatch reason. when integrity mode
is enabled, an inconsistent passed upload is rejected before it changes stats or
leaderboards. it does not ban the account. matching claims are not proof of a clean
play, and full replay re-scoring is still unfinished.
