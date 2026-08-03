package anthropic

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/Verifieddanny/bunguard/internal/storage"
)

type MessageStartEvent struct {
	Type    string `json:"type"`
	Message struct {
		Model string      `json:"model"`
		Usage ClaudeUsage `json:"usage"`
	} `json:"message"`
}

type MessageDeltaEvent struct {
	Type  string `json:"type"`
	Usage struct {
		OutputTokens int `json:"output_tokens"`
	} `json:"usage"`
}

func ParseSSE(dataLines [][]byte, requestPath string) (*storage.Usage, error) {
	var model string
	var inputTokens int
	var outputTokens int
	var foundStart, foundDelta bool

	for _, line := range dataLines {
		// Quick check to avoid unmarshalling every line
		if !foundStart && json.Valid(line) {
			var start MessageStartEvent
			if err := json.Unmarshal(line, &start); err == nil && start.Type == "message_start" {
				model = start.Message.Model
				inputTokens = start.Message.Usage.InputTokens
				foundStart = true
				continue
			}
		}

		if !foundDelta && json.Valid(line) {
			var delta MessageDeltaEvent
			if err := json.Unmarshal(line, &delta); err == nil && delta.Type == "message_delta" {
				outputTokens = delta.Usage.OutputTokens
				foundDelta = true
				continue
			}
		}

		if foundStart && foundDelta {
			break
		}
	}

	if !foundStart || !foundDelta {
		return nil, fmt.Errorf("incomplete SSE stream: start=%v delta=%v", foundStart, foundDelta)
	}

	resp := ClaudeResponse{Model: model}

	resp.Usage.InputTokens = inputTokens
	resp.Usage.OutputTokens = outputTokens
	inputCost := resp.InputCost()
	outputCost := resp.OutputCost()

	return &storage.Usage{
		Timestamp:    time.Now(),
		Provider:     "anthropic",
		Model:        model,
		InputTokens:  inputTokens,
		OutputTokens: outputTokens,
		Cost:         inputCost + outputCost,
		RequestPath:  requestPath,
	}, nil
}
