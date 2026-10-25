export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface CodeFile {
  id: string;
  path: string;
  content: string;
  language: string;
}

export interface VulnerabilityFinding {
  id: string;
  title: string;
  severity: Severity;
  cwe: string;
  cvss: number;
  category: string;
  file: string;
  line: number;
  problematicCode: string;
  description: string;
  impact: string;
  exploitScenario: string;
  recommendation: string;
  remediationCode: string;
}

export interface SecretLeak {
  type: string;
  maskedValue: string;
  file: string;
  line: number;
  risk: string;
}

export interface InsecureDependency {
  package: string;
  currentVersion: string;
  recommendedVersion: string;
  cve: string;
  severity: Severity;
}

export interface CodeSmell {
  id: string;
  title: string;
  type: 'complexity' | 'performance' | 'maintainability' | 'style';
  file: string;
  line: number;
  message: string;
  suggestion: string;
  codeSnippet: string;
}

export interface DiffLine {
  type: 'unchanged' | 'removed' | 'added';
  text: string;
}

export interface RefactoredFile {
  file: string;
  originalSnippet: string;
  refactoredSnippet: string;
  explanation: string;
  diffLines?: DiffLine[];
}

export interface JsDocItem {
  symbol: string;
  docstring: string;
}

export interface AuditReport {
  summary: {
    projectHealthScore: number;
    securityScore: number;
    maintainabilityScore: number;
    documentationScore: number;
    linesOfCode: number;
    totalVulnerabilities: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    executiveSummary: string;
  };
  stage1_static_ast: {
    status: 'PASSED' | 'WARNING' | 'FAILED';
    metrics: {
      cyclomaticComplexity: string;
      maintainabilityIndex: number;
      testabilityGrade: 'A' | 'B' | 'C' | 'D' | 'F';
      antiPatternsDetected: number;
    };
    smells: CodeSmell[];
  };
  stage2_security_vulnerabilities: {
    status: 'PASSED' | 'WARNING' | 'FAILED';
    findings: VulnerabilityFinding[];
    secretsDetected: SecretLeak[];
    insecureDependencies: InsecureDependency[];
  };
  stage3_quality_refactoring: {
    status: 'COMPLETED';
    overallImprovementSummary: string;
    estimatedSpeedupOrSafetyGain: string;
    refactoredFiles: RefactoredFile[];
  };
  stage4_automated_documentation: {
    status: 'COMPLETED';
    readmeMarkdown: string;
    openApiSpec: string;
    jsdocDocstrings: JsDocItem[];
    changelog: string;
  };
  stage5_cicd_devsecops: {
    status: 'COMPLETED';
    githubActionWorkflow: string;
    preCommitHooks: string;
  };
}

export interface AuditHistoryItem {
  id: string;
  timestamp: string;
  projectName: string;
  filesCount: number;
  report: AuditReport;
}
