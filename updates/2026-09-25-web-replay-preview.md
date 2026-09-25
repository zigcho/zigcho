# watch replays from a profile

the score details page can play a replay now. open a passed play and hit **play this replay** to watch its cursor and inputs over the beatmap objects without downloading the file first. pause, seek and change speed from the same panel.

this works for stable and lazer plays across osu!, taiko, catch and mania. the existing replay download stays where it was, and failed or missing replays still cannot be opened. it is a visual preview, not a full client or a music player, so there is no audio.

the release gate also caught SQLite trying to add an account setup column twice when an older database was retried. that migration now checks the column before adding it, and the reported SQLite schema version matches the migration. the live PostgreSQL schema is unchanged.
