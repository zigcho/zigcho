# old stable logins can reconnect

found another one during the live restart: an older stable login couldn't get its reconnect window because the database counted it from the original login time. that could reject the login entirely.

the five minute grace grant now gets a fresh issue timestamp when you reconnect. same client binding, same one-score rule, same revocation checks. no schema or score changes.
