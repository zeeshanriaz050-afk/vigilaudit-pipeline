import React, { useState } from 'react';
import { FileText, Copy, Check, Code2, BookOpen, Layers, Terminal } from 'lucide-react';
import { JsDocItem } from '../types/audit';

interface DocsViewerProps {
  readmeMarkdown: string;
  openApiSpec: string;
  jsdocDocstrings: JsDocItem[];
  changelog: string;
}

export const DocsViewer: React.FC<DocsViewerProps> = ({
  readmeMarkdown = '',
  openApiSpec = '',
  jsdocDocstrings = [],
  changelog = '',
}) => {
  const [activeTab, setActiveTab] = useState<'readme' | 'openapi' | 'jsdoc' | 'changelog'>('readme');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showRawMarkdown, setShowRawMarkdown] = useState(false);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('readme')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'readme'
                ? 'border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 font-semibold shadow-sm'
                : 'border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileText className="h-3.5 w-3.5 text-cyan-400" />
            <span>Enterprise README.md</span>
          </button>

          <button
            onClick={() => setActiveTab('openapi')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'openapi'
                ? 'border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 font-semibold shadow-sm'
                : 'border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Layers className="h-3.5 w-3.5 text-indigo-400" />
            <span>OpenAPI / Swagger Spec</span>
          </button>

          <button
            onClick={() => setActiveTab('jsdoc')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'jsdoc'
                ? 'border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 font-semibold shadow-sm'
                : 'border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Code2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>JSDoc / Docstrings ({jsdocDocstrings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('changelog')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'changelog'
                ? 'border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 font-semibold shadow-sm'
                : 'border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5 text-amber-400" />
            <span>CHANGELOG.md</span>
          </button>
        </div>

        {/* Copy & View mode */}
        <div className="flex items-center gap-2">
          {activeTab === 'readme' && (
            <button
              onClick={() => setShowRawMarkdown(!showRawMarkdown)}
              className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-800 transition-colors"
            >
              {showRawMarkdown ? 'Rendered View' : 'Raw Markdown'}
            </button>
          )}

          <button
            onClick={() => {
              const currentText =
                activeTab === 'readme'
                  ? readmeMarkdown
                  : activeTab === 'openapi'
                  ? openApiSpec
                  : activeTab === 'changelog'
                  ? changelog
                  : JSON.stringify(jsdocDocstrings, null, 2);
              handleCopy(currentText, activeTab);
            }}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
          >
            {copiedKey === activeTab ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-300">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-400" />
                <span>Copy Content</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
        {/* README TAB */}
        {activeTab === 'readme' && (
          <div>
            {showRawMarkdown ? (
              <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                <code>{readmeMarkdown || '# Project Documentation\nNo README generated.'}</code>
              </pre>
            ) : (
              <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed space-y-4">
                {readmeMarkdown?.split('\n\n').map((block, idx) => {
                  if (block.startsWith('# ')) {
                    return (
                      <h1 key={idx} className="text-2xl font-black text-white border-b border-slate-800 pb-2">
                        {block.replace(/^#\s*/, '')}
                      </h1>
                    );
                  }
                  if (block.startsWith('## ')) {
                    return (
                      <h2 key={idx} className="text-lg font-bold text-cyan-300 border-b border-slate-800/80 pb-1 mt-6">
                        {block.replace(/^##\s*/, '')}
                      </h2>
                    );
                  }
                  if (block.startsWith('### ')) {
                    return (
                      <h3 key={idx} className="text-sm font-semibold text-white mt-4">
                        {block.replace(/^###\s*/, '')}
                      </h3>
                    );
                  }
                  if (block.startsWith('```')) {
                    const clean = block.replace(/```[a-z]*\n?/g, '');
                    return (
                      <pre key={idx} className="rounded-lg border border-slate-800 bg-slate-900/90 p-3 text-xs font-mono text-cyan-300 overflow-x-auto">
                        <code>{clean}</code>
                      </pre>
                    );
                  }
                  return (
                    <p key={idx} className="text-xs text-slate-300 leading-relaxed">
                      {block}
                    </p>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* OPENAPI SPEC TAB */}
        {activeTab === 'openapi' && (
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <span className="text-xs font-mono text-indigo-400">OpenAPI 3.0 Specification (YAML / JSON)</span>
              <span className="text-[11px] text-slate-400">Ready for Swagger UI & Postman import</span>
            </div>
            <pre className="text-xs font-mono text-indigo-200 whitespace-pre-wrap leading-relaxed overflow-x-auto">
              <code>{openApiSpec || '# No API endpoints detected for OpenAPI spec.'}</code>
            </pre>
          </div>
        )}

        {/* JSDOC TAB */}
        {activeTab === 'jsdoc' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400">
              Auto-generated Type-Safe JSDoc / TSDoc annotations for functions and classes in the audited files.
            </p>
            {jsdocDocstrings.length === 0 ? (
              <p className="text-xs text-slate-500">No standalone JSDoc symbols extracted.</p>
            ) : (
              jsdocDocstrings.map((doc, idx) => (
                <div key={idx} className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
                  <h4 className="text-xs font-mono font-bold text-emerald-400 mb-2">
                    {doc.symbol}
                  </h4>
                  <pre className="text-xs font-mono text-slate-300 whitespace-pre overflow-x-auto bg-slate-950 p-3 rounded">
                    <code>{doc.docstring}</code>
                  </pre>
                </div>
              ))
            )}
          </div>
        )}

        {/* CHANGELOG TAB */}
        {activeTab === 'changelog' && (
          <div>
            <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto">
              <code>{changelog || '# Changelog\nAll notable changes documented here.'}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
