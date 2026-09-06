# stable scores were getting stuck

the submit check was treating stable's score token as a bancho login token. valid uploads got `error: no` before they could save, which left the result screen waiting.

fixed that. the password, score checksum and active client's version and hardware still have to match. known foreign, revoked and expired login tokens still get rejected. pp and the previous-best chart haven't changed.
