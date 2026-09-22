CREATE TABLE IF NOT EXISTS app_store_reviewer_notes (
  id varchar(64) PRIMARY KEY,
  app_version varchar(32) NOT NULL,
  note_type varchar(64) NOT NULL,
  note_text text NOT NULL,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS billing_webhook_receipts (
  event_id varchar(128) PRIMARY KEY,
  event_type varchar(64) NOT NULL,
  payload_hash varchar(64) NOT NULL,
  received_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_at timestamp NULL,
  status varchar(32) NOT NULL DEFAULT 'received'
);

CREATE TABLE IF NOT EXISTS account_deletion_jobs (
  job_id varchar(64) PRIMARY KEY,
  user_id varchar(128) NOT NULL,
  state varchar(32) NOT NULL DEFAULT 'queued',
  requested_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at timestamp NULL,
  failure_reason text NULL
);

CREATE TABLE IF NOT EXISTS sync_checkpoints (
  user_id varchar(128) PRIMARY KEY,
  cursor_value varchar(256) NOT NULL,
  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
