# server stats and the stable map

admins can use `!serverstats` or `!serverstatus` in stable and lazer. kai replies privately with uptime, cpu time and average usage, ram, threads, connections, database pool usage, pp version and dependency counters. no server addresses or credentials in chat. storage being configured doesn't mean it's been health checked.

stable now retries a missing location instead of leaving you at 0,0 for the whole session after one failed lookup. retries are capped and send a fresh presence packet when the location comes back. your country privacy setting and selected mods stay as they were.

the score submission fix from the previous commit is included. this doesn't change pp, score calculations or your stored stats.
