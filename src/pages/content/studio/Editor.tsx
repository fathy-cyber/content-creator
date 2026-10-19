import React, { useRef, useState } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Heading1, 
  Heading2,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getService } from '@/core';
import { toast } from 'sonner';
import { useContextStore } from '@/core/context/ContextStore';

export default function Editor() {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const contentService = getService<any>('content');
  const assets = contentService.assets;

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
  };

  const handleSave = async () => {
    if (!editorRef.current) return;
    const content = editorRef.current.innerHTML;
    setIsSaving(true);
    
    const orgId = useContextStore.getState().activeWorkspaceId;
    
    try {
      if (!orgId) {
        throw new Error('No active workspace found. Please select a workspace first.');
      }
      
      await assets.saveAsset({
        title: 'Studio Draft',
        type: 'post',
        content: content,
        org_id: orgId,
        status: 'draft',
      });
      toast.success('Draft saved successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInput = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-zinc-50 border border-zinc-200 rounded-xl shadow-sm">
        <button
          onClick={() => execCommand('bold')}
          className="p-2 hover:bg-zinc-200 rounded-lg transition-colors text-zinc-600"
          title="Bold"
        >
          <Bold size={18} />
        </button>
        <button
          onClick={() => execCommand('italic')}
          className="p-2 hover:bg-zinc-200 rounded-lg transition-colors text-zinc-600"
          title="Italic"
        >
          <Italic size={18} />
        </button>
        <button
          onClick={() => execCommand('underline')}
          className="p-2 hover:bg-zinc-200 rounded-lg transition-colors text-zinc-600"
          title="Underline"
        >
          <Underline size={18} />
        </button>
        
        <div className="w-px h-6 bg-zinc-200 mx-1" />
        
        <button
          onClick={() => execCommand('formatBlock', 'H1')}
          className="p-2 hover:bg-zinc-200 rounded-lg transition-colors text-zinc-600"
          title="Heading 1"
        >
          <Heading1 size={18} />
        </button>
        <button
          onClick={() => execCommand('formatBlock', 'H2')}
          className="p-2 hover:bg-zinc-200 rounded-lg transition-colors text-zinc-600"
          title="Heading 2"
        >
          <Heading2 size={18} />
        </button>
        <button
          onClick={() => execCommand('formatBlock', 'P')}
          className="p-2 hover:bg-zinc-200 rounded-lg transition-colors text-zinc-600"
          title="Paragraph"
        >
          <p className="text-sm font-bold">P</p>
        </button>
        
        <div className="w-px h-6 bg-zinc-200 mx-1" />
        
        <button
          onClick={() => execCommand('insertUnorderedList')}
          className="p-2 hover:bg-zinc-200 rounded-lg transition-colors text-zinc-600"
          title="Bullet List"
        >
          <List size={18} />
        </button>
        <button
          onClick={() => execCommand('insertOrderedList')}
          className="p-2 hover:bg-zinc-200 rounded-lg transition-colors text-zinc-600"
          title="Numbered List"
        >
          <ListOrdered size={18} />
        </button>
        
        <div className="w-px h-6 bg-zinc-200 mx-1" />
        
        <button
          onClick={() => execCommand('justifyLeft')}
          className="p-2 hover:bg-zinc-200 rounded-lg transition-colors text-zinc-600"
          title="Align Left"
        >
          <AlignLeft size={18} />
        </button>
        <button
          onClick={() => execCommand('justifyCenter')}
          className="p-2 hover:bg-zinc-200 rounded-lg transition-colors text-zinc-600"
          title="Align Center"
        >
          <AlignCenter size={18} />
        </button>
        <button
          onClick={() => execCommand('justifyRight')}
          className="p-2 hover:bg-zinc-200 rounded-lg transition-colors text-zinc-600"
          title="Align Right"
        >
          <AlignRight size={18} />
        </button>
        
        <div className="ml-auto flex items-center gap-2">
          <button 
            onClick={handleSave}
            className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-all flex items-center gap-2"
          >
            <CheckCircle2 size={14} /> Save
          </button>
          {isSaving && (
            <span className="text-xs text-zinc-400 animate-pulse">Saving...</span>
          )}
        </div>
      </div>
      
      {/* Editor Area */}
      <div className="flex-1 bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          className="flex-1 p-8 focus:outline-none prose prose-zinc max-w-none overflow-y-auto min-h-[400px]"
          suppressContentEditableWarning
        />
      </div>
    </div>
  );
}

