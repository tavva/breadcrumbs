import type { BCEdge, BCEdgeAttributes } from "src/graph/MyMultiGraph";

export const _mock_edge = (
	source_id: string,
	target_id: string,
	attr?: Partial<BCEdgeAttributes>,
): Pick<
	BCEdge,
	"attr" | "source_id" | "target_id" | "source_attr" | "target_attr"
> => ({
	source_id,
	target_id,
	source_attr: { resolved: true },
	target_attr: { resolved: true },
	attr:
		attr?.explicit === true || attr?.explicit === undefined
			? {
					dir: "down",
					field: "child",
					hierarchy_i: 0,
					source: "typed_link",
					explicit: true as const,

					...(attr as Partial<
						Extract<BCEdgeAttributes, { explicit: true }>
					>),
				}
			: {
					round: 1,
					dir: "down",
					field: "child",
					hierarchy_i: 0,
					explicit: false as const,
					implied_kind: "opposite_direction",

					...(attr as Partial<
						Extract<BCEdgeAttributes, { explicit: false }>
					>),
				},
});
