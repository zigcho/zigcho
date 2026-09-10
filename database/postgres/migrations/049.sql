BEGIN;
ALTER TABLE zigcho.users ADD COLUMN profile_setup text NOT NULL DEFAULT '' CHECK(length(profile_setup)<=160);
INSERT INTO zigcho.schema_migrations(version) VALUES(49);
COMMIT;
