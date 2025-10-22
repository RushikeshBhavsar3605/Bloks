import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Step } from "@tiptap/pm/transform";
import { Socket } from "socket.io-client";

interface CollaborationOptions {
  socket: Socket | null;
  documentId: string;
  userId: string;
  onReceiveUpdate?: (update: any) => void;
}

interface PluginState {
  isReceiving: boolean;
}

interface CollaborationStorage {
  cleanup?: () => void;
}

export const CollaborationExtension = Extension.create<
  CollaborationOptions,
  CollaborationStorage
>({
  name: "collaboration",

  addOptions() {
    return {
      socket: null,
      documentId: "",
      userId: "",
      onReceiveUpdate: undefined,
    };
  },

  addProseMirrorPlugins() {
    const { socket, documentId, userId } = this.options;
    const extension = this;

    const collaborationPlugin = new Plugin<PluginState>({
      key: new PluginKey("collaboration"),

      state: {
        init(): PluginState {
          return {
            isReceiving: false,
          };
        },
        apply(tr, value): PluginState {
          // CRITICAL FIX: Only set isReceiving to true if this specific transaction has the meta
          // Don't carry over the previous state to prevent permanent blocking
          const isReceiving = tr.getMeta("isReceiving") === true;
          return { isReceiving };
        },
      },

      view(editorView) {
        // Set up socket listener when the view is created (editor is ready)
        // Only proceed if we have all required dependencies
        if (socket && documentId && userId) {
          const handleDocChange = (data: {
            documentId: string;
            userId: string;
            steps: any[];
            version: number;
            timestamp: number;
          }) => {
            console.log(`[${userId}] Received doc-change:`, data);

            // Ignore our own changes
            if (data.userId === userId) {
              console.log(`[${userId}] Ignoring own change`);
              return;
            }

            // Only process changes for this document
            if (data.documentId !== documentId) {
              console.log(`[${userId}] Ignoring change for different document`);
              return;
            }

            // Apply the received steps to the editor
            if (data.steps && data.steps.length > 0) {
              const { state, dispatch } = editorView;

              try {
                let tr = state.tr;

                // Mark this transaction as receiving to prevent feedback loops
                tr = tr.setMeta("isReceiving", true);
                tr = tr.setMeta("addToHistory", false); // Don't add to undo history

                console.log(`[${userId}] Applying`, data.steps.length, "steps");

                // Apply each step
                data.steps.forEach((stepJSON, index) => {
                  try {
                    const step = Step.fromJSON(state.schema, stepJSON);
                    const result = tr.maybeStep(step);
                    if (result.failed) {
                      console.warn(
                        `[${userId}] Failed to apply step ${index}:`,
                        result.failed
                      );
                    } else {
                      console.log(
                        `[${userId}] Applied step ${index} successfully`
                      );
                    }
                  } catch (stepError) {
                    console.warn(
                      `[${userId}] Error parsing step ${index}:`,
                      stepError
                    );
                  }
                });

                if (tr.docChanged) {
                  console.log(`[${userId}] DISPATCHING received changes`);
                  dispatch(tr);
                } else {
                  console.log(`[${userId}] No changes to dispatch`);
                }
              } catch (error) {
                console.error(
                  `[${userId}] Error applying collaborative changes:`,
                  error
                );
              }
            }
          };

          // Remove any existing listeners first to prevent duplicates
          socket.off("doc-change", handleDocChange);

          console.log(
            `[${userId}] Setting up doc-change listener for document:`,
            documentId
          );
          socket.on("doc-change", handleDocChange);

          // Store cleanup function - ensure storage exists
          if (!extension.storage) {
            extension.storage = {};
          }
          extension.storage.cleanup = () => {
            console.log(`[${userId}] Cleaning up doc-change listener`);
            socket.off("doc-change", handleDocChange);
          };
        }

        return {
          destroy() {
            // Clean up when view is destroyed
            if (extension.storage?.cleanup) {
              extension.storage.cleanup();
            }
          },
        };
      },

      appendTransaction: (transactions, oldState, newState) => {
        // CRITICAL FIX: Check each transaction individually for the isReceiving meta
        // Don't rely on plugin state which can get stuck
        const hasReceivingTransaction = transactions.some(
          (tr) => tr.getMeta("isReceiving") === true
        );

        console.log(`[${userId}] appendTransaction check:`, {
          hasReceivingTransaction,
          transactionCount: transactions.length,
          hasSocket: !!socket,
          hasDocumentId: !!documentId,
          hasUserId: !!userId,
        });

        if (hasReceivingTransaction) {
          console.log(
            `[${userId}] Skipping emit - transaction marked as receiving`
          );
          return null;
        }

        // Check if there are actual document changes from user input
        const userChanges = transactions.filter(
          (tr) =>
            tr.docChanged &&
            tr.getMeta("isReceiving") !== true &&
            tr.steps.length > 0
        );

        console.log(`[${userId}] User changes found:`, userChanges.length);

        if (userChanges.length > 0 && socket && documentId && userId) {
          // Get the steps from user transactions
          const steps = userChanges.flatMap((tr) =>
            tr.steps.map((step) => step.toJSON())
          );

          if (steps.length > 0) {
            console.log(
              `[${userId}] EMITTING doc-change with`,
              steps.length,
              "steps for document:",
              documentId
            );

            // Emit the changes via socket immediately
            socket.emit("doc-change", {
              documentId,
              userId,
              steps,
              version: newState.doc.content.size,
              timestamp: Date.now(),
            });
          }
        } else {
          console.log(`[${userId}] NOT emitting - missing requirements:`, {
            userChanges: userChanges.length,
            socket: !!socket,
            documentId: !!documentId,
            userId: !!userId,
          });
        }

        return null;
      },
    });

    return [collaborationPlugin];
  },

  onCreate() {
    // Socket listener setup is now handled in the plugin's view method
    // This ensures proper timing when the editor is ready
  },

  onDestroy() {
    // Clean up socket listeners
    if (this.storage?.cleanup) {
      this.storage.cleanup();
    }
  },
});
