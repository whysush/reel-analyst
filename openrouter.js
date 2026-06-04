async function analyzeReel(reel) {

    const API_KEY =
        "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";

    const response =
        await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    Authorization:
                        `Bearer ${API_KEY}`,

                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    model:
                        "google/gemma-4-31b-it:free",

                    messages: [
                        {
                            role: "user",

                            content: [

                                {
                                    type: "text",

                                    text:
`You are an expert Instagram Reel analyst.

Analyze this reel.

Return ONLY valid JSON.

{
  "niche":"",
  "hook_strategy":"",
  "emotional_trigger":"",
  "editing_style":"",
  "intended_audience":"",
  "performance_reason":"",
  "inspired_reel_idea":""
}

No markdown.
No explanations.
JSON only.`
                                },

                                {
                                    type:
                                        "image_url",

                                    image_url: {
                                        url:
                                            reel.frames[0]
                                    }
                                }

                            ]
                        }
                    ]
                })
            }
        );

    return await response.json();

}
