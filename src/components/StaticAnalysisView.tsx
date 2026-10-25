import React, { useState } from 'react';
import { Cpu, Zap, Activity, CheckCircle2, AlertCircle, FileCode, Sparkles } from 'lucide-react';
import { CodeSmell } from '../types/audit';

interface StaticAnalysisViewProps {
  metrics: {
    cyclomaticComplexity: string;
    maintainabilityIndex: number;
    testabilityGrade: 'A' | 'B' | 'C' | 'D' | 'F';
    antiPatternsDetected: number;
  };
  smells: CodeSmell[];
}

export const StaticAnalysisView: React.FC<StaticAnalysisViewProps> = ({ metrics, smells = [] }) => {
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredSmells = smells.filter((s) => {
    if (filterType === 'ALL') return true;
    return s.type === filterType;
  });

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 'B':
        return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
      case 'C':
        return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      default:
        return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
    }
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'performance':
        return 'border-orange-500/30 bg-orange-500/10 text-orange-300';
      case 'complexity':
        return 'border-purple-500/30 bg-purple-500/10 text-purple-300';
      case 'maintainability':
        return 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300';
      default:
        return 'border-slate-700 bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cyclomatic Complexity */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Cpu className="h-4 w-4 text-purple-400" />
              Cyclomatic Complexity
            </span>
          </div>
          <div className="text-2xl font-black text-white">{metrics?.cyclomaticComplexity || 'Optimal'}</div>
          <p className="text-[11px] text-slate-400 mt-1">Branching density and control-flow paths</p>
        </div>

        {/* Maintainability Index */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-cyan-400" />
              Maintainability Index
            </span>
          </div>
          <div className="text-2xl font-black text-cyan-400">{metrics?.maintainabilityIndex || 85}/100</div>
          <p className="text-[11px] text-slate-400 mt-1">Halstead volume & cyclomatic factoring</p>
        </div>

        {/* Testability Grade */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Testability Grade
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`rounded-lg px-2.5 py-0.5 text-2xl font-black border ${getGradeColor(metrics?.testabilityGrade || 'B')}`}>
              Grade {metrics?.testabilityGrade || 'B'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Mockability & dependency inversion</p>
        </div>

        {/* Anti-Patterns */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-amber-400" />
              Anti-Patterns Detected
            </span>
          </div>
          <div className="text-2xl font-black text-amber-400">{metrics?.antiPatternsDetected || smells.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Architectural and syntactical hazards</p>
        </div>
      </div>

      {/* Filter and Smells List */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Filter Smells:</span>
            {['ALL', 'performance', 'complexity', 'maintainability', 'style'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize transition-all ${
                  filterType === t
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400">
            {filteredSmells.length} smell{filteredSmells.length !== 1 ? 's' : ''} found
          </span>
        </div>

        {/* Smells Cards */}
        <div className="space-y-3">
          {filteredSmells.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No code smells matching the selected category.
            </div>
          ) : (
            filteredSmells.map((smell, index) => (
              <div
                key={smell.id || index}
                className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 hover:border-slate-700 transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase ${getTypeBadgeClass(smell.type)}`}>
                      {smell.type}
                    </span>
                    <span className="font-mono text-xs text-slate-400">
                      {smell.file}:{smell.line}
                    </span>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-white mb-1">{smell.title}</h4>
                <p className="text-xs text-slate-300 mb-2 leading-relaxed">{smell.message}</p>

                {smell.codeSnippet && (
                  <pre className="my-2 rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs font-mono text-slate-300 overflow-x-auto">
                    <code>{smell.codeSnippet}</code>
                  </pre>
                )}

                <div className="rounded-lg border border-cyan-500/20 bg-cyan-950/20 p-2.5 text-xs text-cyan-200 flex items-start gap-2 mt-2">
                  <Sparkles className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-cyan-300">AST Refactoring Recommendation: </strong>
                    {smell.suggestion}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
