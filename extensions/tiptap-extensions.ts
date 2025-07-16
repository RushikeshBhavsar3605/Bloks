import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

// Selection Extension - Highlights the selected text
export const SelectionExtension = Extension.create({
  name: "selection",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("selection"),
        props: {
          decorations(state) {
            if (state.selection.empty) return null;

            return DecorationSet.create(state.doc, [
              Decoration.inline(state.selection.from, state.selection.to, {
                class: "ProseMirror-selection",
              }),
            ]);
          },
        },
      }),
    ];
  },
});

// Trailing Node Extension - Ensures there's always a trailing paragraph
export const TrailingNodeExtension = Extension.create({
  name: "trailingNode",

  addProseMirrorPlugins() {
    let plugin: Plugin;

    plugin = new Plugin({
      key: new PluginKey("trailingNode"),
      appendTransaction: (_, __, state) => {
        const { doc, tr } = state;
        const shouldInsertNodeAtEnd = plugin.getState(state);
        const endPosition = doc.content.size;

        if (!shouldInsertNodeAtEnd) {
          return;
        }

        return tr.insert(endPosition, state.schema.nodes.paragraph.create());
      },
      state: {
        init: (_, state) => {
          const lastNode = state.doc.lastChild;
          return !lastNode || lastNode.type.name !== "paragraph";
        },
        apply: (tr, value) => {
          if (!tr.docChanged) {
            return value;
          }

          const lastNode = tr.doc.lastChild;
          return !lastNode || lastNode.type.name !== "paragraph";
        },
      },
    });

    return [plugin];
  },
});

// extensions/CustomCodeBlock.ts
export const CustomCodeBlock = Extension.create({
  name: "customCodeBlockToggle",

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-e": () => {
        const { state, commands } = this.editor;
        const { from, to } = state.selection;

        if (this.editor.isActive("codeBlock")) {
          return commands.toggleCodeBlock();
        }

        const text = state.doc.textBetween(from, to, "\n");

        this.editor
          .chain()
          .focus()
          .deleteRange({ from, to })
          .insertContentAt(from, {
            type: "codeBlock",
            content: [{ type: "text", text }],
          })
          .run();

        return true;
      },
    };
  },
});
