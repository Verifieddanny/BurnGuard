package config
import (
	"os"

	"gopkg.in/yaml.v3"
)

type Config struct {
	Server    ServerConfig              `yaml:"server"`
	Budget    BudgetConfig              `yaml:"budget"`
	Providers map[string]ProviderConfig `yaml:"providers"`
	Alerts    AlertConfig               `yaml:"alerts"`
	Sync      SyncConfig                `yaml:"sync"`
}

type ServerConfig struct {
	ProxyPort string `yaml:"proxy_port"`
	DBPath    string `yaml:"db_path"`
}

type BudgetConfig struct {
	Limit float64 `yaml:"limit"`
}

type ProviderConfig struct {
	BaseURL string `yaml:"base_url"`
}

type AlertConfig struct {
	SlackWebhook   string    `yaml:"slack_webhook"`
	DiscordWebhook string    `yaml:"discord_webhook"`
	Thresholds     []float64 `yaml:"thresholds"`
}

type SyncConfig struct {
	Enabled  bool   `yaml:"enabled"`
	Token    string `yaml:"token"`
	URL      string `yaml:"url"`
	Interval int    `yaml:"interval"`
}

func Load(path string) (*Config, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var cfg Config
	if err := yaml.Unmarshal(data, &cfg); err != nil {
		return nil, err
	}

	return &cfg, nil
}