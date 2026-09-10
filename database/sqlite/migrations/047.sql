ALTER TABLE users ADD COLUMN profile_setup TEXT NOT NULL DEFAULT '' CHECK(length(profile_setup)<=160);
PRAGMA user_version=47;
