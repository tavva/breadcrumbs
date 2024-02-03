import type { Direction } from "src/const/hierarchies";

export type ICodeblock = {
	Options: {
		type: "tree";
		dir: Direction;
		title?: string;
		fields?: string[];
		depth: [number, number];
		flat: boolean;
		from?: string;
		content?: "open" | "closed";
		sort_by: "default" | "basename";
		sort_order: 1 | -1;
	};
};
