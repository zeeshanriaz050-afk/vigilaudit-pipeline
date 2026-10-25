import React, { useState } from 'react';
import { GitBranch, Check, Copy, ArrowRight, Sparkles, FileCode, Split, AlignJustify } from 'lucide-react';
import { RefactoredFile } from '../types/audit';

interface DiffViewerProps {
  refactoredFiles: RefactoredFile[];
  overallImprovementSummary: string;
  estimatedSpeedupOrSafetyGain: string;
  onApplyAllRefactors: (file: RefactoredFile) => void;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  refactoredFiles = [],
  overallImprovementSummary,
  estimatedSpeedupOrSafetyGain,
  onApplyAllRefactors,
}) => {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');
  const [applied, setApplied] = useState<Record<number, boolean>>({});

  const currentRefactor = refactoredFiles[selectedFileIndex] || refactoredFiles[0];

  const handleApply = (idx: number, item: RefactoredFile) => {
    onApplyAllRefactors(item);
    setApplied((prev) => ({ ...prev, [idx]: true }));
  };

  if (!refactoredFiles.length) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center text-slate-400">
        No refactoring diffs available. Run an audit first.
      </div>
    );
  }

  // Generate simple line-by-line diff fallback if diffLines isn't already provided
  const origLines = (currentRefactor?.originalSnippet || '').split('\n');
  const newLines = (currentRefactor?.refactoredSnippet || '').split('\n');

  return (
    <div className="space-y-6">
      {/* Top Banner Summary */}
      <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 via-slate-900 to-slate-950 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                <Sparkles className="h-3 w-3 text-emerald-400" />
                Refactored & Hardened Code
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {refactoredFiles.length} file{refactoredFiles.length > 1 ? 's' : ''} optimized
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              Automated Clean Code & Security Hardening
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {overallImprovementSummary || 'All detected security vulnerabilities and anti-patterns have been remediated with production best practices.'}
            </p>
          </div>

          {estimatedSpeedupOrSafetyGain && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 text-center min-w-[180px]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
                Estimated Impact
              </span>
              <span className="text-sm font-extrabold text-emerald-400">
                {estimatedSpeedupOrSafetyGain}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* File Selector Tabs and Diff Mode Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {refactoredFiles.map((rf, idx) => {
            const isSelected = selectedFileIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => setSelectedFileIndex(idx)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-mono font-medium transition-all ${
                  isSelected
                    ? 'border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 shadow-sm'
                    : 'border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <FileCode className="h-3.5 w-3.5 text-slate-400" />
                <span>{rf.file || `File ${idx + 1}`}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border border-slate-800 bg-slate-900 p-0.5">
            <button
              onClick={() => setViewMode('split')}
              title="Side by side comparison"
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs ${
                viewMode === 'split' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Split className="h-3 w-3" />
              <span>Split</span>
            </button>
            <button
              onClick={() => setViewMode('unified')}
              title="Unified line-by-line diff"
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs ${
                viewMode === 'unified' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlignJustify className="h-3 w-3" />
              <span>Unified</span>
            </button>
          </div>

          {/* Apply Button */}
          <button
            onClick={() => handleApply(selectedFileIndex, currentRefactor)}
            disabled={applied[selectedFileIndex]}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              applied[selectedFileIndex]
                ? 'border border-emerald-500/40 bg-emerald-500/20 text-emerald-300'
                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/10'
            }`}
          >
            {applied[selectedFileIndex] ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>Merged into Project</span>
              </>
            ) : (
              <>
                <span>Apply Refactor to File</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Explanation Banner */}
      {currentRefactor?.explanation && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300 leading-relaxed">
          <strong className="text-cyan-400 font-semibold">Engineering Refactoring Notes: </strong>
          {currentRefactor.explanation}
        </div>
      )}

      {/* Diff Code Container */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden font-mono text-xs">
        {viewMode === 'split' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
            {/* Original / Before */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-800 bg-rose-950/20 px-4 py-2 text-rose-300 font-semibold text-[11px]">
                <span>Original Code (Vulnerable / Unoptimized)</span>
                <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-rose-400 text-[10px]">Before</span>
              </div>
              <div className="flex-1 overflow-x-auto p-4 space-y-1 bg-slate-950/60 text-slate-300">
                {origLines.map((line, i) => (
                  <div key={i} className="flex gap-3 leading-5">
                    <span className="w-8 select-none text-right text-slate-600 shrink-0">{i + 1}</span>
                    <span className="text-rose-300/90 whitespace-pre">{line || ' '}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Refactored / After */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-800 bg-emerald-950/20 px-4 py-2 text-emerald-300 font-semibold text-[11px]">
                <span>Hardened & Refactored Code</span>
                <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-emerald-400 text-[10px]">Secure & Clean</span>
              </div>
              <div className="flex-1 overflow-x-auto p-4 space-y-1 bg-emerald-950/5 text-slate-200">
                {newLines.map((line, i) => (
                  <div key={i} className="flex gap-3 leading-5">
                    <span className="w-8 select-none text-right text-slate-600 shrink-0">{i + 1}</span>
                    <span className="text-emerald-300 whitespace-pre font-medium">{line || ' '}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Unified Diff View */
          <div>
            <div className="border-b border-slate-800 bg-slate-900/60 px-4 py-2 text-slate-300 text-xs font-semibold">
              Unified Diff: {currentRefactor?.file}
            </div>
            <div className="overflow-x-auto p-4 space-y-0.5">
              {currentRefactor?.diffLines?.length ? (
                currentRefactor.diffLines.map((dl, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 px-2 py-0.5 leading-5 rounded ${
                      dl.type === 'removed'
                        ? 'bg-rose-950/30 text-rose-300'
                        : dl.type === 'added'
                        ? 'bg-emerald-950/30 text-emerald-300 font-medium'
                        : 'text-slate-400'
                    }`}
                  >
                    <span className="select-none font-bold w-4 text-center shrink-0">
                      {dl.type === 'removed' ? '-' : dl.type === 'added' ? '+' : ' '}
                    </span>
                    <span className="whitespace-pre">{dl.text}</span>
                  </div>
                ))
              ) : (
                /* Fallback unified view */
                <>
                  {origLines.slice(0, 5).map((l, i) => (
                    <div key={'rem-' + i} className="flex gap-3 bg-rose-950/30 text-rose-300 px-2 py-0.5">
                      <span className="select-none font-bold w-4">-</span>
                      <span className="whitespace-pre">{l}</span>
                    </div>
                  ))}
                  {newLines.map((l, i) => (
                    <div key={'add-' + i} className="flex gap-3 bg-emerald-950/30 text-emerald-300 px-2 py-0.5">
                      <span className="select-none font-bold w-4">+</span>
                      <span className="whitespace-pre">{l}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
