import { gen } from "./gen";
import { scorePrompt } from "./prompts";
import { readIssue } from "./read-issue";

interface ModelResult {
	name: string;
	answer: unknown;
}

export async function main() {
	const issue = await readIssue();
	const models = [
		"openai/gpt-oss-120b",
		"deepseek/deepseek-v3.2",
		"google/gemini-3-flash-preview",
		"x-ai/grok-4.1-fast",
	];

	// Step One: собираем ответы от всех моделей
	const pairs = await Promise.all(
		models.map(async (model) => {
			const answer = await gen({
				model,
				systemPrompt: scorePrompt,
				body: issue.body,
			});

			return [model, answer] as const;
		}),
	);

	const results = Object.fromEntries(
		pairs.map(([model, answer]) => [model, { name: model, answer }]),
	) as Record<string, ModelResult>;

	// Step Two: приходим к финальному ответу из всех мнений
	const opinionsBody = pairs
		.map(([model, answer], i) => `# ${i + 1} (${model})\n${answer}`)
		.join("\n\n");

	const finalAnswer = await gen({
		model: models[0] as string,
		systemPrompt:
			"В вопросе оценки рыночной ставки фриланса в СНГ есть несколько мнений. Приди к справедливой цене, которая учитывает все мнения и напиши только её",
		body: opinionsBody,
	});

	console.log(`

# ${finalAnswer}

<details>
  <summary>Показать ответы моделей</summary>

  ${JSON.stringify(results, null, 2)}
</details>
`);
}

await main();
