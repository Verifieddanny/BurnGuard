package anthropic

type ClaudeResponse struct {
	Model string      `json:"model"`
	Usage ClaudeUsage `json:"usage"`
}

type ClaudeUsage struct {
	InputTokens              int           `json:"input_tokens"`
	OutputTokens             int           `json:"output_tokens"`
	CacheCreationInputTokens int           `json:"cache_creation_input_tokens"`
	CacheReadInputTokens     int           `json:"cache_read_input_tokens"`
	CacheCreation            CacheCreation `json:"cache_creation"`
}

type CacheCreation struct {
	Ephemeral5mInputTokens int `json:"ephemeral_5m_input_tokens"`
	Ephemeral1hInputTokens int `json:"ephemeral_1h_input_tokens"`
}
