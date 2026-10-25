import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PipelineSteps, PipelineStageId } from './components/PipelineSteps';
import { CodeEditor } from './components/CodeEditor';
import { RepoImporter } from './components/RepoImporter';
import { ExecutiveSummary } from './components/ExecutiveSummary';
import { VulnerabilityList } from './components/VulnerabilityList';
import { StaticAnalysisView } from './components/StaticAnalysisView';
import { DiffViewer } from './components/DiffViewer';
import { DocsViewer } from './components/DocsViewer';
import { CiCdView } from './components/CiCdView';
import { DeepExplainModal } from './components/DeepExplainModal';
import { StudentLearningHub } from './components/StudentLearningHub';
import { ExportModal } from './components/ExportModal';
import { AUDIT_PRESETS, AuditPreset } from './data/presets';
import { CodeFile, AuditReport, VulnerabilityFinding, RefactoredFile } from './types/audit';
import { AlertCircle, CheckCircle2, Sparkles, Terminal, FileCode, Play, History, RotateCcw } from 'lucide-react';

export default function App() {
  // Initialize with the Express SQLi & JWT leak preset
  const defaultPreset = AUDIT_PRESETS[0];
  const [files, setFiles] = useState<CodeFile[]>(defaultPreset.files);
  const [activeFileId, setActiveFileId] = useState<string>(defaultPreset.files[0].id);
  const [currentProjectName, setCurrentProjectName] = useState<string>(defaultPreset.name);
  const [auditDepth, setAuditDepth] = useState<string>('thorough');
  const [activeInputMode, setActiveInputMode] = useState<'editor' | 'github'>('editor');

  // Pipeline execution & report state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeRunningStageIndex, setActiveRunningStageIndex] = useState<number>(0);
  const [currentStage, setCurrentStage] = useState<PipelineStageId>('summary');
  const [report, setReport] = useState<AuditReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [deepExplainFinding, setDeepExplainFinding] = useState<VulnerabilityFinding | null>(null);
  const [showLearningHub, setShowLearningHub] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // Keyboard shortcut: Cmd/Ctrl + Enter to run audit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isRunning) {
          handleRunAudit();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [files, isRunning, auditDepth]);

  // Handle Preset Selection
  const handleSelectPreset = (preset: AuditPreset) => {
    setFiles(preset.files);
    setActiveFileId(preset.files[0].id);
    setCurrentProjectName(preset.name);
    setReport(null);
    setError(null);
    setActiveInputMode('editor');
  };

  // Handle File Updates
  const handleUpdateFileContent = (id: string, content: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, content } : f))
    );
  };

  const handleAddFile = (path: string, language: string) => {
    const newFile: CodeFile = {
      id: `file_${Date.now()}`,
      path,
      content: `// New file: ${path}\n`,
      language,
    };
    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(newFile.id);
  };

  const handleDeleteFile = (id: string) => {
    if (files.length <= 1) return;
    const remaining = files.filter((f) => f.id !== id);
    setFiles(remaining);
    if (activeFileId === id) {
      setActiveFileId(remaining[0].id);
    }
  };

  // Run Multi-Stage Audit
  const handleRunAudit = async () => {
    if (files.length === 0 || !files.some((f) => f.content.trim())) {
      setError('Please add at least one source code file or snippet before auditing.');
      return;
    }

    setIsRunning(true);
    setError(null);
    setActiveRunningStageIndex(0);

    // Staged progression timer simulation while waiting for Gemini
    const stageInterval = setInterval(() => {
      setActiveRunningStageIndex((prev) => {
        if (prev < 4) return prev + 1;
        return prev;
      });
    }, 1800);

    try {
      const response = await fetch('/api/audit/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files,
          projectContext: `Project: ${currentProjectName}`,
          auditDepth,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete autonomous audit pipeline.');
      }

      setReport(data.report);
      setCurrentStage('summary');
    } catch (err: any) {
      console.error('Audit execution error:', err);
      setError(err.message || 'Audit execution encountered an error.');
    } finally {
      clearInterval(stageInterval);
      setIsRunning(false);
      setActiveRunningStageIndex(0);
    }
  };

  // 1-Click Fix for a single finding
  const handleApplyFix = (finding: VulnerabilityFinding) => {
    if (!finding.remediationCode) return;

    // Find the file that matches finding.file
    const targetFile = files.find(
      (f) =>
        f.path.toLowerCase().endsWith(finding.file.toLowerCase()) ||
        finding.file.toLowerCase().endsWith(f.path.toLowerCase())
    ) || files[0];

    if (!targetFile) return;

    // Replace problematic code in the file if present, or append replacement
    let updatedContent = targetFile.content;
    if (finding.problematicCode && updatedContent.includes(finding.problematicCode.trim())) {
      updatedContent = updatedContent.replace(
        finding.problematicCode.trim(),
        finding.remediationCode.trim()
      );
    } else {
      // Prepend or append clean replacement with comment
      updatedContent = `// [VigilAudit Auto-Fix for ${finding.id} (${finding.cwe || 'Remediation'})]\n${finding.remediationCode}\n\n` + updatedContent;
    }

    handleUpdateFileContent(targetFile.id, updatedContent);
  };

  // Merge full refactored code file
  const handleApplyAllRefactors = (refactor: RefactoredFile) => {
    if (!refactor.refactoredSnippet) return;

    const targetFile = files.find(
      (f) =>
        f.path.toLowerCase().endsWith(refactor.file.toLowerCase()) ||
        refactor.file.toLowerCase().endsWith(f.path.toLowerCase())
    ) || files[0];

    if (targetFile) {
      handleUpdateFileContent(targetFile.id, refactor.refactoredSnippet);
    }
  };

  // Load files fetched from GitHub
  const handleLoadRepoFiles = (fetchedFiles: CodeFile[], repoName: string) => {
    setFiles(fetchedFiles);
    setActiveFileId(fetchedFiles[0].id);
    setCurrentProjectName(`GitHub: ${repoName}`);
    setReport(null);
    setError(null);
    setActiveInputMode('editor');
  };

  const handleReset = () => {
    handleSelectPreset(AUDIT_PRESETS[0]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        isRunning={isRunning}
        onSelectPreset={handleSelectPreset}
        onExportReport={() => setShowExportModal(true)}
        hasReport={!!report}
        onOpenLearningHub={() => setShowLearningHub(true)}
        onReset={handleReset}
        activeInputMode={activeInputMode}
        setActiveInputMode={setActiveInputMode}
      />

      {/* 5-Stage Interactive Pipeline Header */}
      <PipelineSteps
        currentStage={currentStage}
        onSelectStage={setCurrentStage}
        isRunning={isRunning}
        activeRunningStageIndex={activeRunningStageIndex}
        hasReport={!!report}
        statusMap={{
          stage1: report?.stage1_static_ast?.status,
          stage2: report?.stage2_security_vulnerabilities?.status,
        }}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Error notification banner */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-500/40 bg-red-950/20 p-4 text-xs text-red-200">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="font-bold text-red-300">Pipeline Notice: </strong>
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-200 text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Input Views: Editor vs GitHub */}
        {activeInputMode === 'github' ? (
          <RepoImporter
            onLoadRepoFiles={handleLoadRepoFiles}
            onSwitchToEditor={() => setActiveInputMode('editor')}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px]">
            {/* Left Column: Code Studio (or top on mobile) */}
            <div className={`${report ? 'lg:col-span-5' : 'lg:col-span-12'} flex flex-col min-h-[500px]`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Source Code Studio
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono truncate max-w-[200px]">
                    ({currentProjectName})
                  </span>
                </div>
                {report && (
                  <span className="text-[11px] text-cyan-400 font-medium">
                    Live editable • Click Apply Fix to patch
                  </span>
                )}
              </div>
              <CodeEditor
                files={files}
                activeFileId={activeFileId}
                onSelectFile={setActiveFileId}
                onUpdateFileContent={handleUpdateFileContent}
                onAddFile={handleAddFile}
                onDeleteFile={handleDeleteFile}
                onRunAudit={handleRunAudit}
                isRunning={isRunning}
                auditDepth={auditDepth}
                setAuditDepth={setAuditDepth}
              />
            </div>

            {/* Right Column: Audit Results / Pipeline Stage Views */}
            {report && (
              <div className="lg:col-span-7 flex flex-col min-h-[500px] space-y-4">
                {/* Stage 0 / Summary */}
                {currentStage === 'summary' && (
                  <ExecutiveSummary
                    report={report}
                    onNavigateStage={setCurrentStage}
                  />
                )}

                {/* Stage 1 / Static AST */}
                {currentStage === 'stage1' && (
                  <StaticAnalysisView
                    metrics={report.stage1_static_ast.metrics}
                    smells={report.stage1_static_ast.smells}
                  />
                )}

                {/* Stage 2 / Security & OWASP */}
                {currentStage === 'stage2' && (
                  <VulnerabilityList
                    findings={report.stage2_security_vulnerabilities.findings}
                    secrets={report.stage2_security_vulnerabilities.secretsDetected}
                    dependencies={report.stage2_security_vulnerabilities.insecureDependencies}
                    onApplyFix={handleApplyFix}
                    onDeepExplain={setDeepExplainFinding}
                  />
                )}

                {/* Stage 3 / Refactoring & Diffs */}
                {currentStage === 'stage3' && (
                  <DiffViewer
                    refactoredFiles={report.stage3_quality_refactoring.refactoredFiles}
                    overallImprovementSummary={report.stage3_quality_refactoring.overallImprovementSummary}
                    estimatedSpeedupOrSafetyGain={report.stage3_quality_refactoring.estimatedSpeedupOrSafetyGain}
                    onApplyAllRefactors={handleApplyAllRefactors}
                  />
                )}

                {/* Stage 4 / Auto-Docs & OpenAPI */}
                {currentStage === 'stage4' && (
                  <DocsViewer
                    readmeMarkdown={report.stage4_automated_documentation.readmeMarkdown}
                    openApiSpec={report.stage4_automated_documentation.openApiSpec}
                    jsdocDocstrings={report.stage4_automated_documentation.jsdocDocstrings}
                    changelog={report.stage4_automated_documentation.changelog}
                  />
                )}

                {/* Stage 5 / CI/CD DevSecOps */}
                {currentStage === 'stage5' && (
                  <CiCdView
                    githubActionWorkflow={report.stage5_cicd_devsecops.githubActionWorkflow}
                    preCommitHooks={report.stage5_cicd_devsecops.preCommitHooks}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Deep Learning Modal (Tutor Mode) */}
      <DeepExplainModal
        finding={deepExplainFinding}
        onClose={() => setDeepExplainFinding(null)}
      />

      {/* AI Student & AppSec Learning Hub */}
      {showLearningHub && (
        <StudentLearningHub onClose={() => setShowLearningHub(false)} />
      )}

      {/* Export Report Modal */}
      {showExportModal && (
        <ExportModal
          report={report}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}
