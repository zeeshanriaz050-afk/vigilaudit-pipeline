import React, { useRef, useState } from 'react';
import { Plus, X, FileCode, Play, Upload, Settings2, Sparkles, AlertCircle, Copy, Check } from 'lucide-react';
import { CodeFile } from '../types/audit';

interface CodeEditorProps {
  files: CodeFile[];
  activeFileId: string;
  onSelectFile: (id: string) => void;
  onUpdateFileContent: (id: string, content: string) => void;
  onAddFile: (path: string, language: string) => void;
  onDeleteFile: (id: string) => void;
  onRunAudit: () => void;
  isRunning: boolean;
  auditDepth: string;
  setAuditDepth: (depth: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  files,
  activeFileId,
  onSelectFile,
  onUpdateFileContent,
  onAddFile,
  onDeleteFile,
  onRunAudit,
  isRunning,
  auditDepth,
  setAuditDepth,
}) => {
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeFile = files.find((f) => f.id === activeFileId) || files[0];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    const path = newFileName.trim();
    const ext = path.split('.').pop()?.toLowerCase() || '';
    const langMap: Record<string, string> = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      go: 'go',
      rs: 'rust',
      java: 'java',
      json: 'json',
      yaml: 'yaml',
      yml: 'yaml',
      sql: 'sql',
    };
    onAddFile(path, langMap[ext] || 'plaintext');
    setNewFileName('');
    setIsAddingFile(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles) return;

    Array.from(uploadedFiles).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content !== undefined) {
          const ext = file.name.split('.').pop()?.toLowerCase() || '';
          const langMap: Record<string, string> = {
            js: 'javascript',
            ts: 'typescript',
            py: 'python',
            json: 'json',
            go: 'go',
            rs: 'rust',
          };
          onAddFile(file.name, langMap[ext] || 'plaintext');
          // Update content
          setTimeout(() => {
            const added = files.find((f) => f.path === file.name);
            if (added) onUpdateFileContent(added.id, content);
          }, 50);
        }
      };
      reader.readAsText(file);
    });
  };

  const handleCopyCode = () => {
    if (activeFile) {
      navigator.clipboard.writeText(activeFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Compute line count
  const lineCount = activeFile?.content ? activeFile.content.split('\n').length : 1;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 1) }, (_, i) => i + 1);

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden backdrop-blur-sm">
      {/* Top File Tab Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-3 pt-2">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-2">
          {files.map((file) => {
            const isActive = file.id === activeFile?.id;
            return (
              <div
                key={file.id}
                onClick={() => onSelectFile(file.id)}
                className={`group flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-mono font-medium cursor-pointer transition-all border ${
                  isActive
                    ? 'border-cyan-500/40 bg-slate-900 text-cyan-300 shadow-sm'
                    : 'border-transparent bg-slate-950/40 text-slate-400 hover:bg-slate-900/60 hover:text-slate-300'
                }`}
              >
                <FileCode className={`h-3.5 w-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span className="truncate max-w-[140px]">{file.path}</span>
                {files.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFile(file.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity p-0.5 rounded"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            );
          })}

          {/* Add File button or input */}
          {isAddingFile ? (
            <form onSubmit={handleAddSubmit} className="flex items-center gap-1">
              <input
                type="text"
                autoFocus
                placeholder="e.g. src/auth.py"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onBlur={() => !newFileName && setIsAddingFile(false)}
                className="w-36 rounded-md border border-cyan-500/50 bg-slate-900 px-2 py-1 text-xs font-mono text-cyan-300 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded bg-cyan-500 px-2 py-1 text-[11px] font-semibold text-slate-950"
              >
                Add
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingFile(true)}
              className="flex items-center gap-1 rounded-md border border-dashed border-slate-800 px-2.5 py-1.5 text-xs text-slate-400 hover:border-slate-700 hover:text-slate-200 transition-colors"
            >
              <Plus className="h-3 w-3" />
              <span>New File</span>
            </button>
          )}
        </div>

        {/* Upload / Copy utilities */}
        <div className="flex items-center gap-1.5 pb-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Upload Local Code File"
            className="flex items-center gap-1 rounded-md border border-slate-800 bg-slate-900/60 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <Upload className="h-3 w-3 text-slate-400" />
            <span className="hidden sm:inline">Upload</span>
          </button>
          <button
            onClick={handleCopyCode}
            title="Copy Current Code"
            className="flex items-center gap-1 rounded-md border border-slate-800 bg-slate-900/60 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-800 transition-colors"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3 text-slate-400" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Editor Body with Monospace Line Numbers */}
      <div className="relative flex flex-1 overflow-hidden font-mono text-xs">
        {/* Line Numbers Column */}
        <div className="select-none bg-slate-950/70 border-r border-slate-800/80 px-3 py-3 text-right text-slate-600 overflow-hidden font-mono min-w-[42px]">
          {lineNumbers.map((num) => (
            <div key={num} className="leading-6">
              {num}
            </div>
          ))}
        </div>

        {/* Textarea code editor */}
        <div className="relative flex-1 bg-slate-950/40">
          <textarea
            value={activeFile?.content || ''}
            onChange={(e) => activeFile && onUpdateFileContent(activeFile.id, e.target.value)}
            spellCheck={false}
            className="h-full w-full resize-none bg-transparent p-3 leading-6 text-slate-200 focus:outline-none scrollbar-thin scrollbar-thumb-slate-800"
            placeholder="// Paste or write your source code here..."
          />
        </div>
      </div>

      {/* Bottom Pipeline Control Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 bg-slate-950/90 px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Depth selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Settings2 className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Audit Depth:</span>
            <select
              aria-label="Audit Depth"
              value={auditDepth}
              onChange={(e) => setAuditDepth(e.target.value)}
              className="rounded-md border border-slate-800 bg-slate-900 px-2 py-1 text-xs font-medium text-slate-200 focus:border-cyan-500 focus:outline-none"
            >
              <option value="thorough">Thorough (AST + OWASP + Diffs + Docs)</option>
              <option value="deep_security">Deep Security Penetration (OWASP + CVEs)</option>
              <option value="refactor_focus">Quality & Refactoring Focus</option>
            </select>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-500">
            <span className="rounded bg-slate-900 px-1.5 py-0.5 border border-slate-800 text-slate-400">
              {activeFile?.language || 'auto'}
            </span>
            <span>{lineCount} lines</span>
            <span>•</span>
            <span>{files.length} project file{files.length > 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Main Trigger Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onRunAudit}
            disabled={isRunning || !files.some((f) => f.content.trim())}
            className={`group relative flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold text-slate-950 shadow-lg transition-all ${
              isRunning
                ? 'bg-slate-700 text-slate-400 cursor-wait'
                : 'bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 shadow-cyan-500/20 hover:shadow-cyan-500/30 active:scale-[0.98]'
            }`}
          >
            {isRunning ? (
              <>
                <Sparkles className="h-4 w-4 animate-spin text-slate-400" />
                <span>Running Pipeline Stages...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-slate-950 text-slate-950 group-hover:translate-x-0.5 transition-transform" />
                <span>Run Autonomous Audit</span>
                <span className="hidden sm:inline-block rounded bg-black/20 px-1.5 py-0.5 text-[10px] text-slate-900">
                  ⌘ Enter
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
