package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strconv"

	"github.com/Verifieddanny/bunguard/internal/config"
	"github.com/charmbracelet/huh"
	"gopkg.in/yaml.v3"
)

func runInit() error {
	var providers []string
	budgetLimitInput := "50.00"
	var proxyPort string
	var hasSyncToken bool
	var syncToken string
	var hasSlack bool
	var slackWebhook string
	var hasDiscord bool
	var discordWebhook string
	var thresholds []string

	form := huh.NewForm(
		huh.NewGroup(
			huh.NewMultiSelect[string]().
				Title("Which AI providers do you use?").
				Options(
					huh.NewOption("Anthropic (Claude)", "anthropic").Selected(true),
					huh.NewOption("OpenAI (GPT)", "openai"),
					// huh.NewOption("Google (Gemini)", "google"),
				).
				Value(&providers),

			huh.NewInput().
				Title("Monthly budget limit in USD").
				Placeholder("50.00").
				Value(&budgetLimitInput),
		),

		huh.NewGroup(
			huh.NewConfirm().
				Title("Do you have a BurnGuard Cloud sync token?").
				Description("Get one at burnguard.run after signing up").
				Value(&hasSyncToken),
		),

		huh.NewGroup(
			huh.NewInput().
				Title("Paste your sync token").
				Placeholder("bg_...").
				Value(&syncToken),
		).WithHideFunc(func() bool { return !hasSyncToken }),

		huh.NewGroup(
			huh.NewConfirm().
				Title("Set up Slack alerts?").
				Value(&hasSlack),
		),

		huh.NewGroup(
			huh.NewInput().
				Title("Paste your Slack webhook URL").
				Placeholder("https://hooks.slack.com/services/...").
				Value(&slackWebhook),
		).WithHideFunc(func() bool { return !hasSlack }),

		huh.NewGroup(
			huh.NewConfirm().
				Title("Set up Discord alerts?").
				Value(&hasDiscord),
		),

		huh.NewGroup(
			huh.NewInput().
				Title("Paste your Discord webhook URL").
				Placeholder("https://discord.com/api/webhooks/...").
				Value(&discordWebhook),
		).WithHideFunc(func() bool { return !hasDiscord }),

		huh.NewGroup(
			huh.NewMultiSelect[string]().
				Title("Alert thresholds").
				Options(
					huh.NewOption("50% of budget", "0.5").Selected(true),
					huh.NewOption("80% of budget", "0.8").Selected(true),
					huh.NewOption("100% of budget", "1.0").Selected(true),
				).
				Value(&thresholds),

			huh.NewInput().
				Title("Proxy port").
				Placeholder("8080").
				Value(&proxyPort),
		),
	)

	err := form.Run()
	if err != nil {
		return err
	}

	if proxyPort == "" {
		proxyPort = "8080"
	}

	budgetLimit, err := strconv.ParseFloat(budgetLimitInput, 64)
	if err != nil || budgetLimit <= 0 {
		return fmt.Errorf("monthly budget limit must be a positive number")
	}

	// Build config
	cfg := config.Config{
		Server: config.ServerConfig{
			ProxyPort: ":" + proxyPort,
			DBPath:    "burnguard.db",
		},
		Budget: config.BudgetConfig{
			Limit: budgetLimit,
		},
		Providers: make(map[string]config.ProviderConfig),
		Alerts: config.AlertConfig{
			SlackWebhook:   slackWebhook,
			DiscordWebhook: discordWebhook,
		},
		Sync: config.SyncConfig{
			Enabled:  hasSyncToken,
			Token:    syncToken,
			URL:      "https://api.burnguard.run",
			Interval: 60,
		},
	}

	// Add selected providers
	providerURLs := map[string]string{
		"anthropic": "https://api.anthropic.com",
		"openai":    "https://api.openai.com",
		// "google":    "https://generativelanguage.googleapis.com",
	}
	for _, p := range providers {
		cfg.Providers[p] = config.ProviderConfig{BaseURL: providerURLs[p]}
	}

	// Parse thresholds
	for _, t := range thresholds {
		var val float64
		fmt.Sscanf(t, "%f", &val)
		cfg.Alerts.Thresholds = append(cfg.Alerts.Thresholds, val)
	}

	// Write config file
	configDir := "."
	os.MkdirAll(configDir, 0755)
	configPath := filepath.Join(configDir, "burnguard.yaml")

	data, err := yaml.Marshal(cfg)
	if err != nil {
		return err
	}

	if err := os.WriteFile(configPath, data, 0644); err != nil {
		return err
	}

	fmt.Printf("\n✅ Config written to %s\n\n", configPath)
	fmt.Println("To start the proxy:")
	fmt.Println("  burnguard start")
	fmt.Println()
	fmt.Println("Then point SDK base URLs at:")
	for _, p := range providers {
		switch p {
		case "anthropic":
			fmt.Printf("  Anthropic: http://localhost:%s/anthropic\n", proxyPort)
		case "openai":
			fmt.Printf("  OpenAI:    http://localhost:%s/openai\n", proxyPort)
			// case "google":
			// 	fmt.Printf("  Google:    http://localhost:%s/google\n", proxyPort)
		}
	}
	fmt.Println()
	fmt.Println("Direct endpoint examples:")
	for _, p := range providers {
		switch p {
		case "anthropic":
			fmt.Printf("  Anthropic: http://localhost:%s/anthropic/v1/messages\n", proxyPort)
		case "openai":
			fmt.Printf("  OpenAI:    http://localhost:%s/openai/v1/chat/completions\n", proxyPort)
		}
	}

	return nil
}

func homeDir() string {
	home, err := os.UserHomeDir()
	if err != nil {
		return "."
	}
	return home
}
