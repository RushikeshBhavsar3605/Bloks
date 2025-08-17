import React from 'react'
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import { cn } from '@/lib/utils'

interface CalloutNodeViewProps {
  node: any
  updateAttributes: (attributes: Record<string, any>) => void
  selected: boolean
}

export const CalloutNodeView: React.FC<CalloutNodeViewProps> = () => {
  return (
    <NodeViewWrapper className="callout-wrapper mb-4">
      <div className="rounded-xl border border-blue-200 dark:border-blue-800/30 bg-blue-50 dark:bg-blue-950/20 p-6 transition-all duration-200">
        <div className="leading-relaxed min-h-[1.5rem] text-blue-900 dark:text-blue-100">
          <NodeViewContent />
        </div>
      </div>
    </NodeViewWrapper>
  )
}