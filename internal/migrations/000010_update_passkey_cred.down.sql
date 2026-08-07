ALTER TABLE passkey_credentials
DROP COLUMN IF EXISTS flags_user_present,
DROP COLUMN IF EXISTS flags_user_verified,
DROP COLUMN IF EXISTS flags_backup_eligibility,
DROP COLUMN IF EXISTS flags_backup_state;