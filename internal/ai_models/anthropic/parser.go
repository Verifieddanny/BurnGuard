package anthropic

import "encoding/json"

func ExtractUsage(data []byte) (*ClaudeUsage, float64, float64, string, error) {

	var resp ClaudeResponse

	if err := json.Unmarshal(data, &resp); err != nil {
		return nil, 0.00, 0.00, "", err
	}

	inputCost := resp.InputCost()
	outputCost := resp.OutputCost()

	return &resp.Usage, inputCost, outputCost, resp.Model, nil
}
