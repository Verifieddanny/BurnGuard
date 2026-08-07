CREATE TABLE IF NOT EXISTS alert_configs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    slack_webhook TEXT NOT NULL DEFAULT '',
    discord_webhook TEXT NOT NULL DEFAULT '',
    threshold_50 BOOLEAN NOT NULL DEFAULT true,
    threshold_80 BOOLEAN NOT NULL DEFAULT true,
    threshold_100 BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);