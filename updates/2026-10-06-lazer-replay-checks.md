# lazer replays and player check exemptions

lazer solo and multiplayer uploads now reach the private anticheat instead of
just being stored. replay files are checked against the actual beatmap, and staff
findings keep lazer score ids separate from Stable ids.

the anticheat panel can either hide a player's review findings or skip their
checks. those are separate options, with a reason, expiry and audited revocation.
existing exclusions keep their old review-only meaning. login and score-token
authentication cannot be exempted.

the host also has an integrity enforcement switch. it rejects broken passed
replays and verifiable score-integrity failures before they reach stats or boards.
behavioural detections still go to staff review, not automatic bans: their replay
calibration is still being worked on.
