package openai

import "encoding/json"

func ExtractUsage(data []byte) (*OpenAIUsage, float64, float64, string, error) {
	var resp OpenAIResponse

	if err := json.Unmarshal(data, &resp); err != nil {
		return nil, 0, 0, "", err
	}

	inputCost := resp.InputCost()
	outputCost := resp.OutputCost()

	return &resp.Usage, inputCost, outputCost, resp.Model, nil
}

