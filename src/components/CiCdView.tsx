import React, { useState } from 'react';
import { CheckCircle2, Copy, Check, GitCommit, ShieldCheck, Terminal, ArrowRight, Play, Sparkles } from 'lucide-react';

interface CiCdViewProps {
  githubActionWorkflow: string;
  preCommitHooks: string;
}

export const CiCdView: React.FC<CiCdViewProps> = ({
  githubActionWorkflow = '',
  preCommitHooks = '',
}) => {
  const [activeTab, setActiveTab] = useState<'workflow' | 'precommit' | 'guide'>('workflow');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (content: string, key: string) => {
    navigator.clipboard.writeText(content);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const sampleWorkflow = githubActionWorkflow || `name: VigilAudit Automated Security & Quality Gate

on:
  push:
    branches: [ "main", "master", "develop" ]
  pull_request:
    branches: [ "main", "master" ]

jobs:
  vigil-audit:
    name: Security & AST Quality Gate
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Secret Leak Scanner (TruffleHog)
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: \${{ github.event.repository.default_branch }}
          head: HEAD

      - name: Static Security Scan & Code Review
        run: |
          echo "Running VigilAudit DevSecOps Gate..."
          # Fail build if CRITICAL vulnerabilities exist
          # exit 1 on security regression`;

  const samplePreCommit = preCommitHooks || `# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files

  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
        args: ['--baseline', '.secrets.baseline']`;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/30 via-slate-900 to-slate-950 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center gap-1.5 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-300">
                <ShieldCheck className="h-3 w-3 text-indigo-400" />
                DevSecOps Automation
              </span>
              <span className="text-xs text-slate-400">Zero-Config CI/CD Integration</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              Automated Pull Request Security & Quality Gates
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Integrate VigilAudit into GitHub Actions so every Pull Request automatically scans for OWASP vulnerabilities, secret leaks, and code smells before merging.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('workflow')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'workflow'
                ? 'border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 font-semibold shadow-sm'
                : 'border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <GitCommit className="h-3.5 w-3.5 text-cyan-400" />
            <span>.github/workflows/security-audit.yml</span>
          </button>

          <button
            onClick={() => setActiveTab('precommit')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'precommit'
                ? 'border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 font-semibold shadow-sm'
                : 'border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Terminal className="h-3.5 w-3.5 text-emerald-400" />
            <span>.pre-commit-config.yaml</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'guide'
                ? 'border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 font-semibold shadow-sm'
                : 'border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
            <span>Setup Guide</span>
          </button>
        </div>

        {activeTab !== 'guide' && (
          <button
            onClick={() => {
              const text = activeTab === 'workflow' ? sampleWorkflow : samplePreCommit;
              handleCopy(text, activeTab);
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
                <span>Copy YAML</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Tab Panels */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-2xl">
        {activeTab === 'workflow' && (
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
              <span className="text-xs font-mono text-cyan-400">
                Path: .github/workflows/security-audit.yml
              </span>
              <span className="text-[11px] text-slate-400">Triggers on push & pull_request</span>
            </div>
            <pre className="text-xs font-mono text-cyan-200 whitespace-pre overflow-x-auto leading-relaxed">
              <code>{sampleWorkflow}</code>
            </pre>
          </div>
        )}

        {activeTab === 'precommit' && (
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
              <span className="text-xs font-mono text-emerald-400">
                Path: .pre-commit-config.yaml
              </span>
              <span className="text-[11px] text-slate-400">Blocks commit before leaving developer machine</span>
            </div>
            <pre className="text-xs font-mono text-emerald-200 whitespace-pre overflow-x-auto leading-relaxed">
              <code>{samplePreCommit}</code>
            </pre>
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="space-y-4 text-xs text-slate-300 leading-relaxed max-w-3xl">
            <h4 className="text-base font-bold text-white mb-2">How to install in your GitHub repository:</h4>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-xs">
                  1
                </span>
                <div>
                  <p className="font-semibold text-white">Create workflow directory</p>
                  <p className="text-slate-400 mt-0.5">
                    In your git repo, create <code className="text-cyan-400">.github/workflows/security-audit.yml</code> and paste the workflow YAML.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-xs">
                  2
                </span>
                <div>
                  <p className="font-semibold text-white">Set Branch Protection Rules</p>
                  <p className="text-slate-400 mt-0.5">
                    In GitHub Repo Settings &rarr; Branches &rarr; Require status checks to pass before merging, check <strong className="text-slate-200">Security & AST Quality Gate</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-xs">
                  3
                </span>
                <div>
                  <p className="font-semibold text-white">Pre-commit hook installation</p>
                  <p className="text-slate-400 mt-0.5">
                    Run <code className="text-cyan-400">pip install pre-commit && pre-commit install</code> to automatically scan every git commit for secret leaks before pushing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
