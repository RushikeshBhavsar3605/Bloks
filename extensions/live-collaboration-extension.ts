import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { Socket } from "socket.io-client";

interface CollaboratorInfo {
  userId: string;
  name: string;
  color: string;
  cursor?: number;
  selection?: { from: number; to: number };
  lastSeen: number;
  isActive: boolean; // Track if user is actively focused on editor
}

interface LiveCollaborationOptions {
  socket: Socket | null;
  documentId: string;
  userId: string;
  userName: string;
}

interface PluginState {
  collaborators: Map<string, CollaboratorInfo>;
  decorations: DecorationSet;
}

// Generate random colors for collaborators
const COLLABORATOR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
];

// Generate random names for collaborators
const COLLABORATOR_NAMES = [
  'Alex', 'Jordan', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn', 'Sage',
  'River', 'Phoenix', 'Rowan', 'Skyler', 'Cameron', 'Emery', 'Finley'
];

function generateCollaboratorInfo(userId: string): { name: string; color: string } {
  // Use userId to generate consistent name and color for the same user
  const nameIndex = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % COLLABORATOR_NAMES.length;
  const colorIndex = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % COLLABORATOR_COLORS.length;
  
  return {
    name: COLLABORATOR_NAMES[nameIndex],
    color: COLLABORATOR_COLORS[colorIndex]
  };
}

export const LiveCollaborationExtension = Extension.create<LiveCollaborationOptions>({
  name: "liveCollaboration",

  addOptions() {
    return {
      socket: null,
      documentId: "",
      userId: "",
      userName: "",
    };
  },

  addProseMirrorPlugins() {
    const { socket, documentId, userId, userName } = this.options;

    const liveCollaborationPlugin = new Plugin<PluginState>({
      key: new PluginKey("liveCollaboration"),

      state: {
        init(): PluginState {
          return {
            collaborators: new Map(),
            decorations: DecorationSet.empty,
          };
        },

        apply(tr, value, oldState, newState): PluginState {
          let { collaborators, decorations } = value;

          // If this is a document change from collaboration, adjust cursor positions
          if (tr.docChanged && tr.getMeta("isReceiving")) {
            collaborators.forEach((collaborator, userId) => {
              if (collaborator.cursor !== undefined) {
                // Map the cursor position through the document changes
                const mappedCursor = tr.mapping.map(collaborator.cursor, -1);
                // Ensure the mapped position is valid
                const validCursor = Math.max(0, Math.min(mappedCursor, newState.doc.content.size));
                collaborator.cursor = validCursor;
              }
              
              if (collaborator.selection) {
                // Map selection positions through the document changes
                const mappedFrom = tr.mapping.map(collaborator.selection.from, -1);
                const mappedTo = tr.mapping.map(collaborator.selection.to, 1);
                const validFrom = Math.max(0, Math.min(mappedFrom, newState.doc.content.size));
                const validTo = Math.max(0, Math.min(mappedTo, newState.doc.content.size));
                
                if (validFrom !== validTo) {
                  collaborator.selection = { from: validFrom, to: validTo };
                } else {
                  collaborator.selection = undefined;
                }
              }
            });
          }

          // Update decorations based on current collaborators
          const newDecorations: Decoration[] = [];

          collaborators.forEach((collaborator) => {
            if (collaborator.userId === userId) return; // Don't show our own cursor

            // Remove stale collaborators (inactive for more than 30 seconds)
            if (Date.now() - collaborator.lastSeen > 30000) {
              collaborators.delete(collaborator.userId);
              return;
            }

            // Add cursor decoration only if collaborator is active (focused on editor)
            if (collaborator.isActive && 
                collaborator.cursor !== undefined && 
                collaborator.cursor >= 0 && 
                collaborator.cursor <= newState.doc.content.size) {
              const cursorDecoration = Decoration.widget(
                collaborator.cursor,
                () => {
                  const cursor = document.createElement("span");
                  cursor.className = "live-cursor";
                  cursor.style.cssText = `
                    position: absolute;
                    width: 2px;
                    height: 1.2em;
                    background-color: ${collaborator.color};
                    pointer-events: none;
                    z-index: 10;
                    animation: none !important;
                    opacity: 1 !important;
                  `;
                  
                  // Add collaborator name label
                  const label = document.createElement("span");
                  label.className = "live-cursor-label";
                  label.textContent = collaborator.name;
                  label.style.cssText = `
                    position: absolute;
                    top: -24px;
                    left: 0;
                    background-color: ${collaborator.color};
                    color: white;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 500;
                    white-space: nowrap;
                    pointer-events: none;
                    z-index: 11;
                  `;
                  
                  cursor.appendChild(label);
                  return cursor;
                },
                { side: -1 }
              );
              newDecorations.push(cursorDecoration);
            }

            // Add selection decoration
            if (collaborator.selection && collaborator.selection.from !== collaborator.selection.to) {
              const { from, to } = collaborator.selection;
              if (from >= 0 && to <= newState.doc.content.size && from < to) {
                const selectionDecoration = Decoration.inline(from, to, {
                  class: "live-selection",
                  style: `background-color: ${collaborator.color}20; border-radius: 2px;`,
                });
                newDecorations.push(selectionDecoration);
              }
            }
          });

          return {
            collaborators,
            decorations: DecorationSet.create(newState.doc, newDecorations),
          };
        },
      },

      props: {
        decorations(state) {
          return this.getState(state)?.decorations;
        },
      },

      view(editorView) {
        if (!socket || !documentId || !userId) return {};

        const { color } = generateCollaboratorInfo(userId);
        const realUserName = userName || generateCollaboratorInfo(userId).name;

        // Handle incoming cursor/selection updates
        const handleCursorUpdate = (data: {
          documentId: string;
          userId: string;
          userName: string;
          color: string;
          cursor?: number;
          selection?: { from: number; to: number };
          isActive?: boolean;
        }) => {
          if (data.documentId !== documentId || data.userId === userId) return;

          const pluginState = liveCollaborationPlugin.getState(editorView.state);
          if (!pluginState) return;

          // Validate cursor position before setting
          const currentDocSize = editorView.state.doc.content.size;
          const validCursor = data.cursor !== undefined ? 
            Math.max(0, Math.min(data.cursor, currentDocSize)) : undefined;
          
          // Validate selection positions
          let validSelection = data.selection;
          if (data.selection) {
            const validFrom = Math.max(0, Math.min(data.selection.from, currentDocSize));
            const validTo = Math.max(0, Math.min(data.selection.to, currentDocSize));
            validSelection = validFrom !== validTo ? { from: validFrom, to: validTo } : undefined;
          }

          const collaborator: CollaboratorInfo = {
            userId: data.userId,
            name: data.userName || generateCollaboratorInfo(data.userId).name,
            color: data.color || generateCollaboratorInfo(data.userId).color,
            cursor: validCursor,
            selection: validSelection,
            lastSeen: Date.now(),
            isActive: data.isActive ?? true,
          };

          pluginState.collaborators.set(data.userId, collaborator);

          // Trigger immediate state update for cursor visibility
          const tr = editorView.state.tr;
          editorView.dispatch(tr);
        };

        // Handle collaborator disconnect
        const handleCollaboratorDisconnect = (data: { userId: string }) => {
          const pluginState = liveCollaborationPlugin.getState(editorView.state);
          if (!pluginState) return;

          pluginState.collaborators.delete(data.userId);

          // Trigger immediate state update for cursor removal
          const tr = editorView.state.tr;
          editorView.dispatch(tr);
        };

        socket.on("cursor-update", handleCursorUpdate);
        socket.on("collaborator-disconnect", handleCollaboratorDisconnect);

        // Track editor focus state
        let isEditorFocused = false;

        const handleFocus = () => {
          isEditorFocused = true;
          // Send cursor update when editor gains focus
          socket.emit("cursor-update", {
            documentId,
            userId,
            userName: realUserName,
            color,
            cursor: editorView.state.selection.head,
            selection: editorView.state.selection.empty ? undefined : {
              from: editorView.state.selection.from,
              to: editorView.state.selection.to,
            },
            isActive: true,
          });
        };

        const handleBlur = () => {
          isEditorFocused = false;
          // Send cursor removal when editor loses focus
          socket.emit("cursor-update", {
            documentId,
            userId,
            userName: realUserName,
            color,
            isActive: false,
          });
        };

        // Add focus/blur event listeners to the editor DOM element
        const editorElement = editorView.dom;
        editorElement.addEventListener('focus', handleFocus);
        editorElement.addEventListener('blur', handleBlur);

        // Check initial focus state
        if (document.activeElement === editorElement) {
          handleFocus();
        }

        // Track selection changes and broadcast them only when focused
        let lastSelection = editorView.state.selection;
        
        const sendCursorUpdate = (selection: any) => {
          // Double-check that positions are still valid before sending
          const currentDocSize = editorView.state.doc.content.size;
          const validCursor = Math.max(0, Math.min(selection.head, currentDocSize));
          const validSelection = selection.empty ? undefined : {
            from: Math.max(0, Math.min(selection.from, currentDocSize)),
            to: Math.max(0, Math.min(selection.to, currentDocSize)),
          };
          
          socket.emit("cursor-update", {
            documentId,
            userId,
            userName: realUserName,
            color,
            cursor: validCursor,
            selection: validSelection,
            isActive: true,
          });
        };

        const checkSelectionChange = () => {
          if (!isEditorFocused) return; // Only track when editor is focused
          
          const currentSelection = editorView.state.selection;
          
          if (
            currentSelection.head !== lastSelection.head ||
            currentSelection.from !== lastSelection.from ||
            currentSelection.to !== lastSelection.to
          ) {
            lastSelection = currentSelection;
            sendCursorUpdate(currentSelection);
          }
        };

        // Set up periodic selection checking with longer interval
        const selectionInterval = setInterval(checkSelectionChange, 200);

        return {
          destroy() {
            socket.off("cursor-update", handleCursorUpdate);
            socket.off("collaborator-disconnect", handleCollaboratorDisconnect);
            clearInterval(selectionInterval);
            
            // Remove focus/blur event listeners
            editorElement.removeEventListener('focus', handleFocus);
            editorElement.removeEventListener('blur', handleBlur);
            
            // Notify others that we're disconnecting
            socket.emit("collaborator-disconnect", { userId });
          },
        };
      },
    });

    return [liveCollaborationPlugin];
  },

  addGlobalAttributes() {
    return [
      {
        types: ["doc"],
        attributes: {
          class: {
            default: "live-collaboration-editor",
          },
        },
      },
    ];
  },
});