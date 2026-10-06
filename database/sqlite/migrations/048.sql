BEGIN IMMEDIATE;
ALTER TABLE anticheat_review_exclusions ADD COLUMN skip_checks INTEGER NOT NULL DEFAULT 0 CHECK(skip_checks IN(0,1));
CREATE TABLE anticheat_observations_next (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score_id INTEGER REFERENCES scores(id) ON DELETE SET NULL,
    lazer_score_id INTEGER REFERENCES lazer_scores(id) ON DELETE SET NULL,
    source TEXT NOT NULL CHECK(source IN ('stable_login','stable_lastfm','stable_score','lazer_score')),
    enforced INTEGER NOT NULL DEFAULT 0 CHECK(enforced IN(0,1)),
    module TEXT NOT NULL CHECK(length(module) BETWEEN 1 AND 64),
    action INTEGER NOT NULL CHECK(action BETWEEN 0 AND 3),
    sample_weight INTEGER NOT NULL DEFAULT 1 CHECK(sample_weight BETWEEN 1 AND 100000),
    reason INTEGER NOT NULL,
    risk_score INTEGER NOT NULL CHECK(risk_score BETWEEN 0 AND 1000),
    confidence_bps INTEGER NOT NULL CHECK(confidence_bps BETWEEN 0 AND 10000),
    evidence INTEGER NOT NULL DEFAULT 0 CHECK(evidence >= 0),
    decision_flags INTEGER NOT NULL DEFAULT 0 CHECK(decision_flags >= 0),
    rule_revision INTEGER NOT NULL DEFAULT 0,
    objects_checked INTEGER NOT NULL DEFAULT 0 CHECK(objects_checked >= 0),
    matched_clicks INTEGER NOT NULL DEFAULT 0 CHECK(matched_clicks BETWEEN 0 AND objects_checked),
    mean_abs_timing_error_milli INTEGER NOT NULL DEFAULT 0 CHECK(mean_abs_timing_error_milli >= 0),
    timing_stddev_milli INTEGER NOT NULL DEFAULT 0 CHECK(timing_stddev_milli >= 0),
    exact_timing_bps INTEGER NOT NULL DEFAULT 0 CHECK(exact_timing_bps BETWEEN 0 AND 10000),
    center_hits_bps INTEGER NOT NULL DEFAULT 0 CHECK(center_hits_bps BETWEEN 0 AND 10000),
    mean_center_distance_milli INTEGER NOT NULL DEFAULT 0 CHECK(mean_center_distance_milli >= 0),
    snap_events INTEGER NOT NULL DEFAULT 0 CHECK(snap_events BETWEEN 0 AND objects_checked),
    replay_match_count INTEGER NOT NULL DEFAULT 0 CHECK(replay_match_count BETWEEN 0 AND 100000),
    key_press_count INTEGER NOT NULL DEFAULT 0 CHECK(key_press_count >= 0),
    key_hold_count INTEGER NOT NULL DEFAULT 0 CHECK(key_hold_count BETWEEN 0 AND key_press_count),
    mean_hold_duration_milli INTEGER NOT NULL DEFAULT 0 CHECK(mean_hold_duration_milli >= 0),
    hold_duration_stddev_milli INTEGER NOT NULL DEFAULT 0 CHECK(hold_duration_stddev_milli >= 0),
    alternation_bps INTEGER NOT NULL DEFAULT 0 CHECK(alternation_bps BETWEEN 0 AND 10000),
    target_distance_stddev_milli INTEGER NOT NULL DEFAULT 0 CHECK(target_distance_stddev_milli >= 0),
    velocity_spike_count INTEGER NOT NULL DEFAULT 0 CHECK(velocity_spike_count >= 0),
    movement_velocity_stddev_milli INTEGER NOT NULL DEFAULT 0 CHECK(movement_velocity_stddev_milli >= 0),
    review_label TEXT NOT NULL DEFAULT 'pending' CHECK(review_label IN ('pending','clean','uncertain','cheat','dismissed')),
    reviewer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    review_note TEXT NOT NULL DEFAULT '' CHECK(length(review_note) <= 1000),
    reviewed_at INTEGER,
    review_exclusion_id INTEGER REFERENCES anticheat_review_exclusions(id) ON DELETE RESTRICT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    CHECK(score_id IS NULL OR (source='stable_score' AND lazer_score_id IS NULL)),
    CHECK(lazer_score_id IS NULL OR (source='lazer_score' AND score_id IS NULL)),
    CHECK(
        (review_label = 'pending' AND reviewer_id IS NULL AND reviewed_at IS NULL AND review_note = '') OR
        (review_label != 'pending' AND reviewer_id IS NOT NULL AND reviewed_at IS NOT NULL AND length(review_note) BETWEEN 3 AND 1000)
    )
);

INSERT INTO anticheat_observations_next(id,user_id,score_id,source,module,action,sample_weight,reason,risk_score,confidence_bps,evidence,decision_flags,rule_revision,objects_checked,matched_clicks,mean_abs_timing_error_milli,timing_stddev_milli,exact_timing_bps,center_hits_bps,mean_center_distance_milli,snap_events,replay_match_count,key_press_count,key_hold_count,mean_hold_duration_milli,hold_duration_stddev_milli,alternation_bps,target_distance_stddev_milli,velocity_spike_count,movement_velocity_stddev_milli,review_label,reviewer_id,review_note,reviewed_at,review_exclusion_id,created_at) SELECT id,user_id,score_id,source,module,action,sample_weight,reason,risk_score,confidence_bps,evidence,decision_flags,rule_revision,objects_checked,matched_clicks,mean_abs_timing_error_milli,timing_stddev_milli,exact_timing_bps,center_hits_bps,mean_center_distance_milli,snap_events,replay_match_count,key_press_count,key_hold_count,mean_hold_duration_milli,hold_duration_stddev_milli,alternation_bps,target_distance_stddev_milli,velocity_spike_count,movement_velocity_stddev_milli,review_label,reviewer_id,review_note,reviewed_at,review_exclusion_id,created_at FROM anticheat_observations;
DROP TABLE anticheat_observations;
ALTER TABLE anticheat_observations_next RENAME TO anticheat_observations;
CREATE UNIQUE INDEX anticheat_observations_score ON anticheat_observations(score_id) WHERE score_id IS NOT NULL;
CREATE UNIQUE INDEX anticheat_observations_lazer_score ON anticheat_observations(lazer_score_id) WHERE lazer_score_id IS NOT NULL;
CREATE INDEX anticheat_observations_queue ON anticheat_observations(review_label,created_at,id);
CREATE INDEX anticheat_observations_review_queue ON anticheat_observations(review_label,review_exclusion_id,created_at,id);
CREATE INDEX anticheat_observations_user ON anticheat_observations(user_id,created_at DESC,id DESC);
CREATE INDEX anticheat_check_exclusions_active ON anticheat_review_exclusions(user_id,scope,expires_at) WHERE skip_checks=1 AND revoked_at IS NULL;
PRAGMA user_version=48;
COMMIT;
