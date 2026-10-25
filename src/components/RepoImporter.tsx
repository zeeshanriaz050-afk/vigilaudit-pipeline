import React, { useState } from 'react';
import { Github, Search, Star, GitBranch, FolderGit2, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { CodeFile } from '../types/audit';

interface RepoImporterProps {
  onLoadRepoFiles: (files: CodeFile[], repoName: string) => void;
  onSwitchToEditor: () => void;
}

export const RepoImporter: React.FC<RepoImporterProps> = ({ onLoadRepoFiles, onSwitchToEditor }) => {
  const [repoInput, setRepoInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchedRepoData, setFetchedRepoData] = useState<{
    owner: string;
    repo: string;
    defaultBranch: string;
    description: string;
    stars: number;
    totalCodeFilesCount: number;
    loadedFiles: Array<{ path: string; content: string; language: string }>;
  } | null>(null);

  const popularRepos = [
    { label: 'expressjs/express', desc: 'Node.js web framework' },
    { label: 'pallets/flask', desc: 'Python microframework' },
    { label: 'fastapi/fastapi', desc: 'Modern async Python API' },
    { label: 'axios/axios', desc: 'Promise based HTTP client' },
  ];

  const handleFetch = async (targetRepo?: string) => {
    const query = targetRepo || repoInput;
    if (!query.trim()) return;
    setError(null);
    setLoading(true);
    setFetchedRepoData(null);

    try {
      const res = await fetch('/api/github/fetch-repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: query }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch repository files.');
      }

      setFetchedRepoData(data);
    } catch (err: any) {
      setError(err.message || 'Error connecting to GitHub repository.');
    } finally {
      setLoading(false);
    }
  };

  const handleImportToEditor = () => {
    if (!fetchedRepoData || !fetchedRepoData.loadedFiles.length) return;
    const formatted: CodeFile[] = fetchedRepoData.loadedFiles.map((f, i) => ({
      id: `gh_${i}_${Date.now()}`,
      path: f.path,
      content: f.content,
      language: f.language,
    }));
    onLoadRepoFiles(formatted, `${fetchedRepoData.owner}/${fetchedRepoData.repo}`);
    onSwitchToEditor();
  };

  return (
    <div className="flex h-full flex-col justify-center max-w-3xl mx-auto py-8 px-4">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 md:p-8 shadow-2xl backdrop-blur-md">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 border border-slate-700">
            <Github className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Import Public GitHub Repository</h2>
            <p className="text-xs text-slate-400">
              Analyze an entire repository by providing its GitHub URL or <code className="text-cyan-400">owner/repo</code>
            </p>
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleFetch();
          }}
          className="relative mb-6"
        >
          <div className="relative flex items-center">
            <Search className="absolute left-4 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={repoInput}
              onChange={(e) => setRepoInput(e.target.value)}
              placeholder="e.g. expressjs/express or https://github.com/pallets/flask"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3.5 pl-11 pr-32 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <button
              type="submit"
              disabled={loading || !repoInput.trim()}
              className="absolute right-2 rounded-lg bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50 transition-colors flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Fetching...</span>
                </>
              ) : (
                <>
                  <span>Inspect Repo</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Popular Presets */}
        <div className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Try Popular Open Source Repositories
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {popularRepos.map((pr) => (
              <button
                key={pr.label}
                onClick={() => {
                  setRepoInput(pr.label);
                  handleFetch(pr.label);
                }}
                className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 p-2.5 text-left hover:border-slate-700 hover:bg-slate-800/40 transition-colors group"
              >
                <div>
                  <p className="text-xs font-medium text-slate-200 group-hover:text-cyan-400 transition-colors">
                    {pr.label}
                  </p>
                  <p className="text-[10px] text-slate-500">{pr.desc}</p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Unable to fetch repository</p>
              <p className="text-red-400 text-[11px] mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Fetched Repo Result Card */}
        {fetchedRepoData && (
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-5 mt-4">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FolderGit2 className="h-4 w-4 text-cyan-400" />
                  {fetchedRepoData.owner} / {fetchedRepoData.repo}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{fetchedRepoData.description}</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1 rounded bg-slate-900 border border-slate-800 px-2 py-1 text-amber-400">
                  <Star className="h-3 w-3 fill-amber-400" />
                  {fetchedRepoData.stars?.toLocaleString() || 0}
                </span>
                <span className="flex items-center gap-1 rounded bg-slate-900 border border-slate-800 px-2 py-1 text-slate-300">
                  <GitBranch className="h-3 w-3 text-cyan-400" />
                  {fetchedRepoData.defaultBranch}
                </span>
              </div>
            </div>

            <div className="mb-4 text-xs text-slate-300">
              <p className="mb-2">
                Discovered <strong className="text-cyan-400">{fetchedRepoData.totalCodeFilesCount}</strong> code files in tree. Loaded priority files for automated review:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {fetchedRepoData.loadedFiles.map((file) => (
                  <span
                    key={file.path}
                    className="flex items-center gap-1 rounded bg-slate-900 border border-slate-800 px-2 py-1 font-mono text-[11px] text-cyan-300"
                  >
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    {file.path}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={handleImportToEditor}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 to-emerald-400 px-4 py-2 text-xs font-semibold text-slate-950 hover:from-cyan-300 hover:to-emerald-300 shadow-md transition-all"
              >
                <span>Load Files into Audit Pipeline</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
