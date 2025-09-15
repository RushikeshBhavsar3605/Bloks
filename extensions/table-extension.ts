import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export const TableControlsExtension = Extension.create({
  name: "tableControls",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("tableControls"),
        props: {
          decorations: (state) => {
            const decorations: Decoration[] = [];
            const { doc, selection } = state;

            // Find all table nodes
            doc.descendants((node, pos) => {
              if (node.type.name === "table") {
                // Add decorations for table controls
                decorations.push(
                  Decoration.widget(pos + node.nodeSize, () => {
                    const controlsContainer = document.createElement("div");
                    controlsContainer.className = "table-controls-container";
                    controlsContainer.innerHTML = `
                      <div class="table-controls">
                        <button class="table-control-btn add-row" data-action="addRowBelow" title="Add row below">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                        </button>
                        <button class="table-control-btn add-col" data-action="addColumnAfter" title="Add column after">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                        </button>
                        <button class="table-control-btn delete-table" data-action="deleteTable" title="Delete table">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </button>
                      </div>
                    `;

                    // Add event listeners
                    const buttons = controlsContainer.querySelectorAll(".table-control-btn");
                    buttons.forEach((button) => {
                      button.addEventListener("click", (e) => {
                        e.preventDefault();
                        const action = (e.currentTarget as HTMLElement).dataset.action;
                        const editor = this.editor;

                        switch (action) {
                          case "addRowBelow":
                            editor.chain().focus().addRowAfter().run();
                            break;
                          case "addColumnAfter":
                            editor.chain().focus().addColumnAfter().run();
                            break;
                          case "deleteTable":
                            editor.chain().focus().deleteTable().run();
                            break;
                        }
                      });
                    });

                    return controlsContainer;
                  })
                );
              }
            });

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  },

  addGlobalAttributes() {
    return [
      {
        types: ["tableCell", "tableHeader"],
        attributes: {
          style: {
            default: null,
            parseHTML: (element) => element.getAttribute("style"),
            renderHTML: (attributes) => {
              if (!attributes.style) {
                return {};
              }
              return { style: attributes.style };
            },
          },
        },
      },
    ];
  },
});