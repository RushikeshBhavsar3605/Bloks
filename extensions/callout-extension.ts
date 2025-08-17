import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { CalloutNodeView } from './callout-node-view'

export interface CalloutOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: {
      /**
       * Set a callout node
       */
      setCallout: () => ReturnType
      /**
       * Toggle a callout node
       */
      toggleCallout: () => ReturnType
      /**
       * Unset a callout node
       */
      unsetCallout: () => ReturnType
    }
  }
}

export const CalloutExtension = Node.create<CalloutOptions>({
  name: 'callout',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  group: 'block',

  content: 'paragraph+',

  defining: true,

  addAttributes() {
    return {}
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-callout]',
        priority: 100,
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-callout': '',
        class: 'callout-container',
      }),
      0,
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutNodeView)
  },

  addCommands() {
    return {
      setCallout:
        () =>
        ({ commands }) => {
          return commands.wrapIn(this.name)
        },
      toggleCallout:
        () =>
        ({ commands }) => {
          if (this.editor.isActive(this.name)) {
            return commands.lift(this.name)
          }
          
          // Create an empty callout with a placeholder paragraph
          const { from, to } = this.editor.state.selection
          if (from === to) {
            return commands.insertContent({
              type: this.name,
              content: [{
                type: 'paragraph',
                content: []
              }]
            })
          }
          
          return commands.wrapIn(this.name)
        },
      unsetCallout:
        () =>
        ({ commands }) => {
          return commands.lift(this.name)
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-c': () => this.editor.commands.toggleCallout(),
    }
  },
})