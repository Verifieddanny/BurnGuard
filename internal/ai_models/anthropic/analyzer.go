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
	var rate float64

	switch cr.Model {
	case "claude-fable-5":
		rate = FableInputUSDCost
	case "claude-opus-4-8", "claude-opus-4-7", "claude-opus-4-6", "claude-opus-4-5", "claude-opus-4-5-20251101":
		rate = OpusInputUSDCost
	case "claude-sonnet-4-6", "claude-sonnet-4-5", "claude-sonnet-4-5-20250929":
		rate = SonnetInputUSDCost
	case "claude-haiku-4-5":
		rate = HaikuInputUSDCost
	default:
		rate = OldHaikuInputUSDCost
	}

	standardCost := float64(cr.Usage.InputTokens) * rate
	cacheCreationCost := float64(cr.Usage.CacheCreationInputTokens) * rate * 1.25
	cacheReadCost := float64(cr.Usage.CacheReadInputTokens) * rate * 0.10

	return standardCost + cacheCreationCost + cacheReadCost
}

func (cr ClaudeResponse) OutputCost() float64 {
	var rate float64

	switch cr.Model {
	case "claude-fable-5":
		rate = FableOutputUSDCost
	case "claude-opus-4-8", "claude-opus-4-7", "claude-opus-4-6", "claude-opus-4-5", "claude-opus-4-5-20251101":
		rate = OpusOutputUSDCost
	case "claude-sonnet-4-6", "claude-sonnet-4-5", "claude-sonnet-4-5-20250929":
		rate = SonnetOutputUSDCost
	case "claude-haiku-4-5":
		rate = HaikuOutputUSDCost
	default:
		rate = OldHaikuOutputUSDCost
	}
	// standardCost := float64(cr.Usage.OutputTokens) * rate
	// cacheCreationCost := float64(cr.Usage.CacheCreationOutputTokens) * rate * 1.25
	return float64(cr.Usage.OutputTokens) * rate
}
