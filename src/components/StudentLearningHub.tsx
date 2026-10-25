import React, { useState } from 'react';
import { X, BookOpen, Sparkles, GraduationCap, ShieldCheck, Layers, Terminal, CheckCircle2, AlertCircle } from 'lucide-react';

interface StudentLearningHubProps {
  onClose: () => void;
}

export const StudentLearningHub: React.FC<StudentLearningHubProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'owasp' | 'quiz'>('architecture');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const quizQuestions = [
    {
      question: 'Why does SQL string concatenation allow attackers to bypass login credentials with `\' OR \'1\'=\'1`?',
      options: [
        'Because the database compiler treats concatenated user input as SQL commands rather than inert data values.',
        'Because database passwords are stored without encryption in memory.',
        'Because the web browser sends plain text cookies over HTTP.',
        'Because the network socket closes abruptly.',
      ],
      correct: 0,
      explanation: 'In SQL injection, unescaped quotes break out of the data literal string literal and alter the database Abstract Syntax Tree (AST), making the query always evaluate to TRUE.',
    },
    {
      question: 'What is the primary danger of hardcoding API keys or JWT secrets inside source code repositories?',
      options: [
        'It increases the bundle size by a few kilobytes.',
        'Source control histories retain secrets forever, exposing backend cloud resources if the repo is cloned or leaked.',
        'JavaScript cannot parse strings longer than 32 characters.',
        'It violates CSS stylesheet conventions.',
      ],
      correct: 1,
      explanation: 'Once a credential is committed into git history, automated scrapers and bots discover it within seconds, allowing attackers to access databases or spin up unauthorized cloud computing resources.',
    },
    {
      question: 'How does this Autonomous Audit Pipeline combine Static AST analysis with LLMs (Gemini)?',
      options: [
        'LLMs replace all compilers and parse trees completely.',
        'Static analysis quickly spots algorithmic complexity/syntax patterns, while LLMs perform deep semantic understanding, multi-file vulnerability tracing, and contextual refactoring diff generation.',
        'Only static analysis runs; LLMs cannot read source code.',
        'LLMs execute the code in a virtual machine sandbox on the client.',
      ],
      correct: 1,
      explanation: 'Hybrid DevSecOps pipelines leverage deterministic rules for instant metrics combined with large multimodal models for advanced semantic reasoning, exploit proof-of-concepts, and unified diff synthesis.',
    },
  ];

  const handleSelectOption = (qIdx: number, optIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[88vh] w-full max-w-4xl flex-col rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-slate-950 font-bold">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                AI Student & Developer Learning Hub
                <span className="rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold px-2 py-0.5 border border-emerald-500/30">
                  Interactive Guide
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Understand how Autonomous Code Review, Static AST analysis, and DevSecOps pipelines work under the hood.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab buttons */}
        <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-950/60 px-6 py-2">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'architecture'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pipeline Architecture & LLMs
          </button>
          <button
            onClick={() => setActiveTab('owasp')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'owasp'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            OWASP Top 10 Cheatsheet
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'quiz'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Knowledge Check Quiz
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-800">
          {activeTab === 'architecture' && (
            <div className="space-y-5 text-xs text-slate-300 leading-relaxed">
              <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-cyan-400" />
                  How this Autonomous Pipeline is Built
                </h3>
                <p>
                  In traditional development, code review is manual, slow, and prone to human oversight. VigilAudit implements a modern <strong>5-Stage Autonomous Agentic Pipeline</strong>:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                  <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                    Stage 1: AST & Semantic Parsing
                  </h4>
                  <p className="text-slate-400">
                    Extracts function branching, cyclomatic complexity, Halstead maintainability indices, and detects duplicated or uncleaned resources (e.g. unclosed DB cursors, missing hook cleanups).
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                  <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                    Stage 2: OWASP & Secret Shield
                  </h4>
                  <p className="text-slate-400">
                    Matches Common Weakness Enumerations (CWEs) and CVSS metrics against OWASP Top 10 risks: SQL injection, SSRF, XSS, hardcoded credentials, and insecure third-party dependencies.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Stage 3: Refactoring Diff Engine
                  </h4>
                  <p className="text-slate-400">
                    Rather than just pointing out flaws, the LLM engine generates deterministic unified line diffs that replace vulnerable patterns with industry-standard parameterized models.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    Stage 4 & 5: Docs & DevSecOps CI/CD
                  </h4>
                  <p className="text-slate-400">
                    Auto-synthesizes GitHub Actions workflows, pre-commit config, complete READMEs with architecture badges, and OpenAPI 3.0 specs ready for Swagger documentation.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                <h4 className="text-xs font-bold text-white mb-1.5 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  Key Takeaway for AI Students
                </h4>
                <p className="text-slate-300">
                  You are witnessing how LLMs act as intelligent compiler passes. By prompting with strict JSON schemas and system rules, developers can turn unstructured codebases into verified structured reports that automatically fail CI/CD builds on regressions!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'owasp' && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-white">OWASP Top 10 Quick Reference for Developers</h3>
              <div className="space-y-3">
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                  <div className="flex items-center gap-2 font-bold text-rose-400 mb-1">
                    <span>A01: Broken Access Control & SSRF</span>
                  </div>
                  <p className="text-slate-300">
                    Never trust client input for URLs or user authorization checks. Always validate server-side permissions and whitelist target URLs.
                  </p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                  <div className="flex items-center gap-2 font-bold text-rose-400 mb-1">
                    <span>A02: Cryptographic Failures & Hardcoded Secrets</span>
                  </div>
                  <p className="text-slate-300">
                    Keep API keys, private certificates, and database passwords in environment variables or cloud secret managers like AWS Secrets Manager or GCP Secret Manager.
                  </p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                  <div className="flex items-center gap-2 font-bold text-rose-400 mb-1">
                    <span>A03: Injection (SQL, Command, LDAP)</span>
                  </div>
                  <p className="text-slate-300">
                    Always use parameterized queries (e.g. prepared statements like <code className="text-cyan-400">db.query('SELECT * WHERE id = $1', [id])</code>) instead of string concatenation.
                  </p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                  <div className="flex items-center gap-2 font-bold text-amber-400 mb-1">
                    <span>A06: Vulnerable and Outdated Components</span>
                  </div>
                  <p className="text-slate-300">
                    Continuously scan your <code className="text-cyan-400">package.json</code> or <code className="text-cyan-400">requirements.txt</code> with tools like npm audit, Trivy, or Snyk.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'quiz' && (
            <div className="space-y-6 text-xs">
              {quizQuestions.map((q, qIdx) => {
                const userChoice = selectedAnswers[qIdx];
                const isAnswered = userChoice !== undefined;
                const isCorrect = userChoice === q.correct;

                return (
                  <div key={qIdx} className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                    <p className="text-sm font-bold text-white">
                      {qIdx + 1}. {q.question}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const isChosen = userChoice === optIdx;
                        let optionStyle = 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700';

                        if (showResults) {
                          if (optIdx === q.correct) {
                            optionStyle = 'border-emerald-500/50 bg-emerald-950/30 text-emerald-300 font-bold';
                          } else if (isChosen) {
                            optionStyle = 'border-rose-500/50 bg-rose-950/30 text-rose-300';
                          }
                        } else if (isChosen) {
                          optionStyle = 'border-cyan-500 bg-cyan-500/20 text-cyan-300 font-semibold';
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectOption(qIdx, optIdx)}
                            className={`w-full text-left rounded-lg border p-2.5 transition-all flex items-start gap-2.5 ${optionStyle}`}
                          >
                            <span className="font-mono text-slate-500 shrink-0">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {showResults && (
                      <div className="rounded-lg bg-slate-900 p-3 text-slate-400 mt-2 border border-slate-800">
                        <strong className={isCorrect ? 'text-emerald-400' : 'text-rose-400'}>
                          {isCorrect ? '✓ Correct! ' : '✗ Incorrect. '}
                        </strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowResults(!showResults)}
                  className="rounded-lg bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition-colors"
                >
                  {showResults ? 'Hide Explanations' : 'Check Answers'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 bg-slate-950/80 px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-1.5 text-xs font-medium text-white hover:bg-slate-700 transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
