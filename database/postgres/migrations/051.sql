BEGIN;
ALTER TABLE zigcho.anticheat_observations
    ADD COLUMN input_basis_version integer,
    ADD COLUMN timing_samples integer,
    ADD COLUMN ambiguous_matched_presses integer,
    ADD COLUMN simultaneous_press_frames integer,
    ADD COLUMN alternation_opportunities integer;
ALTER TABLE zigcho.anticheat_observations ADD CONSTRAINT anticheat_input_basis CHECK ((input_basis_version IS NULL AND timing_samples IS NULL AND ambiguous_matched_presses IS NULL AND simultaneous_press_frames IS NULL AND alternation_opportunities IS NULL) OR (input_basis_version IS NOT NULL AND timing_samples IS NOT NULL AND ambiguous_matched_presses IS NOT NULL AND simultaneous_press_frames IS NOT NULL AND alternation_opportunities IS NOT NULL AND input_basis_version=1 AND timing_samples>=0 AND ambiguous_matched_presses>=0 AND simultaneous_press_frames>=0 AND alternation_opportunities>=0 AND timing_samples::bigint+ambiguous_matched_presses=matched_clicks AND simultaneous_press_frames::bigint*2<=key_press_count AND ambiguous_matched_presses<=simultaneous_press_frames::bigint*2 AND alternation_opportunities<=greatest(key_press_count-1,0) AND (timing_samples>0 OR (mean_abs_timing_error_milli=0 AND exact_timing_bps=0)) AND (timing_samples>=2 OR timing_stddev_milli=0) AND (alternation_opportunities>0 OR alternation_bps=0)));
INSERT INTO zigcho.schema_migrations(version) VALUES(51);
COMMIT;
