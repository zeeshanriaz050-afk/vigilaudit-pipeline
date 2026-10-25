import React from 'react';
import { GitBranch, Activity, ShieldAlert, Cpu, FileText, CheckCircle2, AlertTriangle, XCircle, Loader2 } from 'lucide-react';

export type PipelineStageId = 'summary' | 'stage1' | 'stage2' | 'stage3' | 'stage4' | 'stage5';

interface PipelineStepsProps {
  currentStage: PipelineStageId;
  onSelectStage: (stage: PipelineStageId) => void;
  isRunning: boolean;
  activeRunningStageIndex?: number;
  hasReport: boolean;
  statusMap?: {
    stage1?: 'PASSED' | 'WARNING' | 'FAILED';
    stage2?: 'PASSED' | 'WARNING' | 'FAILED';
    stage3?: string;
    stage4?: string;
    stage5?: string;
  };
}

export const PipelineSteps: React.FC<PipelineStepsProps> = ({
  currentStage,
  onSelectStage,
  isRunning,
  activeRunningStageIndex = 0,
  hasReport,
  statusMap = {},
}) => {
  const stages = [
    {
      id: 'summary' as PipelineStageId,
      name: 'Overview & Health',
      label: 'Executive Summary',
      icon: Activity,
    },
    {
      id: 'stage1' as PipelineStageId,
      name: 'Stage 1: Static AST',
      label: 'Code Smells & Complexity',
      icon: Cpu,
      status: statusMap.stage1,
    },
    {
      id: 'stage2' as PipelineStageId,
      name: 'Stage 2: Security & OWASP',
      label: 'Vulnerabilities & Secrets',
      icon: ShieldAlert,
      status: statusMap.stage2,
    },
    {
      id: 'stage3' as PipelineStageId,
      name: 'Stage 3: Refactoring',
      label: 'Unified Diff Engine',
      icon: GitBranch,
      status: 'COMPLETED',
    },
    {
      id: 'stage4' as PipelineStageId,
      name: 'Stage 4: Auto-Docs',
      label: 'README & OpenAPI Spec',
      icon: FileText,
      status: 'COMPLETED',
    },
    {
      id: 'stage5' as PipelineStageId,
      name: 'Stage 5: CI/CD DevSecOps',
      label: 'GitHub Actions & Hooks',
      icon: CheckCircle2,
      status: 'COMPLETED',
    },
  ];

  return (
    <div className="w-full border-b border-slate-800/80 bg-slate-900/40 px-4 py-3 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between overflow-x-auto pb-1 scrollbar-none gap-2">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const isSelected = currentStage === stage.id;
            const isStageExecuting = isRunning && activeRunningStageIndex === idx;
            const isPassedStage = isRunning && activeRunningStageIndex > idx;

            return (
              <button
                key={stage.id}
                disabled={!hasReport && !isRunning}
                onClick={() => onSelectStage(stage.id)}
                className={`flex flex-1 min-w-[170px] items-center gap-2.5 rounded-lg border px-3 py-2 text-left transition-all relative overflow-hidden ${
                  isSelected
                    ? 'border-cyan-500/50 bg-gradient-to-r from-cyan-950/40 to-slate-900 text-white shadow-sm shadow-cyan-500/10'
                    : hasReport
                    ? 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    : 'border-slate-800/40 bg-slate-900/20 text-slate-500 opacity-60 cursor-not-allowed'
                }`}
              >
                {/* Active glow indicator */}
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-emerald-400" />
                )}

                {/* Stage Icon */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                    isStageExecuting
                      ? 'bg-cyan-500/20 text-cyan-400 animate-pulse'
                      : isSelected
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : hasReport
                      ? 'bg-slate-800 text-slate-300'
                      : 'bg-slate-800/50 text-slate-500'
                  }`}
                >
                  {isStageExecuting ? (
                    <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>

                {/* Text labels */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className={`truncate text-xs font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {stage.name}
                    </p>
                    {/* Status badge */}
                    {hasReport && stage.status && (
                      <span className="shrink-0">
                        {stage.status === 'FAILED' ? (
                          <XCircle className="h-3 w-3 text-red-400" />
                        ) : stage.status === 'WARNING' ? (
                          <AlertTriangle className="h-3 w-3 text-amber-400" />
                        ) : (
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        )}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-[10px] text-slate-400">{stage.label}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
