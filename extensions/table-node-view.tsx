import React from 'react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { Plus, Trash2 } from 'lucide-react';

interface TableNodeViewProps {
  node: any;
  updateAttributes: (attributes: any) => void;
  deleteNode: () => void;
  editor: any;
}

export const TableNodeView: React.FC<TableNodeViewProps> = ({
  node,
  updateAttributes,
  deleteNode,
  editor,
}) => {
  const addRowBelow = () => {
    editor.chain().focus().addRowAfter().run();
  };

  const addColumnAfter = () => {
    editor.chain().focus().addColumnAfter().run();
  };

  const deleteTable = () => {
    editor.chain().focus().deleteTable().run();
  };

  return (
    <NodeViewWrapper className="table-wrapper relative group">
      <div className="relative overflow-x-auto">
        <NodeViewContent as="div" />
        
        {/* Table Controls - Only visible on hover */}
        <div className="absolute -bottom-8 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2 z-10">
          <button
            onClick={addRowBelow}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-white dark:bg-[#1a1a1c] border border-gray-200 dark:border-[#2a2a2e] rounded shadow-sm hover:bg-gray-50 dark:hover:bg-[#2a2a2e] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            title="Add row below"
          >
            <Plus className="w-3 h-3" />
            Row
          </button>
          
          <button
            onClick={addColumnAfter}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-white dark:bg-[#1a1a1c] border border-gray-200 dark:border-[#2a2a2e] rounded shadow-sm hover:bg-gray-50 dark:hover:bg-[#2a2a2e] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            title="Add column after"
          >
            <Plus className="w-3 h-3" />
            Column
          </button>
          
          <button
            onClick={deleteTable}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-white dark:bg-[#1a1a1c] border border-gray-200 dark:border-[#2a2a2e] rounded shadow-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            title="Delete table"
          >
            <Trash2 className="w-3 h-3" />
            Delete
          </button>
        </div>

        {/* Right side add column hover area */}
        <div className="absolute top-0 -right-4 bottom-0 w-4 opacity-0 hover:opacity-100 transition-opacity duration-200 group-hover:opacity-50">
          <button
            onClick={addColumnAfter}
            className="w-full h-full flex items-center justify-center bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
            title="Add column"
          >
            <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </button>
        </div>

        {/* Bottom add row hover area */}
        <div className="absolute -bottom-4 left-0 right-0 h-4 opacity-0 hover:opacity-100 transition-opacity duration-200 group-hover:opacity-50">
          <button
            onClick={addRowBelow}
            className="w-full h-full flex items-center justify-center bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
            title="Add row"
          >
            <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </button>
        </div>
      </div>
    </NodeViewWrapper>
  );
};