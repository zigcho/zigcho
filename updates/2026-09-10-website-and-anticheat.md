# the website needed this

i've redone the website, especially profiles and settings. same dark look, but the layout actually gives things somewhere to go now.

- profiles have a proper header, the main stats up front, and the rest of your details down the side. combined, stable, lazer and score v2 still have their own views, with vanilla / relax / ap and ruleset filters.
- settings are split into profile, appearance, defaults, privacy, security, team and account. switching sections keeps your edits, and the appearance preview shows what you're changing before you save.
- the navbar has been sorted out. clicking your name opens profile and settings, and both links actually work in safari now. search and the smaller-screen layout have been cleaned up too.
- added setup badges: pc, mobile, mouse, tablet, keyboard, touchscreen and a few less serious choices. pick up to eight in settings, or leave them empty. these are things you choose, not hardware the website claims to detect. the online client badge still comes from your actual stable or lazer session.
- score details have their own layout now, with the map cover, mods and rate, hit results, score breakdown and replay / pin buttons. lazer's score and its legacy value stay separate. failed plays still don't get a replay download.
- the shared page styling also covers rankings, beatmaps, rooms, teams, chat and the other website pages. mobile score rows keep pp visible, and medal tooltips stay on screen.

the private anticheat is on revision 5. fixed a crash when it was handed a cut-off input, and corrected replay checks that could mistake incomplete data or legitimate slider results for missing input. this is about better evidence and fewer false positives, not calling every odd play cheating. the server and module are released together, with their matching versions kept for rollback.

no pp changes in this one. the custom boost is still relax only.
