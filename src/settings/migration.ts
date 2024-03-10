import { ListIndex } from "src/commands/list_index";
import { META_FIELD } from "src/const/metadata_fields";
import type { Hierarchy } from "src/interfaces/hierarchies";
import type {
	BreadcrumbsSettings,
	OLD_BREADCRUMBS_SETTINGS,
} from "src/interfaces/settings";
import type BreadcrumbsPlugin from "src/main";
import { blank_hierarchy } from "src/utils/hierarchies";

export const migrate_old_settings = async (plugin: BreadcrumbsPlugin) => {
	const old = plugin.settings as BreadcrumbsSettings &
		OLD_BREADCRUMBS_SETTINGS;

	// TODO: Eventually, uncomment the delete lines to remove old versions

	// SECTION: Hierarchies
	/// Hierarchies used to just be the Record<Direction, string[]>, but it's now wrapped in an object
	/// We can also handle the move of implied_relationships here
	if (old.userHiers && old.impliedRelations) {
		const implied_relationships: Hierarchy["implied_relationships"] = {
			...blank_hierarchy().implied_relationships,

			self_is_sibling: {
				rounds: Number(old.impliedRelations.siblingIdentity),
			},
			cousin_is_sibling: {
				rounds: Number(old.impliedRelations.cousinsIsSibling),
			},
			same_parent_is_sibling: {
				rounds: Number(old.impliedRelations.sameParentIsSibling),
			},
			same_sibling_is_sibling: {
				rounds: Number(old.impliedRelations.siblingsSiblingIsSibling),
			},
			siblings_parent_is_parent: {
				rounds: Number(old.impliedRelations.siblingsParentIsParent),
			},
			parents_sibling_is_parent: {
				rounds: Number(old.impliedRelations.parentsSiblingsIsParents),
			},
		};

		plugin.settings.hierarchies = old.userHiers.map((hierarchy) => ({
			dirs: hierarchy,
			implied_relationships,
		}));

		delete old.userHiers;
		delete old.impliedRelations;
	}

	// This is a migration _within_ V4. The enabledness of implied_relation was a direct boolean under the kind name.
	// But now, it's wrapped in an object with an `enabled` key.
	if (
		typeof plugin.settings.hierarchies.at(0)?.implied_relationships
			.cousin_is_sibling === "boolean"
	) {
		plugin.settings.hierarchies = plugin.settings.hierarchies.map(
			(hier) => {
				hier.implied_relationships = {
					self_is_sibling: {
						rounds: Number(
							hier.implied_relationships.self_is_sibling,
						),
					},
					opposite_direction: {
						rounds: Number(
							hier.implied_relationships.opposite_direction,
						),
					},
					cousin_is_sibling: {
						rounds: Number(
							hier.implied_relationships.cousin_is_sibling,
						),
					},
					same_parent_is_sibling: {
						rounds: Number(
							hier.implied_relationships.same_parent_is_sibling,
						),
					},
					same_sibling_is_sibling: {
						rounds: Number(
							hier.implied_relationships.same_sibling_is_sibling,
						),
					},
					siblings_parent_is_parent: {
						rounds: Number(
							hier.implied_relationships
								.siblings_parent_is_parent,
						),
					},
					parents_sibling_is_parent: {
						rounds: Number(
							hier.implied_relationships
								.parents_sibling_is_parent,
						),
					},
				};

				return hier;
			},
		);
	}

	// SECTION: Explicit edge sources

	/// Tag note
	if (old.tagNoteField !== undefined) {
		plugin.settings.explicit_edge_sources.tag_note.default_field =
			old.tagNoteField;

		// delete settings.tagNoteField;
	}

	/// List note
	if (
		old.hierarchyNotes !== undefined &&
		old.hierarchyNoteIsParent !== undefined &&
		old.HNUpField !== undefined
	) {
		if (old.hierarchyNotes.length > 0) {
			console.warn(
				`DEPRECATED: The central Hierarchy Notes setting is deprecated in favour of the ${META_FIELD["list-note-field"]} in each hierarchy note.`,
			);
		}

		// TODO: Add the list_note default settings
		// plugin.settings.explicit_edge_sources.list_note = {
		// 	exact: settings.hierarchyNoteIsParent,
		// };

		// delete settings.hierarchyNotes;
		// delete settings.hierarchyNoteIsParent;
		// delete settings.HNUpField;
	}

	/// Dendron
	if (
		old.addDendronNotes !== undefined &&
		old.dendronNoteField !== undefined &&
		old.trimDendronNotes !== undefined &&
		old.dendronNoteDelimiter !== undefined
	) {
		plugin.settings.explicit_edge_sources.dendron_note = {
			enabled: old.addDendronNotes,
			default_field: old.dendronNoteField,
			delimiter: old.dendronNoteDelimiter,
			display_trimmed: old.trimDendronNotes,
		};

		// delete settings.addDendronNotes;
		// delete settings.dendronNoteField;
		// delete settings.trimDendronNotes;
		// delete settings.dendronNoteDelimiter;
	}

	/// Date notes
	if (
		old.addDateNotes !== undefined &&
		old.dateNoteField !== undefined &&
		old.dateNoteFormat !== undefined
	) {
		plugin.settings.explicit_edge_sources.date_note = {
			enabled: old.addDateNotes,
			default_field: old.dateNoteField,
			date_format: old.dateNoteFormat,
		};

		// delete settings.addDateNotes;
		// delete settings.dateNoteField;
		// delete settings.dateNoteFormat;
	}

	// SECTION: Views
	/// Page
	if (old.respectReadableLineLength !== undefined) {
		plugin.settings.views.page.all.readable_line_width =
			old.respectReadableLineLength;

		// delete settings.respectReadableLineLength;
	}

	//// Trail
	if (old.showBCs !== undefined) {
		plugin.settings.views.page.trail.enabled = old.showBCs;
		// delete settings.showBCs;
	}

	if (old.showGrid !== undefined) {
		plugin.settings.views.page.trail.format = old.showGrid
			? "grid"
			: "path";

		// delete settings.showGrid;
	}

	if (old.gridDefaultDepth !== undefined) {
		plugin.settings.views.page.trail.default_depth = old.gridDefaultDepth;
		// delete settings.gridDefaultDepth;
	}

	if (old.noPathMessage !== undefined) {
		plugin.settings.views.page.trail.no_path_message = old.noPathMessage;
		// delete settings.noPathMessage;
	}

	//// Prev/Next
	if (old.showPrevNext !== undefined) {
		plugin.settings.views.page.prev_next.enabled = old.showPrevNext;

		// delete settings.showPrevNext;
	}

	// SECTION: Commands
	/// Rebuild Graph
	if (
		old.showRefreshNotice !== undefined &&
		old.refreshOnNoteSave !== undefined &&
		old.refreshOnNoteChange !== undefined
	) {
		plugin.settings.commands.rebuild_graph.notify = old.showRefreshNotice;

		plugin.settings.commands.rebuild_graph.trigger = {
			note_save: old.refreshOnNoteSave,
			layout_change: old.refreshOnNoteChange,
		};

		// delete settings.showRefreshNotice;
		// delete settings.refreshOnNoteSave;
		// delete settings.refreshOnNoteChange;
	}

	/// List Index
	if (
		old.wikilinkIndex !== undefined &&
		old.aliasesInIndex !== undefined &&
		old.createIndexIndent !== undefined
	) {
		plugin.settings.commands.list_index.default_options = {
			...plugin.settings.commands.list_index.default_options,

			indent: old.createIndexIndent,
			link_kind: old.wikilinkIndex ? "wiki" : "none",
			show_node_options: {
				...ListIndex.DEFAULT_OPTIONS.show_node_options,
				alias: old.aliasesInIndex,
			},
		};

		// delete settings.wikilinkIndex;
		// delete settings.aliasesInIndex;
		// delete settings.createIndexIndent;
	}

	/// Freeze implied edges
	if (old.writeBCsInline !== undefined) {
		plugin.settings.commands.freeze_implied_edges.default_options.destination =
			old.writeBCsInline ? "dataview-inline" : "frontmatter";

		// delete settings.writeBCsInline;
	}

	await plugin.saveSettings();
};
