package anthropic

const (
	// Input USD Cost
	FableInputUSDCost    float64 = 0.00001
	OpusInputUSDCost     float64 = 0.000005
	SonnetInputUSDCost   float64 = 0.000003
	HaikuInputUSDCost    float64 = 0.000001
	OldHaikuInputUSDCost float64 = 0.0000008

	// Output USD Cost
	FableOutputUSDCost    float64 = 0.00005
	OpusOutputUSDCost     float64 = 0.000025
	SonnetOutputUSDCost   float64 = 0.000015
	HaikuOutputUSDCost    float64 = 0.000005
	OldHaikuOutputUSDCost float64 = 0.000004
)

func (cr ClaudeResponse) InputCost() float64 {
	inputToken := float64(cr.Usage.InputTokens)

	switch cr.Model {
	case "claude-fable-5":
		return inputToken * FableInputUSDCost
	case "claude-opus-4-8", "claude-opus-4-7", "claude-opus-4-6", "claude-opus-4-5", "claude-opus-4-5-20251101":
		return inputToken * OpusInputUSDCost
	case "claude-sonnet-4-6", "claude-sonnet-4-5", "claude-sonnet-4-5-20250929":
		return inputToken * SonnetInputUSDCost
	case "claude-haiku-4-5":
		return inputToken * HaikuInputUSDCost
	default:
		return inputToken * OldHaikuInputUSDCost
	}
}

func (cr ClaudeResponse) OutputCost() float64 {
	outputToken := float64(cr.Usage.OutputTokens)

	switch cr.Model {
	case "claude-fable-5":
		return outputToken * FableOutputUSDCost
	case "claude-opus-4-8", "claude-opus-4-7", "claude-opus-4-6", "claude-opus-4-5", "claude-opus-4-5-20251101":
		return outputToken * OpusOutputUSDCost
	case "claude-sonnet-4-6", "claude-sonnet-4-5", "claude-sonnet-4-5-20250929":
		return outputToken * SonnetOutputUSDCost
	case "claude-haiku-4-5":
		return outputToken * HaikuOutputUSDCost
	default:
		return outputToken * OldHaikuOutputUSDCost
	}
}
