import React, { useEffect, useState } from 'react';
import { X, BookOpen, ShieldAlert, Sparkles, Loader2, Copy, Check, Terminal, ExternalLink } from 'lucide-react';
import { VulnerabilityFinding } from '../types/audit';

interface DeepExplainModalProps {
  finding: VulnerabilityFinding | null;
  onClose: () => void;
}

export const DeepExplainModal: React.FC<DeepExplainModalProps> = ({ finding, onClose }) => {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!finding) {
      setExplanation(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setExplanation(null);

    fetch('/api/audit/explain-deep', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vulnerability: finding,
        codeContext: `File: ${finding.file}\nProblematic code:\n${finding.problematicCode}\nExploit info:\n${finding.exploitScenario}`,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setExplanation(data.explanation || 'No detailed explanation generated.');
        }
      })
      .catch((err) => {
        if (isMounted) {
          setExplanation('Failed to fetch AI tutor explanation: ' + err.message);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [finding]);

  if (!finding) return null;

  const handleCopy = () => {
    if (explanation) {
      navigator.clipboard.writeText(explanation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold px-2 py-0.5 border border-rose-500/30">
                  {finding.severity}
                </span>
                <span className="text-xs font-mono text-cyan-400">{finding.cwe}</span>
              </div>
              <h2 className="text-base font-bold text-white line-clamp-1">{finding.title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {explanation && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-800">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mb-3" />
              <p className="text-sm font-semibold text-white">Synthesizing Pedagogical Security Guide...</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Formulating AST mechanics, attack payload walkthrough, and defense in depth architecture.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Context Summary pill */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 text-xs font-mono text-slate-300 flex items-center justify-between">
                <span>File: {finding.file}:{finding.line}</span>
                <span className="text-cyan-400">Powered by Gemini 3.8 Flash</span>
              </div>

              {/* Formatted Markdown */}
              <div className="prose prose-invert prose-sm max-w-none text-slate-200 leading-relaxed space-y-3">
                {explanation?.split('\n\n').map((paragraph, idx) => {
                  if (paragraph.startsWith('### ') || paragraph.startsWith('## ') || paragraph.startsWith('# ')) {
                    const title = paragraph.replace(/^#+\s*/, '');
                    return (
                      <h3 key={idx} className="text-sm font-bold text-cyan-300 border-b border-slate-800/80 pb-1 mt-4">
                        {title}
                      </h3>
                    );
                  }
                  if (paragraph.startsWith('```')) {
                    const cleanCode = paragraph.replace(/```[a-z]*\n?/g, '');
                    return (
                      <pre key={idx} className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs font-mono text-cyan-300 overflow-x-auto">
                        <code>{cleanCode}</code>
                      </pre>
                    );
                  }
                  return (
                    <p key={idx} className="text-xs text-slate-300 leading-relaxed">
                      {paragraph}
                    </p>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-800 bg-slate-950/80 px-6 py-3 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-indigo-400">
            <Sparkles className="h-3.5 w-3.5" />
            AI Student & AppSec Learning Module
          </span>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-1.5 text-xs font-medium text-white hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
