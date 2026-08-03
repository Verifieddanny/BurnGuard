package openai

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/Verifieddanny/bunguard/internal/storage"
)

func ParseSSE(dataLines [][]byte, requestPath string) (*storage.Usage, error) {
	var model string
	var promptTokens int
	var completionTokens int
	var found bool

	for _, line := range dataLines {
		if !json.Valid(line) {
			continue
		}

		var chunk OpenAIResponse
		if err := json.Unmarshal(line, &chunk); err != nil {
			continue
		}

		if chunk.Model != "" && model == "" {
			model = chunk.Model
		}

		if chunk.Usage.TotalTokens > 0 {
			promptTokens = chunk.Usage.PromptTokens
			completionTokens = chunk.Usage.CompletionTokens
			found = true
		}
	}

	if !found {
		return nil, fmt.Errorf("no usage data found in OpenAI SSE stream")
	}

	resp := OpenAIResponse{
		Model: model,
		Usage: OpenAIUsage{
			PromptTokens:     promptTokens,
			CompletionTokens: completionTokens,
		},
	}

	inputCost := resp.InputCost()
	outputCost := resp.OutputCost()

	return &storage.Usage{
		Timestamp:    time.Now(),
		Provider:     "openai",
		Model:        model,
		InputTokens:  promptTokens,
		OutputTokens: completionTokens,
		Cost:         inputCost + outputCost,
		RequestPath:  requestPath,
	}, nil
}