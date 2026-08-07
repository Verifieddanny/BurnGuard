package openai

type OpenAIResponse struct {
	Model string      `json:"model"`
	Usage OpenAIUsage `json:"usage"`
}

type OpenAIUsage struct {
	PromptTokens     int `json:"prompt_tokens"`
	CompletionTokens int `json:"completion_tokens"`
	TotalTokens      int `json:"total_tokens"`
	PromptTokensDetails struct {
        CachedTokens int `json:"cached_tokens"`
    } `json:"prompt_tokens_details"`
}