import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '20mb' }));

// Initializing server-side Gemini client per skill standards
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// GitHub Repo Inspector & Fetcher
app.post('/api/github/fetch-repo', async (req, res) => {
  try {
    const { repoUrl } = req.body;
    if (!repoUrl || typeof repoUrl !== 'string') {
      return res.status(400).json({ error: 'GitHub repository URL or owner/repo format is required.' });
    }

    // Extract owner and repo from url or string (e.g., "expressjs/express" or "https://github.com/expressjs/express")
    const cleaned = repoUrl.trim().replace(/\/+$/, '');
    let match = cleaned.match(/github\.com\/([^/]+)\/([^/]+)/);
    let owner = '';
    let repo = '';

    if (match) {
      owner = match[1];
      repo = match[2].replace(/\.git$/, '');
    } else {
      const parts = cleaned.split('/');
      if (parts.length === 2 && !parts[0].includes(' ')) {
        owner = parts[0];
        repo = parts[1].replace(/\.git$/, '');
      }
    }

    if (!owner || !repo) {
      return res.status(400).json({ error: 'Invalid GitHub repository format. Use "owner/repo" or "https://github.com/owner/repo"' });
    }

    const headers: Record<string, string> = {
      'User-Agent': 'VigilAudit-Agent',
      Accept: 'application/vnd.github.v3+json',
    };

    // 1. Fetch Repo info to get default branch
    const repoInfoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!repoInfoRes.ok) {
      if (repoInfoRes.status === 404) {
        return res.status(404).json({ error: `Repository "${owner}/${repo}" was not found or is private.` });
      }
      if (repoInfoRes.status === 403) {
        return res.status(403).json({ error: 'GitHub API rate limit exceeded. You can paste code directly into the editor.' });
      }
      return res.status(repoInfoRes.status).json({ error: `GitHub API error: ${repoInfoRes.statusText}` });
    }

    const repoInfo = await repoInfoRes.json();
    const defaultBranch = repoInfo.default_branch || 'main';

    // 2. Fetch git tree recursively
    const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`, { headers });
    if (!treeRes.ok) {
      return res.status(treeRes.status).json({ error: `Could not retrieve file tree for ${owner}/${repo}` });
    }

    const treeData = await treeRes.json();
    const rawFiles: Array<{ path: string; type: string; size?: number; url: string }> = treeData.tree || [];

    // Filter interesting code files (skip images, fonts, binaries, lockfiles, node_modules, .git)
    const allowedExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.go', '.rs', '.java', '.php', '.rb', '.c', '.cpp', '.cs', '.sql', '.json', '.env', '.yaml', '.yml', '.md'];
    const ignoredDirs = ['node_modules', '.git', 'dist', 'build', 'vendor', '__pycache__', '.next', 'coverage'];

    const filtered = rawFiles.filter((item) => {
      if (item.type !== 'blob') return false;
      const lower = item.path.toLowerCase();
      if (ignoredDirs.some((d) => lower.startsWith(`${d}/`) || lower.includes(`/${d}/`))) return false;
      return allowedExtensions.some((ext) => lower.endsWith(ext));
    });

    // Select top 6 most informative files to inspect (e.g. index/main/app/controllers/routes/config/package.json)
    const priorityPaths = ['package.json', 'requirements.txt', 'server.js', 'server.ts', 'app.py', 'main.py', 'index.js', 'index.ts', 'App.tsx', 'api.ts'];
    filtered.sort((a, b) => {
      const aBase = path.basename(a.path);
      const bBase = path.basename(b.path);
      const aPri = priorityPaths.indexOf(aBase);
      const bPri = priorityPaths.indexOf(bBase);
      if (aPri !== -1 && bPri !== -1) return aPri - bPri;
      if (aPri !== -1) return -1;
      if (bPri !== -1) return 1;
      return (a.size || 0) - (b.size || 0);
    });

    const candidateFiles = filtered.slice(0, 5);

    // Fetch contents of top files
    const fetchedFiles = await Promise.all(
      candidateFiles.map(async (file) => {
        try {
          const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${file.path}`;
          const contentRes = await fetch(rawUrl);
          if (!contentRes.ok) return null;
          const content = await contentRes.text();
          // Cap content size to 50KB to keep requests brisk and avoid huge binaries
          return {
            path: file.path,
            content: content.slice(0, 50000),
            language: detectLanguage(file.path),
            size: content.length,
          };
        } catch {
          return null;
        }
      })
    );

    const validFiles = fetchedFiles.filter(Boolean);

    return res.json({
      owner,
      repo,
      defaultBranch,
      description: repoInfo.description || 'Public GitHub Repository',
      stars: repoInfo.stargazers_count,
      language: repoInfo.language,
      totalCodeFilesCount: filtered.length,
      allFilesList: filtered.slice(0, 50).map((f) => f.path),
      loadedFiles: validFiles,
    });
  } catch (error: any) {
    console.error('Error fetching GitHub repository:', error);
    return res.status(500).json({ error: error.message || 'Failed to inspect GitHub repository.' });
  }
});

// Autonomous Multi-Stage Pipeline Audit Engine
app.post('/api/audit/run', async (req, res) => {
  try {
    const { files, projectContext, auditDepth } = req.body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'Please provide at least one code file or snippet to audit.' });
    }

    // Format files for Gemini prompt
    const filesRepresentation = files
      .map(
        (f: { path: string; content: string; language?: string }, idx: number) =>
          `--- FILE ${idx + 1}: ${f.path || 'snippet.' + (f.language || 'js')} (Language: ${f.language || 'auto'}) ---\n${f.content}\n--- END FILE ---`
      )
      .join('\n\n');

    const prompt = `You are VigilAudit, an autonomous senior application security auditor, compiler engineer, and principal software architect.
Perform a thorough, multi-stage automated code review and security audit on the provided project files.

AUDIT DEPTH: ${auditDepth || 'thorough'}
ADDITIONAL CONTEXT: ${projectContext || 'Production-grade security & quality audit'}

CODE FILES TO AUDIT:
${filesRepresentation}

You must return a valid JSON object matching the following structure. Do not include markdown code block backticks outside the JSON itself.
Return ONLY raw JSON with these exact keys:

{
  "summary": {
    "projectHealthScore": number (0-100),
    "securityScore": number (0-100),
    "maintainabilityScore": number (0-100),
    "documentationScore": number (0-100),
    "linesOfCode": number,
    "totalVulnerabilities": number,
    "criticalCount": number,
    "highCount": number,
    "mediumCount": number,
    "lowCount": number,
    "executiveSummary": "string (3-4 sentences high-level verdict, strengths, and urgent risks)"
  },
  "stage1_static_ast": {
    "status": "PASSED" | "WARNING" | "FAILED",
    "metrics": {
      "cyclomaticComplexity": "string (e.g. Low (4) or High (18))",
      "maintainabilityIndex": number (0-100),
      "testabilityGrade": "A" | "B" | "C" | "D" | "F",
      "antiPatternsDetected": number
    },
    "smells": [
      {
        "id": "string",
        "title": "string",
        "type": "complexity" | "performance" | "maintainability" | "style",
        "file": "string",
        "line": number,
        "message": "string",
        "suggestion": "string",
        "codeSnippet": "string"
      }
    ]
  },
  "stage2_security_vulnerabilities": {
    "status": "PASSED" | "WARNING" | "FAILED",
    "findings": [
      {
        "id": "string (e.g. VIGIL-SEC-01)",
        "title": "string",
        "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
        "cwe": "string (e.g. CWE-89, CWE-798, CWE-79, CWE-287)",
        "cvss": number (0.0 to 10.0),
        "category": "SQL_INJECTION" | "HARDCODED_SECRET" | "XSS" | "AUTHENTICATION_FLAW" | "RCE" | "SSRF" | "INSECURE_DEPENDENCY" | "DENIAL_OF_SERVICE" | "OTHER",
        "file": "string",
        "line": number,
        "problematicCode": "string",
        "description": "string (technical explanation of the weakness)",
        "impact": "string (what an attacker can do)",
        "exploitScenario": "string (sample attacker payload / step-by-step exploit demonstration)",
        "recommendation": "string (exact rule to fix)",
        "remediationCode": "string (drop-in code replacement snippet)"
      }
    ],
    "secretsDetected": [
      {
        "type": "string (e.g. AWS Secret Key, JWT Secret, Database Password)",
        "maskedValue": "string",
        "file": "string",
        "line": number,
        "risk": "string"
      }
    ],
    "insecureDependencies": [
      {
        "package": "string",
        "currentVersion": "string",
        "recommendedVersion": "string",
        "cve": "string",
        "severity": "HIGH" | "CRITICAL" | "MEDIUM"
      }
    ]
  },
  "stage3_quality_refactoring": {
    "status": "COMPLETED",
    "overallImprovementSummary": "string",
    "estimatedSpeedupOrSafetyGain": "string",
    "refactoredFiles": [
      {
        "file": "string",
        "originalSnippet": "string",
        "refactoredSnippet": "string",
        "explanation": "string",
        "diffLines": [
          { "type": "unchanged" | "removed" | "added", "text": "string" }
        ]
      }
    ]
  },
  "stage4_automated_documentation": {
    "status": "COMPLETED",
    "readmeMarkdown": "string (A complete, professional README with badges, project overview, installation, environment variables table, and secure architecture guide)",
    "openApiSpec": "string (OpenAPI 3.0 YAML or JSON for APIs detected in the codebase, or API documentation)",
    "jsdocDocstrings": [
      {
        "symbol": "string (function or class name)",
        "docstring": "string (JSDoc or Python Docstring with params and returns)"
      }
    ],
    "changelog": "string"
  },
  "stage5_cicd_devsecops": {
    "status": "COMPLETED",
    "githubActionWorkflow": "string (YAML content for .github/workflows/security-audit.yml integrating static analysis, secret scanning, and automated PR review)",
    "preCommitHooks": "string (YAML content for .pre-commit-config.yaml or package.json husky config)"
  }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '';
    let parsedData;
    try {
      parsedData = JSON.parse(responseText.trim());
    } catch (parseError) {
      console.warn('JSON direct parse failed, attempting regex extraction...', parseError);
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse JSON report from audit pipeline.');
      }
    }

    return res.json({
      success: true,
      timestamp: new Date().toISOString(),
      report: parsedData,
    });
  } catch (error: any) {
    console.error('Audit execution error:', error);
    return res.status(500).json({
      error: error.message || 'Audit execution encountered an unexpected error.',
    });
  }
});

// Deep Explainer endpoint for developer & student learning
app.post('/api/audit/explain-deep', async (req, res) => {
  try {
    const { vulnerability, codeContext } = req.body;
    if (!vulnerability) {
      return res.status(400).json({ error: 'Vulnerability finding is required.' });
    }

    const prompt = `You are a world-class Cyber Security Professor and Application Security Architect.
Explain this security vulnerability finding in an engaging, deeply educational way for developers and computer science students.

Vulnerability:
Title: ${vulnerability.title}
Severity: ${vulnerability.severity} (${vulnerability.cwe})
File: ${vulnerability.file}:${vulnerability.line}
Code snippet:
${vulnerability.problematicCode || ''}

Context:
${codeContext || ''}

Provide a comprehensive, pedagogical response with:
1. 🧠 Core Principle: Why does this vulnerability exist in code? (What memory/AST/runtime dynamic makes it flawed?)
2. ⚔️ Attack Mechanics & Proof of Concept: Walk step-by-step through how a malicious payload tricks the interpreter/database/browser.
3. 🛡️ Defensive Engineering: Why does the suggested remediation solve the root cause rather than just patching symptoms?
4. 🚀 Real-World Incident Reference: An iconic real-world breach or CVE caused by this exact flaw.
5. 💡 Pro-Tip for CI/CD: How to write a unit/integration test or AST rule that guarantees this never slips into production again.

Format the output in clear, beautifully formatted Markdown with headers, bold highlights, and code blocks.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({
      explanation: response.text,
    });
  } catch (error: any) {
    console.error('Deep explanation error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate deep explanation.' });
  }
});

// Helper for language detection
function detectLanguage(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.js':
      return 'javascript';
    case '.jsx':
      return 'javascript';
    case '.ts':
      return 'typescript';
    case '.tsx':
      return 'typescript';
    case '.py':
      return 'python';
    case '.go':
      return 'go';
    case '.rs':
      return 'rust';
    case '.java':
      return 'java';
    case '.php':
      return 'php';
    case '.rb':
      return 'ruby';
    case '.sql':
      return 'sql';
    case '.json':
      return 'json';
    case '.yaml':
    case '.yml':
      return 'yaml';
    case '.md':
      return 'markdown';
    default:
      return 'plaintext';
  }
}

// Dev & Production serving
if (process.env.NODE_ENV !== 'production') {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[VigilAudit Server] running on http://0.0.0.0:${PORT}`);
});
