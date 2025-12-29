import { readFile } from "node:fs/promises";

export type Issue = {
	number: number;
	title: string;
	body: string;
	url?: string;
	user?: string;
	labels?: string[];
};

export async function readIssue(): Promise<Issue> {
	const path = process.env.ISSUE_PATH!;
	const raw = await readFile(path, "utf8");
	return JSON.parse(raw) as Issue;
}
