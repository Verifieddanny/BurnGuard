package openai

// Per-token costs (price per 1M tokens ÷ 1,000,000)
const (
	// GPT-4o
	GPT4oInputCost  float64 = 0.0000025 // $2.50/1M
	GPT4oOutputCost float64 = 0.00001   // $10/1M

	// GPT-4o mini
	GPT4oMiniInputCost  float64 = 0.00000015 // $0.15/1M
	GPT4oMiniOutputCost float64 = 0.0000006  // $0.60/1M

	// GPT-4.1
	GPT41InputCost  float64 = 0.000002 // $2/1M
	GPT41OutputCost float64 = 0.000008 // $8/1M

	// GPT-4.1 mini
	GPT41MiniInputCost  float64 = 0.0000004 // $0.40/1M
	GPT41MiniOutputCost float64 = 0.0000016 // $1.60/1M

	// GPT-4.1 nano
	GPT41NanoInputCost  float64 = 0.0000001 // $0.10/1M
	GPT41NanoOutputCost float64 = 0.0000004 // $0.40/1M

	// o3
	O3InputCost  float64 = 0.000002 // $2/1M
	O3OutputCost float64 = 0.000008 // $8/1M

	// o3-mini
	O3MiniInputCost  float64 = 0.0000011 // $1.10/1M
	O3MiniOutputCost float64 = 0.0000044 // $4.40/1M

	// o4-mini
	O4MiniInputCost  float64 = 0.0000011 // $1.10/1M
	O4MiniOutputCost float64 = 0.0000044 // $4.40/1M

	// o1
	O1InputCost  float64 = 0.000015 // $15/1M
	O1OutputCost float64 = 0.00006  // $60/1M

	// GPT-5
	GPT5InputCost  float64 = 0.00000125 // $1.25/1M
	GPT5OutputCost float64 = 0.00001    // $10/1M

	// GPT-5 mini
	GPT5MiniInputCost  float64 = 0.00000025 // $0.25/1M
	GPT5MiniOutputCost float64 = 0.000002   // $2/1M

	// GPT-5 nano
	GPT5NanoInputCost  float64 = 0.00000005 // $0.05/1M
	GPT5NanoOutputCost float64 = 0.0000004  // $0.40/1M

	// Fallback
	FallbackInputCost  float64 = 0.000002 // $2/1M
	FallbackOutputCost float64 = 0.000008 // $8/1M
)

func (r OpenAIResponse) InputCost() float64 {
	var rate float64

	switch r.Model {
	case "gpt-4o", "gpt-4o-2024-11-20", "gpt-4o-2024-08-06", "gpt-4o-2024-05-13":
		rate = GPT4oInputCost
	case "gpt-4o-mini", "gpt-4o-mini-2024-07-18":
		rate = GPT4oMiniInputCost
	case "gpt-4.1":
		rate = GPT41InputCost
	case "gpt-4.1-mini":
		rate = GPT41MiniInputCost
	case "gpt-4.1-nano":
		rate = GPT41NanoInputCost
	case "o3", "o3-2025-04-16":
		rate = O3InputCost
	case "o3-mini", "o3-mini-2025-01-31":
		rate = O3MiniInputCost
	case "o4-mini", "o4-mini-2025-04-16":
		rate = O4MiniInputCost
	case "o1", "o1-2024-12-17":
		rate = O1InputCost
	case "gpt-5":
		rate = GPT5InputCost
	case "gpt-5-mini":
		rate = GPT5MiniInputCost
	case "gpt-5-nano":
		rate = GPT5NanoInputCost
	default:
		rate = FallbackInputCost
	}

	cachedTokens := float64(r.Usage.PromptTokensDetails.CachedTokens)
	uncachedTokens := float64(r.Usage.PromptTokens) - cachedTokens

	cacheDiscount := 0.5
	switch r.Model {
	case "gpt-5.4", "gpt-5.4-mini", "gpt-5.4-nano", "gpt-5.5", "gpt-5.6-sol", "gpt-5.6-terra", "gpt-5.6-luna":
		cacheDiscount = 0.1
	}

	return (uncachedTokens * rate) + (cachedTokens * rate * cacheDiscount)
}

func (r OpenAIResponse) OutputCost() float64 {
	tokens := float64(r.Usage.CompletionTokens)

	switch r.Model {
	case "gpt-4o", "gpt-4o-2024-11-20", "gpt-4o-2024-08-06", "gpt-4o-2024-05-13":
		return tokens * GPT4oOutputCost
	case "gpt-4o-mini", "gpt-4o-mini-2024-07-18":
		return tokens * GPT4oMiniOutputCost
	case "gpt-4.1":
		return tokens * GPT41OutputCost
	case "gpt-4.1-mini":
		return tokens * GPT41MiniOutputCost
	case "gpt-4.1-nano":
		return tokens * GPT41NanoOutputCost
	case "o3", "o3-2025-04-16":
		return tokens * O3OutputCost
	case "o3-mini", "o3-mini-2025-01-31":
		return tokens * O3MiniOutputCost
	case "o4-mini", "o4-mini-2025-04-16":
		return tokens * O4MiniOutputCost
	case "o1", "o1-2024-12-17":
		return tokens * O1OutputCost
	case "gpt-5":
		return tokens * GPT5OutputCost
	case "gpt-5-mini":
		return tokens * GPT5MiniOutputCost
	case "gpt-5-nano":
		return tokens * GPT5NanoOutputCost
	default:
		return tokens * FallbackOutputCost
	}
}
