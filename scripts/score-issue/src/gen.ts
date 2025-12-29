import { OpenRouter } from "@openrouter/sdk";

const client = new OpenRouter({
	apiKey: process.env.OPENROUTER_KEY,
});

export async function gen({
	model,
	systemPrompt,
	body,
}: {
	model: string;
	systemPrompt: string;
	body: string;
}): Promise<string | null> {
	try {
		const result = await client.chat.send({
			model: model,
			provider: {
				sort: "price",
			},
			reasoning: {
				effort: "high",
			},
			messages: [
				{
					role: "system",
					content: systemPrompt,
				},
				{
					role: "user",
					content: body,
				},
			],
		});

		const content = result.choices?.[0]?.message?.content;
		return typeof content === "string" ? content : null;
	} catch (error) {
		console.error("Error generating response:", error);
		return null;
	}
}
