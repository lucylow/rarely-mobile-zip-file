-- Release hardening / monetization persistence.
CREATE TABLE IF NOT EXISTS rarely_entitlements (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(191) NOT NULL,
  entitlement_id VARCHAR(191) NOT NULL,
  product_id VARCHAR(191) NULL,
  environment VARCHAR(24) NULL,
  active BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at_ms BIGINT NULL,
  source_event_id VARCHAR(191) NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_rarely_entitlement_user (user_id, entitlement_id),
  UNIQUE KEY uq_rarely_entitlement_event (source_event_id)
);

CREATE TABLE IF NOT EXISTS rarely_billing_events (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_id VARCHAR(191) NOT NULL UNIQUE,
  event_type VARCHAR(80) NOT NULL,
  user_id VARCHAR(191) NOT NULL,
  environment VARCHAR(24) NULL,
  received_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rarely_account_deletion_jobs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(191) NOT NULL,
  status VARCHAR(32) NOT NULL,
  requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  last_error TEXT NULL,
  UNIQUE KEY uq_rarely_deletion_user (user_id)
);

CREATE INDEX idx_rarely_entitlements_expiry ON rarely_entitlements (expires_at_ms);
CREATE INDEX idx_rarely_billing_user ON rarely_billing_events (user_id);
