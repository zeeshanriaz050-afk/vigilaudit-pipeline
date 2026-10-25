import React from 'react';
import { ShieldAlert, Terminal, Sparkles, Download, BookOpen, RefreshCw, Github } from 'lucide-react';
import { AUDIT_PRESETS } from '../data/presets';
import { AuditPreset } from '../data/presets';

interface NavbarProps {
  isRunning: boolean;
  onSelectPreset: (preset: AuditPreset) => void;
  onExportReport: () => void;
  hasReport: boolean;
  onOpenLearningHub: () => void;
  onReset: () => void;
  activeInputMode: 'editor' | 'github';
  setActiveInputMode: (mode: 'editor' | 'github') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isRunning,
  onSelectPreset,
  onExportReport,
  hasReport,
  onOpenLearningHub,
  onReset,
  activeInputMode,
  setActiveInputMode,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-cyan-500 to-emerald-500 p-0.5 shadow-lg shadow-cyan-500/10">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
              <ShieldAlert className="h-5 w-5 text-cyan-400" />
            </div>
            {isRunning && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-500"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white">Vigil<span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">Audit</span></span>
              <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                v2.4 Autonomous
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Multi-Stage Code Review • OWASP Security Audit • CI/CD DevSecOps
            </p>
          </div>
        </div>

        {/* Input Mode Selector */}
        <div className="flex items-center rounded-lg border border-slate-800 bg-slate-900/80 p-1">
          <button
            onClick={() => setActiveInputMode('editor')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              activeInputMode === 'editor'
                ? 'bg-cyan-500/20 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>Code Studio</span>
          </button>
          <button
            onClick={() => setActiveInputMode('github')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              activeInputMode === 'github'
                ? 'bg-cyan-500/20 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Github className="h-3.5 w-3.5" />
            <span>GitHub Repo</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Preset dropdown */}
          <div className="relative hidden md:block">
            <select
              aria-label="Load Vulnerability Preset"
              onChange={(e) => {
                const found = AUDIT_PRESETS.find((p) => p.id === e.target.value);
                if (found) onSelectPreset(found);
              }}
              defaultValue=""
              className="appearance-none rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 pr-8 text-xs font-medium text-slate-200 hover:border-slate-700 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
            >
              <option value="" disabled>
                ⚡ Load Sample Vulnerable Project...
              </option>
              {AUDIT_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
              ▼
            </div>
          </div>

          {/* Student Hub Button */}
          <button
            onClick={onOpenLearningHub}
            title="Cybersecurity & Code Review Learning Hub"
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:bg-slate-800 transition-colors"
          >
            <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Learning Hub</span>
          </button>

          {/* Export Report */}
          {hasReport && (
            <button
              onClick={onExportReport}
              className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-500/20 transition-all shadow-sm shadow-cyan-500/10"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Report</span>
            </button>
          )}

          {/* Reset */}
          <button
            onClick={onReset}
            title="Reset Workspace"
            className="rounded-lg border border-slate-800 bg-slate-900/60 p-2 text-slate-400 hover:border-slate-700 hover:text-slate-200 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
