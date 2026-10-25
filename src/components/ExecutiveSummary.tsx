import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Code2, FileText, CheckCircle2, ArrowUpRight, Zap, Award } from 'lucide-react';
import { AuditReport } from '../types/audit';
import { PipelineStageId } from './PipelineSteps';

interface ExecutiveSummaryProps {
  report: AuditReport;
  onNavigateStage: (stage: PipelineStageId) => void;
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({ report, onNavigateStage }) => {
  const { summary } = report;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 60) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  const getScoreGaugeGradient = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-teal-400';
    if (score >= 60) return 'from-amber-500 to-yellow-400';
    return 'from-rose-500 to-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Verdict */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 p-6 md:p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                <Zap className="h-3.5 w-3.5 text-cyan-400" />
                Autonomous Audit Complete
              </span>
              <span className="text-xs text-slate-400">
                Target: OWASP Top 10 + AST Static Review
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Executive Audit Verdict & Risk Posture
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {summary.executiveSummary}
            </p>
          </div>

          {/* Master Health Dial */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/80 p-5 min-w-[200px] shadow-inner text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Project Health
            </span>
            <div className="relative flex items-center justify-center my-2">
              <span className={`text-4xl sm:text-5xl font-black tracking-tight ${getScoreColor(summary.projectHealthScore).split(' ')[0]}`}>
                {summary.projectHealthScore}
              </span>
              <span className="text-sm font-bold text-slate-500 ml-1">/100</span>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${getScoreColor(
                summary.projectHealthScore
              )}`}
            >
              {summary.projectHealthScore >= 80 ? 'Production Ready' : summary.projectHealthScore >= 60 ? 'Remediation Required' : 'Critical Risks'}
            </span>
          </div>
        </div>

        {/* 3 Pillar Scores */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800/80">
          {/* Security Score */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                Security Score
              </span>
              <span className={`text-sm font-bold ${getScoreColor(summary.securityScore).split(' ')[0]}`}>
                {summary.securityScore}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full bg-gradient-to-r ${getScoreGaugeGradient(summary.securityScore)} transition-all duration-700`}
                style={{ width: `${summary.securityScore}%` }}
              />
            </div>
          </div>

          {/* Maintainability Score */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <Code2 className="h-4 w-4 text-emerald-400" />
                Code Maintainability
              </span>
              <span className={`text-sm font-bold ${getScoreColor(summary.maintainabilityScore).split(' ')[0]}`}>
                {summary.maintainabilityScore}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full bg-gradient-to-r ${getScoreGaugeGradient(summary.maintainabilityScore)} transition-all duration-700`}
                style={{ width: `${summary.maintainabilityScore}%` }}
              />
            </div>
          </div>

          {/* Documentation Score */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-indigo-400" />
                Documentation Quality
              </span>
              <span className={`text-sm font-bold ${getScoreColor(summary.documentationScore).split(' ')[0]}`}>
                {summary.documentationScore}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full bg-gradient-to-r ${getScoreGaugeGradient(summary.documentationScore)} transition-all duration-700`}
                style={{ width: `${summary.documentationScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Severity Counters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Critical */}
        <div
          onClick={() => onNavigateStage('stage2')}
          className="group cursor-pointer rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 hover:border-rose-500/50 hover:bg-rose-950/30 transition-all"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">Critical</span>
            <ShieldAlert className="h-4 w-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{summary.criticalCount}</span>
            <span className="text-[11px] text-rose-300/80">Immediate exploit</span>
          </div>
        </div>

        {/* High */}
        <div
          onClick={() => onNavigateStage('stage2')}
          className="group cursor-pointer rounded-xl border border-orange-500/30 bg-orange-950/20 p-4 hover:border-orange-500/50 hover:bg-orange-950/30 transition-all"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-orange-400">High Risk</span>
            <AlertTriangle className="h-4 w-4 text-orange-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{summary.highCount}</span>
            <span className="text-[11px] text-orange-300/80">Needs patch</span>
          </div>
        </div>

        {/* Medium */}
        <div
          onClick={() => onNavigateStage('stage2')}
          className="group cursor-pointer rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 hover:border-amber-500/50 hover:bg-amber-950/30 transition-all"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Medium</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{summary.mediumCount}</span>
            <span className="text-[11px] text-amber-300/80">Hardening</span>
          </div>
        </div>

        {/* Low / Smells */}
        <div
          onClick={() => onNavigateStage('stage1')}
          className="group cursor-pointer rounded-xl border border-blue-500/30 bg-blue-950/20 p-4 hover:border-blue-500/50 hover:bg-blue-950/30 transition-all"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Low / Smells</span>
            <Code2 className="h-4 w-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{summary.lowCount}</span>
            <span className="text-[11px] text-blue-300/80">Refactoring</span>
          </div>
        </div>
      </div>

      {/* Stage Navigation Quick Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stage 1 Card */}
        <div
          onClick={() => onNavigateStage('stage1')}
          className="cursor-pointer rounded-xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700 hover:bg-slate-900 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
              Stage 1
            </span>
            <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">Static AST & Smells</h4>
          <p className="text-xs text-slate-400">
            {report.stage1_static_ast?.smells?.length || 0} code smells and complexity hotspots detected.
          </p>
        </div>

        {/* Stage 2 Card */}
        <div
          onClick={() => onNavigateStage('stage2')}
          className="cursor-pointer rounded-xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700 hover:bg-slate-900 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-rose-300">
              Stage 2
            </span>
            <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-rose-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">OWASP & Secret Leaks</h4>
          <p className="text-xs text-slate-400">
            {report.stage2_security_vulnerabilities?.findings?.length || 0} vulnerabilities & {report.stage2_security_vulnerabilities?.secretsDetected?.length || 0} secrets exposed.
          </p>
        </div>

        {/* Stage 3 Card */}
        <div
          onClick={() => onNavigateStage('stage3')}
          className="cursor-pointer rounded-xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700 hover:bg-slate-900 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
              Stage 3
            </span>
            <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">Refactoring & Diffs</h4>
          <p className="text-xs text-slate-400">
            Inspect side-by-side unified code diffs and apply fixes directly.
          </p>
        </div>

        {/* Stage 4 & 5 Card */}
        <div
          onClick={() => onNavigateStage('stage5')}
          className="cursor-pointer rounded-xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700 hover:bg-slate-900 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
              Stage 4 & 5
            </span>
            <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">Docs & CI/CD Pipeline</h4>
          <p className="text-xs text-slate-400">
            Auto-generated README, OpenAPI spec, and GitHub Actions workflow.
          </p>
        </div>
      </div>
    </div>
  );
};
