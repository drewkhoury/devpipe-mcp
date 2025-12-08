/**
 * Utility functions for devpipe MCP server
 */
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile, access, readdir, stat } from 'fs/promises';
import { join, dirname } from 'path';
import * as TOML from '@iarna/toml';
import { minimatch } from 'minimatch';
const execAsync = promisify(exec);
/**
 * Check if devpipe is installed and accessible
 */
export async function checkDevpipeInstalled() {
    try {
        const { stdout } = await execAsync('devpipe --version');
        return { installed: true, version: stdout.trim() };
    }
    catch (error) {
        return {
            installed: false,
            error: 'devpipe not found. Install it with: brew install drewkhoury/tap/devpipe'
        };
    }
}
/**
 * Find config.toml file in current directory or parent directories
 * Starts from provided directory or process working directory
 */
export async function findConfigFile(startDir) {
    const searchDir = startDir || process.cwd();
    let currentDir = searchDir;
    const root = '/';
    while (currentDir !== root) {
        const configPath = join(currentDir, 'config.toml');
        try {
            await access(configPath);
            return configPath;
        }
        catch {
            // File doesn't exist, try parent directory
            currentDir = dirname(currentDir);
        }
    }
    return null;
}
/**
 * Parse TOML configuration file
 */
export async function parseConfig(configPath) {
    try {
        const content = await readFile(configPath, 'utf-8');
        const parsed = TOML.parse(content);
        return parsed;
    }
    catch (error) {
        throw new Error(`Failed to parse config file: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * Get the output directory path
 */
export function getOutputDir(configPath, config) {
    const baseDir = dirname(configPath);
    const outputRoot = config?.defaults?.outputRoot || '.devpipe';
    return join(baseDir, outputRoot);
}
/**
 * Get the most recent run directory
 */
export async function getLastRunDir(outputDir) {
    try {
        const runsDir = join(outputDir, 'runs');
        const entries = await readdir(runsDir);
        // Filter for directories and sort by name (timestamp-based)
        const runDirs = [];
        for (const entry of entries) {
            const fullPath = join(runsDir, entry);
            const stats = await stat(fullPath);
            if (stats.isDirectory()) {
                runDirs.push({ name: entry, path: fullPath });
            }
        }
        if (runDirs.length === 0) {
            return null;
        }
        // Sort descending (most recent first)
        runDirs.sort((a, b) => b.name.localeCompare(a.name));
        return runDirs[0].path;
    }
    catch (error) {
        return null;
    }
}
/**
 * Read summary.json file
 */
export async function readSummary(outputDir) {
    try {
        const summaryPath = join(outputDir, 'summary.json');
        const content = await readFile(summaryPath, 'utf-8');
        return JSON.parse(content);
    }
    catch (error) {
        return null;
    }
}
/**
 * Read run.json metadata from a specific run
 */
export async function readRunMetadata(runDir) {
    try {
        const runJsonPath = join(runDir, 'run.json');
        const content = await readFile(runJsonPath, 'utf-8');
        return JSON.parse(content);
    }
    catch (error) {
        return null;
    }
}
/**
 * Read task log file
 */
export async function readTaskLog(runDir, taskId) {
    try {
        const logPath = join(runDir, 'logs', `${taskId}.log`);
        return await readFile(logPath, 'utf-8');
    }
    catch (error) {
        return null;
    }
}
/**
 * Read pipeline.log file
 */
export async function readPipelineLog(runDir) {
    try {
        const logPath = join(runDir, 'pipeline.log');
        return await readFile(logPath, 'utf-8');
    }
    catch (error) {
        return null;
    }
}
/**
 * Parse JUnit XML metrics
 */
export async function parseJUnitMetrics(metricsPath) {
    try {
        const content = await readFile(metricsPath, 'utf-8');
        // Simple parsing - in production you'd use a proper XML parser
        return { raw: content, note: 'JUnit parsing requires XML parser' };
    }
    catch (error) {
        throw new Error(`Failed to read JUnit metrics: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * Parse SARIF JSON metrics
 */
export async function parseSARIFMetrics(metricsPath) {
    try {
        const content = await readFile(metricsPath, 'utf-8');
        return JSON.parse(content);
    }
    catch (error) {
        throw new Error(`Failed to parse SARIF metrics: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * Build devpipe command with arguments
 */
export function buildDevpipeCommand(args) {
    const parts = ['devpipe'];
    if (args.config)
        parts.push(`--config "${args.config}"`);
    if (args.only && args.only.length > 0) {
        args.only.forEach(task => parts.push(`--only ${task}`));
    }
    if (args.skip && args.skip.length > 0) {
        args.skip.forEach(task => parts.push(`--skip ${task}`));
    }
    if (args.since)
        parts.push(`--since ${args.since}`);
    if (args.fixType)
        parts.push(`--fix-type ${args.fixType}`);
    if (args.ui)
        parts.push(`--ui ${args.ui}`);
    if (args.dashboard)
        parts.push('--dashboard');
    if (args.failFast)
        parts.push('--fail-fast');
    if (args.fast)
        parts.push('--fast');
    if (args.ignoreWatchPaths)
        parts.push('--ignore-watch-paths');
    if (args.dryRun)
        parts.push('--dry-run');
    if (args.verbose)
        parts.push('--verbose');
    if (args.noColor)
        parts.push('--no-color');
    return parts.join(' ');
}
/**
 * Execute devpipe command
 */
export async function executeDevpipe(command, cwd) {
    try {
        const { stdout, stderr } = await execAsync(command, {
            cwd: cwd || process.cwd(),
            maxBuffer: 10 * 1024 * 1024 // 10MB buffer
        });
        return { stdout, stderr, exitCode: 0 };
    }
    catch (error) {
        return {
            stdout: error.stdout || '',
            stderr: error.stderr || error.message || '',
            exitCode: error.code || 1
        };
    }
}
/**
 * List all available tasks from config
 */
export function listTasksFromConfig(config) {
    const tasks = [];
    for (const [taskId, task] of Object.entries(config.tasks)) {
        const isPhaseHeader = taskId.startsWith('phase-');
        tasks.push({
            id: taskId,
            name: task.name || taskId,
            description: task.desc || '',
            type: task.type || 'check',
            command: task.command || '',
            enabled: task.enabled !== false,
            isPhaseHeader
        });
    }
    return tasks;
}
/**
 * List tasks using devpipe list --verbose command
 */
export async function listTasksVerbose(configPath) {
    const command = configPath ? `devpipe list --verbose --config "${configPath}"` : 'devpipe list --verbose';
    const result = await executeDevpipe(command);
    return {
        stdout: result.stdout,
        parsed: {
            raw: result.stdout,
            exitCode: result.exitCode,
            note: 'Parse the table format output for structured data'
        }
    };
}
/**
 * Analyze project directory to detect technologies and suggest tasks
 */
export async function analyzeProject(projectPath = process.cwd()) {
    const detectedTechnologies = [];
    const suggestedTasks = [];
    const existingFiles = {};
    try {
        const files = await readdir(projectPath);
        // Check for various technology indicators
        for (const file of files) {
            existingFiles[file] = true;
        }
        // Go detection
        if (existingFiles['go.mod'] || existingFiles['go.sum']) {
            detectedTechnologies.push('Go');
            suggestedTasks.push({ technology: 'Go', taskType: 'check-format', reason: 'go fmt for formatting' }, { technology: 'Go', taskType: 'check-lint', reason: 'golangci-lint for linting' }, { technology: 'Go', taskType: 'check-static', reason: 'go vet for static analysis' }, { technology: 'Go', taskType: 'test-unit', reason: 'go test for unit tests' }, { technology: 'Go', taskType: 'build', reason: 'go build for compilation' });
        }
        // Python detection
        if (existingFiles['requirements.txt'] || existingFiles['pyproject.toml'] || existingFiles['setup.py']) {
            detectedTechnologies.push('Python');
            suggestedTasks.push({ technology: 'Python', taskType: 'check-format', reason: 'black or ruff for formatting' }, { technology: 'Python', taskType: 'check-lint', reason: 'pylint or ruff for linting' }, { technology: 'Python', taskType: 'check-types', reason: 'mypy for type checking' }, { technology: 'Python', taskType: 'test-unit', reason: 'pytest for unit tests' });
        }
        // Node.js/TypeScript detection
        if (existingFiles['package.json']) {
            detectedTechnologies.push('Node.js');
            suggestedTasks.push({ technology: 'Node.js', taskType: 'check-lint', reason: 'eslint for linting' }, { technology: 'Node.js', taskType: 'test-unit', reason: 'npm test or jest' }, { technology: 'Node.js', taskType: 'build', reason: 'npm run build' });
        }
        if (existingFiles['tsconfig.json']) {
            detectedTechnologies.push('TypeScript');
            suggestedTasks.push({ technology: 'TypeScript', taskType: 'check-types', reason: 'tsc for type checking' });
        }
        // Rust detection
        if (existingFiles['Cargo.toml']) {
            detectedTechnologies.push('Rust');
            suggestedTasks.push({ technology: 'Rust', taskType: 'check-format', reason: 'cargo fmt for formatting' }, { technology: 'Rust', taskType: 'check-lint', reason: 'cargo clippy for linting' }, { technology: 'Rust', taskType: 'test-unit', reason: 'cargo test for tests' }, { technology: 'Rust', taskType: 'build', reason: 'cargo build' });
        }
        // Docker detection
        if (existingFiles['Dockerfile'] || existingFiles['docker-compose.yml']) {
            detectedTechnologies.push('Docker');
            suggestedTasks.push({ technology: 'Docker', taskType: 'check-lint', reason: 'hadolint for Dockerfile linting' });
        }
        // Makefile detection
        if (existingFiles['Makefile']) {
            detectedTechnologies.push('Make');
        }
        return {
            detectedTechnologies,
            suggestedTasks,
            existingFiles
        };
    }
    catch (error) {
        throw new Error(`Failed to analyze project: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * Generate a phase header task
 * Note: Phase headers have NO required fields - they're just organizational markers
 * Common practice: include name OR desc, but neither is required
 */
export function generatePhaseHeader(phaseName, description) {
    const phaseId = phaseName ? `phase-${phaseName.toLowerCase()}` : 'phase-unnamed';
    let toml = `[tasks.${phaseId}]\n`;
    if (phaseName) {
        toml += `name = "${phaseName}"\n`;
    }
    if (description) {
        toml += `desc = "${description}"\n`;
    }
    return toml;
}
/**
 * Generate task configuration from template
 */
export function generateTaskConfig(technology, taskType, taskId) {
    const id = taskId || `${technology.toLowerCase()}-${taskType}`;
    // Special handling for phase headers
    if (technology.toLowerCase() === 'phase') {
        return generatePhaseHeader(taskType, taskId);
    }
    const templates = {
        'Go': {
            'check-format': {
                name: 'Go Format',
                desc: 'Verifies that Go code is properly formatted',
                type: 'check',
                command: 'gofmt -l .',
                fixType: 'helper',
                fixCommand: 'gofmt -w .'
            },
            'check-lint': {
                name: 'Golang CI Lint',
                desc: 'Runs comprehensive linting on Go code',
                type: 'check',
                command: 'golangci-lint run',
                fixType: 'auto',
                fixCommand: 'golangci-lint run --fix'
            },
            'check-static': {
                name: 'Go Vet',
                desc: 'Examines Go code for suspicious constructs',
                type: 'check',
                command: 'go vet ./...'
            },
            'test-unit': {
                name: 'Unit Tests',
                desc: 'Run all unit tests',
                type: 'test',
                command: 'go test -v ./...',
                outputType: 'junit',
                outputPath: 'test-results.xml'
            },
            'build': {
                name: 'Build Binary',
                desc: 'Compile Go application',
                type: 'build',
                command: 'go build -o bin/app .'
            }
        },
        'Python': {
            'check-format': {
                name: 'Python Format Check',
                desc: 'Check Python code formatting with black',
                type: 'check',
                command: 'black --check .',
                fixType: 'auto',
                fixCommand: 'black .'
            },
            'check-lint': {
                name: 'Python Lint',
                desc: 'Lint Python code with ruff',
                type: 'check',
                command: 'ruff check .',
                fixType: 'auto',
                fixCommand: 'ruff check --fix .'
            },
            'check-types': {
                name: 'Type Check',
                desc: 'Check types with mypy',
                type: 'check',
                command: 'mypy .'
            },
            'test-unit': {
                name: 'Unit Tests',
                desc: 'Run pytest unit tests',
                type: 'test',
                command: 'pytest',
                outputType: 'junit',
                outputPath: 'test-results.xml'
            }
        },
        'Node.js': {
            'check-lint': {
                name: 'ESLint',
                desc: 'Lint JavaScript/TypeScript with ESLint',
                type: 'check',
                command: 'npm run lint',
                fixType: 'auto',
                fixCommand: 'npm run lint -- --fix'
            },
            'test-unit': {
                name: 'Unit Tests',
                desc: 'Run unit tests',
                type: 'test',
                command: 'npm test'
            },
            'build': {
                name: 'Build',
                desc: 'Build the project',
                type: 'build',
                command: 'npm run build'
            }
        },
        'TypeScript': {
            'check-types': {
                name: 'Type Check',
                desc: 'Check TypeScript types',
                type: 'check',
                command: 'tsc --noEmit'
            }
        }
    };
    const techTemplates = templates[technology];
    if (!techTemplates) {
        return `# No template available for ${technology}\n# Please create a custom task`;
    }
    const template = techTemplates[taskType];
    if (!template) {
        return `# No template available for ${technology} ${taskType}\n# Available types: ${Object.keys(techTemplates).join(', ')}`;
    }
    // Generate TOML
    let toml = `[tasks.${id}]\n`;
    toml += `name = "${template.name}"\n`;
    toml += `desc = "${template.desc}"\n`;
    toml += `type = "${template.type}"\n`;
    toml += `command = "${template.command}"\n`;
    if (template.fixType) {
        toml += `fixType = "${template.fixType}"\n`;
    }
    if (template.fixCommand) {
        toml += `fixCommand = "${template.fixCommand}"\n`;
    }
    if (template.outputType) {
        toml += `outputType = "${template.outputType}"\n`;
    }
    if (template.outputPath) {
        toml += `outputPath = "${template.outputPath}"\n`;
    }
    return toml;
}
/**
 * Create a complete config.toml file from scratch
 */
export async function createConfig(projectPath = process.cwd(), options) {
    const includeDefaults = options?.includeDefaults !== false;
    const autoDetect = options?.autoDetect !== false;
    let config = '';
    // Add defaults section
    if (includeDefaults) {
        config += `# Devpipe Configuration
# https://github.com/drewkhoury/devpipe

[defaults]
outputRoot = ".devpipe"
fastThreshold = 300  # Tasks over 300s are skipped with --fast
uiMode = "basic"     # Options: basic, full
animationRefreshMs = 500
animatedGroupBy = "phase"  # Options: phase, type

[defaults.git]
mode = "staged_unstaged"  # Options: staged, staged_unstaged, ref
# ref = "HEAD"  # Uncomment to compare against a specific ref

[task_defaults]
enabled = true
workdir = "."
# fixType = "helper"  # Options: auto, helper, none

`;
    }
    // Auto-detect and add tasks
    if (autoDetect) {
        const analysis = await analyzeProject(projectPath);
        if (analysis.detectedTechnologies.length > 0) {
            config += `# Detected technologies: ${analysis.detectedTechnologies.join(', ')}\n\n`;
            // Group tasks by phase
            const phases = new Map();
            for (const task of analysis.suggestedTasks) {
                let phase = 'validate';
                if (task.taskType.includes('build'))
                    phase = 'build';
                else if (task.taskType.includes('test'))
                    phase = 'test';
                if (!phases.has(phase))
                    phases.set(phase, []);
                phases.get(phase).push(task);
            }
            // Add phase headers and tasks
            for (const [phase, tasks] of phases) {
                const phaseName = phase.charAt(0).toUpperCase() + phase.slice(1);
                config += `# ${phaseName} Phase\n`;
                config += `[tasks.phase-${phase}]\n`;
                config += `name = "${phaseName}"\n`;
                config += `desc = "Tasks for ${phase} stage"\n\n`;
                for (const task of tasks) {
                    const taskId = `${task.technology.toLowerCase().replace(/\./g, '-')}-${task.taskType}`;
                    const taskConfig = generateTaskConfig(task.technology, task.taskType, taskId);
                    config += taskConfig + '\n';
                }
            }
        }
        else {
            // No technologies detected, add example tasks
            config += `# Example tasks - customize for your project\n\n`;
            config += `[tasks.example-check]\n`;
            config += `name = "Example Check"\n`;
            config += `desc = "Replace with your actual check command"\n`;
            config += `type = "check"\n`;
            config += `command = "echo 'Add your check command here'"\n\n`;
        }
    }
    return config;
}
/**
 * Generate CI/CD configuration from devpipe config
 */
export function generateCIConfig(config, platform) {
    const tasks = listTasksFromConfig(config);
    const enabledTasks = tasks.filter(t => t.enabled && !t.isPhaseHeader);
    if (platform === 'github') {
        return `name: CI Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  devpipe:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install devpipe
        run: |
          curl -L https://github.com/drewkhoury/devpipe/releases/latest/download/devpipe-linux-amd64 -o devpipe
          chmod +x devpipe
          sudo mv devpipe /usr/local/bin/
      
      - name: Run devpipe
        run: devpipe --fail-fast
      
      - name: Upload results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: devpipe-results
          path: .devpipe/
`;
    }
    else if (platform === 'gitlab') {
        return `stages:
  - validate
  - test
  - build

devpipe:
  stage: test
  image: golang:latest
  before_script:
    - curl -L https://github.com/drewkhoury/devpipe/releases/latest/download/devpipe-linux-amd64 -o devpipe
    - chmod +x devpipe
    - mv devpipe /usr/local/bin/
  script:
    - devpipe --fail-fast
  artifacts:
    when: always
    paths:
      - .devpipe/
    reports:
      junit: .devpipe/runs/*/metrics/*.xml
`;
    }
    return '';
}
/**
 * Extract a Go template constant from source code
 */
export function extractGoTemplate(sourceCode, templateName) {
    // Look for pattern: const templateName = `...`
    const pattern = new RegExp(`const\\s+${templateName}\\s*=\\s*\`([\\s\\S]*?)\`(?:\\s*\\/\\/|\\s*$|\\s*const)`, 'm');
    const match = sourceCode.match(pattern);
    if (match && match[1]) {
        return match[1];
    }
    throw new Error(`Template constant '${templateName}' not found in source code`);
}
/**
 * Get git status for the current repository
 */
export async function getGitStatus(cwd) {
    try {
        // Get current branch
        const branchResult = await execAsync('git rev-parse --abbrev-ref HEAD', { cwd: cwd || process.cwd() });
        const branch = branchResult.stdout.trim();
        // Get porcelain status
        const statusResult = await execAsync('git status --porcelain', { cwd: cwd || process.cwd() });
        const statusLines = statusResult.stdout.trim().split('\n').filter(line => line);
        // Parse status
        const staged = [];
        const modified = [];
        const untracked = [];
        statusLines.forEach(line => {
            const status = line.substring(0, 2);
            const file = line.substring(3);
            if (status[0] !== ' ' && status[0] !== '?') {
                staged.push(file);
            }
            if (status[1] === 'M' || status[1] === 'D') {
                modified.push(file);
            }
            if (status === '??') {
                untracked.push(file);
            }
        });
        return {
            branch,
            staged,
            modified,
            untracked,
            clean: statusLines.length === 0,
        };
    }
    catch (error) {
        throw new Error(`Failed to get git status: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * Get changed files based on git mode from config
 */
export async function getChangedFiles(configPath, config) {
    try {
        const cwd = dirname(configPath);
        const gitMode = config.defaults?.git?.mode || 'staged_unstaged';
        const gitRef = config.defaults?.git?.ref || 'HEAD';
        let files = [];
        let mode = gitMode;
        if (gitMode === 'staged') {
            // Only staged files
            const result = await execAsync('git diff --cached --name-only', { cwd });
            files = result.stdout.trim().split('\n').filter(f => f);
        }
        else if (gitMode === 'staged_unstaged') {
            // Staged and unstaged files
            const result = await execAsync('git diff HEAD --name-only', { cwd });
            files = result.stdout.trim().split('\n').filter(f => f);
        }
        else if (gitMode === 'ref') {
            // Files changed since ref
            const result = await execAsync(`git diff ${gitRef} --name-only`, { cwd });
            files = result.stdout.trim().split('\n').filter(f => f);
            mode = `ref:${gitRef}`;
        }
        return {
            mode,
            ref: gitMode === 'ref' ? gitRef : undefined,
            files,
            count: files.length,
        };
    }
    catch (error) {
        throw new Error(`Failed to get changed files: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * Get aggregated metrics summary across all runs
 */
export async function getMetricsSummary(configPath, config) {
    try {
        const outputDir = getOutputDir(configPath, config);
        const runsDir = join(outputDir, 'runs');
        // Check if runs directory exists
        try {
            await access(runsDir);
        }
        catch {
            return { junit: null, sarif: null, totalRuns: 0 };
        }
        // Get all run directories
        const runDirs = await readdir(runsDir);
        const junitSummary = {
            totalTests: 0,
            totalFailures: 0,
            totalErrors: 0,
            totalSkipped: 0,
            runs: [],
        };
        const sarifSummary = {
            totalFindings: 0,
            errorCount: 0,
            warningCount: 0,
            noteCount: 0,
            runs: [],
        };
        for (const runDir of runDirs) {
            const runPath = join(runsDir, runDir);
            const metricsDir = join(runPath, 'metrics');
            try {
                const metricsFiles = await readdir(metricsDir);
                // Process JUnit files
                for (const file of metricsFiles) {
                    if (file.endsWith('.xml')) {
                        try {
                            const metrics = await parseJUnitMetrics(join(metricsDir, file));
                            junitSummary.totalTests += metrics.tests;
                            junitSummary.totalFailures += metrics.failures;
                            junitSummary.totalErrors += metrics.errors;
                            junitSummary.totalSkipped += metrics.skipped;
                            junitSummary.runs.push({
                                runId: runDir,
                                file,
                                tests: metrics.tests,
                                failures: metrics.failures,
                            });
                        }
                        catch {
                            // Skip files that can't be parsed
                        }
                    }
                    // Process SARIF files
                    if (file.endsWith('.sarif') || file.endsWith('.json')) {
                        try {
                            const metrics = await parseSARIFMetrics(join(metricsDir, file));
                            for (const run of metrics.runs) {
                                const findings = run.results.length;
                                sarifSummary.totalFindings += findings;
                                for (const result of run.results) {
                                    if (result.level === 'error')
                                        sarifSummary.errorCount++;
                                    if (result.level === 'warning')
                                        sarifSummary.warningCount++;
                                    if (result.level === 'note')
                                        sarifSummary.noteCount++;
                                }
                                sarifSummary.runs.push({
                                    runId: runDir,
                                    file,
                                    tool: run.tool.driver.name,
                                    findings,
                                });
                            }
                        }
                        catch {
                            // Skip files that can't be parsed
                        }
                    }
                }
            }
            catch {
                // Skip runs without metrics directory
                continue;
            }
        }
        return {
            junit: junitSummary.runs.length > 0 ? junitSummary : null,
            sarif: sarifSummary.runs.length > 0 ? sarifSummary : null,
            totalRuns: runDirs.length,
        };
    }
    catch (error) {
        throw new Error(`Failed to get metrics summary: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * Get task history across all runs
 */
export async function getTaskHistory(configPath, config) {
    try {
        const outputDir = getOutputDir(configPath, config);
        const runsDir = join(outputDir, 'runs');
        // Check if runs directory exists
        try {
            await access(runsDir);
        }
        catch {
            return { tasks: {}, totalRuns: 0 };
        }
        // Get all run directories
        const runDirs = await readdir(runsDir);
        const taskHistory = {};
        for (const runDir of runDirs) {
            const runPath = join(runsDir, runDir);
            const runJsonPath = join(runPath, 'run.json');
            try {
                const runData = JSON.parse(await readFile(runJsonPath, 'utf-8'));
                // Process each task in the run
                if (runData.tasks) {
                    for (const task of runData.tasks) {
                        if (!taskHistory[task.id]) {
                            taskHistory[task.id] = {
                                id: task.id,
                                name: task.name,
                                runs: [],
                                totalRuns: 0,
                                successCount: 0,
                                failureCount: 0,
                                skipCount: 0,
                                avgDuration: 0,
                            };
                        }
                        taskHistory[task.id].runs.push({
                            timestamp: runData.timestamp,
                            status: task.status,
                            duration: task.duration,
                            exitCode: task.exitCode,
                        });
                        taskHistory[task.id].totalRuns++;
                        if (task.status === 'PASS')
                            taskHistory[task.id].successCount++;
                        if (task.status === 'FAIL')
                            taskHistory[task.id].failureCount++;
                        if (task.status === 'SKIPPED')
                            taskHistory[task.id].skipCount++;
                    }
                }
            }
            catch {
                // Skip runs that can't be read
                continue;
            }
        }
        // Calculate averages
        for (const taskId in taskHistory) {
            const task = taskHistory[taskId];
            const durations = task.runs.map((r) => r.duration).filter((d) => d > 0);
            task.avgDuration = durations.length > 0
                ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
                : 0;
        }
        return {
            tasks: taskHistory,
            totalRuns: runDirs.length,
        };
    }
    catch (error) {
        throw new Error(`Failed to get task history: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * Get recent task failures with error details and patterns
 */
export async function getRecentFailures(configPath, config, limit = 10) {
    try {
        const outputDir = getOutputDir(configPath, config);
        const runsDir = join(outputDir, 'runs');
        // Check if runs directory exists
        try {
            await access(runsDir);
        }
        catch {
            return { failures: [], totalRuns: 0 };
        }
        // Get all run directories sorted by timestamp (newest first)
        const runDirs = await readdir(runsDir);
        const sortedRuns = runDirs.sort().reverse();
        const failures = [];
        const taskFailureHistory = {};
        // Process runs to find failures
        for (const runDir of sortedRuns) {
            const runPath = join(runsDir, runDir);
            const runJsonPath = join(runPath, 'run.json');
            try {
                const runData = JSON.parse(await readFile(runJsonPath, 'utf-8'));
                if (runData.tasks) {
                    for (const task of runData.tasks) {
                        // Track all task runs for pattern analysis
                        if (!taskFailureHistory[task.id]) {
                            taskFailureHistory[task.id] = {
                                runs: [],
                                firstFailure: null,
                                lastSuccess: null,
                            };
                        }
                        taskFailureHistory[task.id].runs.push({
                            timestamp: runData.timestamp,
                            status: task.status,
                        });
                        // Record failures
                        if (task.status === 'FAIL') {
                            if (!taskFailureHistory[task.id].firstFailure) {
                                taskFailureHistory[task.id].firstFailure = runData.timestamp;
                            }
                            // Read task log for error details
                            let errorDetails = task.error || '';
                            try {
                                const logPath = join(runPath, 'logs', `${task.id}.log`);
                                const logContent = await readFile(logPath, 'utf-8');
                                // Get last 500 chars of log (usually contains the error)
                                errorDetails = logContent.slice(-500);
                            }
                            catch {
                                // Log file might not exist
                            }
                            failures.push({
                                taskId: task.id,
                                taskName: task.name,
                                timestamp: runData.timestamp,
                                runId: runDir,
                                exitCode: task.exitCode,
                                duration: task.duration,
                                errorSummary: errorDetails.split('\n').slice(-5).join('\n').trim(),
                            });
                        }
                        else if (task.status === 'PASS') {
                            if (!taskFailureHistory[task.id].lastSuccess) {
                                taskFailureHistory[task.id].lastSuccess = runData.timestamp;
                            }
                        }
                    }
                }
            }
            catch {
                // Skip runs that can't be read
                continue;
            }
        }
        // Analyze patterns for each failed task
        const failurePatterns = [];
        const uniqueFailedTasks = new Set(failures.map(f => f.taskId));
        for (const taskId of uniqueFailedTasks) {
            const history = taskFailureHistory[taskId];
            if (!history)
                continue;
            // Count consecutive failures
            let consecutiveFailures = 0;
            for (const run of history.runs) {
                if (run.status === 'FAIL') {
                    consecutiveFailures++;
                }
                else {
                    break;
                }
            }
            // Determine if this is a new failure
            const wasPassingBefore = history.lastSuccess !== null;
            failurePatterns.push({
                taskId,
                firstFailedAt: history.firstFailure,
                lastPassedAt: history.lastSuccess,
                consecutiveFailures,
                isNewFailure: wasPassingBefore && consecutiveFailures > 0,
                totalRuns: history.runs.length,
            });
        }
        // Return most recent failures (limited)
        return {
            failures: failures.slice(0, limit),
            patterns: failurePatterns,
            summary: {
                totalFailures: failures.length,
                uniqueFailedTasks: uniqueFailedTasks.size,
                newFailures: failurePatterns.filter(p => p.isNewFailure).length,
            },
            totalRuns: sortedRuns.length,
        };
    }
    catch (error) {
        throw new Error(`Failed to get recent failures: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * Detect flaky tasks based on inconsistent pass/fail patterns
 */
export async function detectFlakyTasks(configPath, config, minRuns = 5) {
    try {
        const outputDir = getOutputDir(configPath, config);
        const runsDir = join(outputDir, 'runs');
        // Check if runs directory exists
        try {
            await access(runsDir);
        }
        catch {
            return { flakyTasks: [], totalTasks: 0 };
        }
        // Get all run directories
        const runDirs = await readdir(runsDir);
        const sortedRuns = runDirs.sort().reverse(); // Newest first
        // Track task results
        const taskResults = {};
        for (const runDir of sortedRuns) {
            const runPath = join(runsDir, runDir);
            const runJsonPath = join(runPath, 'run.json');
            try {
                const runData = JSON.parse(await readFile(runJsonPath, 'utf-8'));
                if (runData.tasks) {
                    for (const task of runData.tasks) {
                        if (!taskResults[task.id]) {
                            taskResults[task.id] = [];
                        }
                        taskResults[task.id].push({
                            timestamp: runData.timestamp,
                            status: task.status,
                            duration: task.duration,
                        });
                    }
                }
            }
            catch {
                continue;
            }
        }
        // Analyze flakiness
        const flakyTasks = [];
        for (const [taskId, results] of Object.entries(taskResults)) {
            if (results.length < minRuns)
                continue;
            const passes = results.filter(r => r.status === 'PASS').length;
            const failures = results.filter(r => r.status === 'FAIL').length;
            const total = passes + failures;
            if (total === 0)
                continue;
            const passRate = passes / total;
            const failRate = failures / total;
            // Detect flakiness: neither always passing nor always failing
            const isFlaky = passRate > 0.1 && passRate < 0.9;
            if (isFlaky) {
                // Check for alternating pattern
                let alternations = 0;
                for (let i = 1; i < results.length; i++) {
                    if (results[i].status !== results[i - 1].status) {
                        alternations++;
                    }
                }
                const alternationRate = alternations / (results.length - 1);
                flakyTasks.push({
                    taskId,
                    totalRuns: results.length,
                    passes,
                    failures,
                    passRate: Math.round(passRate * 100) / 100,
                    failRate: Math.round(failRate * 100) / 100,
                    flakinessScore: Math.round((1 - Math.abs(passRate - 0.5) * 2) * 100) / 100,
                    alternationRate: Math.round(alternationRate * 100) / 100,
                    pattern: alternationRate > 0.5 ? 'alternating' : 'intermittent',
                    recentResults: results.slice(0, 10).map(r => r.status),
                    recommendation: passRate < 0.5
                        ? 'Task fails more than it passes - investigate root cause'
                        : 'Task is unstable - consider adding retries or fixing race conditions',
                });
            }
        }
        // Sort by flakiness score (most flaky first)
        flakyTasks.sort((a, b) => b.flakinessScore - a.flakinessScore);
        return {
            flakyTasks,
            summary: {
                totalTasks: Object.keys(taskResults).length,
                flakyCount: flakyTasks.length,
                healthScore: flakyTasks.length === 0 ? 100 : Math.max(0, 100 - (flakyTasks.length * 10)),
            },
            totalRuns: sortedRuns.length,
        };
    }
    catch (error) {
        throw new Error(`Failed to detect flaky tasks: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * Detect performance regressions in task execution times
 */
export async function detectPerformanceRegressions(configPath, config, threshold = 0.3) {
    try {
        const outputDir = getOutputDir(configPath, config);
        const runsDir = join(outputDir, 'runs');
        // Check if runs directory exists
        try {
            await access(runsDir);
        }
        catch {
            return { regressions: [], totalTasks: 0 };
        }
        // Get all run directories
        const runDirs = await readdir(runsDir);
        const sortedRuns = runDirs.sort().reverse(); // Newest first
        // Track task durations over time
        const taskDurations = {};
        for (const runDir of sortedRuns) {
            const runPath = join(runsDir, runDir);
            const runJsonPath = join(runPath, 'run.json');
            try {
                const runData = JSON.parse(await readFile(runJsonPath, 'utf-8'));
                if (runData.tasks) {
                    for (const task of runData.tasks) {
                        if (task.status !== 'PASS')
                            continue; // Only analyze successful runs
                        if (!taskDurations[task.id]) {
                            taskDurations[task.id] = [];
                        }
                        taskDurations[task.id].push({
                            timestamp: runData.timestamp,
                            duration: task.duration,
                        });
                    }
                }
            }
            catch {
                continue;
            }
        }
        // Analyze regressions
        const regressions = [];
        for (const [taskId, durations] of Object.entries(taskDurations)) {
            if (durations.length < 5)
                continue; // Need at least 5 runs
            // Compare recent average (last 5 runs) vs baseline (runs 6-15)
            const recentRuns = durations.slice(0, 5);
            const baselineRuns = durations.slice(5, 15);
            if (baselineRuns.length === 0)
                continue;
            const recentAvg = recentRuns.reduce((sum, r) => sum + r.duration, 0) / recentRuns.length;
            const baselineAvg = baselineRuns.reduce((sum, r) => sum + r.duration, 0) / baselineRuns.length;
            const percentChange = (recentAvg - baselineAvg) / baselineAvg;
            // Detect regression if recent average is significantly higher
            if (percentChange > threshold) {
                const trend = durations.slice(0, 10).map(d => d.duration);
                const isIncreasing = trend[0] > trend[trend.length - 1];
                regressions.push({
                    taskId,
                    status: 'regression',
                    recentAvgDuration: Math.round(recentAvg),
                    baselineAvgDuration: Math.round(baselineAvg),
                    percentIncrease: Math.round(percentChange * 100),
                    absoluteIncrease: Math.round(recentAvg - baselineAvg),
                    trend: isIncreasing ? 'increasing' : 'stable',
                    recentDurations: recentRuns.map(r => r.duration),
                    detectedAt: recentRuns[0].timestamp,
                    severity: percentChange > 1.0 ? 'critical' : percentChange > 0.5 ? 'high' : 'medium',
                    recommendation: percentChange > 1.0
                        ? 'Task is 2x slower - immediate investigation needed'
                        : 'Task performance degrading - review recent changes',
                });
            }
        }
        // Sort by severity and percent increase
        regressions.sort((a, b) => b.percentIncrease - a.percentIncrease);
        return {
            regressions,
            summary: {
                totalTasks: Object.keys(taskDurations).length,
                regressedTasks: regressions.length,
                criticalRegressions: regressions.filter(r => r.severity === 'critical').length,
                avgPerformanceImpact: regressions.length > 0
                    ? Math.round(regressions.reduce((sum, r) => sum + r.percentIncrease, 0) / regressions.length)
                    : 0,
            },
            totalRuns: sortedRuns.length,
        };
    }
    catch (error) {
        throw new Error(`Failed to detect performance regressions: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * Correlate task failures with recent file changes
 */
export async function analyzeChangeCorrelation(configPath, config) {
    try {
        const outputDir = getOutputDir(configPath, config);
        const runsDir = join(outputDir, 'runs');
        const cwd = dirname(configPath);
        // Check if runs directory exists
        try {
            await access(runsDir);
        }
        catch {
            return { correlations: [], totalFailures: 0 };
        }
        // Get all run directories
        const runDirs = await readdir(runsDir);
        const sortedRuns = runDirs.sort().reverse(); // Newest first
        const correlations = [];
        // Analyze recent failures (last 10 runs)
        for (const runDir of sortedRuns.slice(0, 10)) {
            const runPath = join(runsDir, runDir);
            const runJsonPath = join(runPath, 'run.json');
            try {
                const runData = JSON.parse(await readFile(runJsonPath, 'utf-8'));
                const failedTasks = runData.tasks?.filter((t) => t.status === 'FAIL') || [];
                if (failedTasks.length === 0)
                    continue;
                // Get git log for this timeframe
                const timestamp = new Date(runData.timestamp);
                const timeBefore = new Date(timestamp.getTime() - 3600000); // 1 hour before
                try {
                    // Get commits in the hour before this run
                    const gitLogCmd = `git log --since="${timeBefore.toISOString()}" --until="${timestamp.toISOString()}" --pretty=format:"%H|%s|%an" --name-only`;
                    const gitResult = await execAsync(gitLogCmd, { cwd });
                    if (gitResult.stdout.trim()) {
                        const commits = parseGitLog(gitResult.stdout);
                        // Get files changed in recent commits
                        const recentFilesCmd = `git diff --name-only HEAD~5 HEAD`;
                        const filesResult = await execAsync(recentFilesCmd, { cwd });
                        const recentFiles = filesResult.stdout.trim().split('\n').filter(Boolean);
                        for (const task of failedTasks) {
                            // Check if task has watchPaths
                            const taskConfig = config.tasks?.[task.id];
                            const watchPaths = taskConfig?.watchPaths || [];
                            // Find files that match task's watchPaths
                            const matchedFiles = recentFiles.filter(file => watchPaths.length === 0 || watchPaths.some((pattern) => minimatch(file, pattern)));
                            correlations.push({
                                taskId: task.id,
                                taskName: task.name,
                                timestamp: runData.timestamp,
                                runId: runDir,
                                exitCode: task.exitCode,
                                correlatedChanges: {
                                    commits: commits.slice(0, 3), // Last 3 commits
                                    filesChanged: matchedFiles,
                                    totalCommits: commits.length,
                                    totalFilesChanged: recentFiles.length,
                                },
                                likelihood: matchedFiles.length > 0 ? 'high' : commits.length > 0 ? 'medium' : 'low',
                                analysis: matchedFiles.length > 0
                                    ? `${matchedFiles.length} file(s) matching task watchPaths were changed`
                                    : commits.length > 0
                                        ? `${commits.length} commit(s) made before failure`
                                        : 'No recent changes detected',
                            });
                        }
                    }
                }
                catch {
                    // Git commands might fail, skip this run
                }
            }
            catch {
                continue;
            }
        }
        return {
            correlations,
            summary: {
                totalFailures: correlations.length,
                highLikelihood: correlations.filter(c => c.likelihood === 'high').length,
                mediumLikelihood: correlations.filter(c => c.likelihood === 'medium').length,
                lowLikelihood: correlations.filter(c => c.likelihood === 'low').length,
            },
        };
    }
    catch (error) {
        throw new Error(`Failed to analyze change correlation: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * Parse git log output into structured commits
 */
function parseGitLog(output) {
    const commits = [];
    const lines = output.split('\n');
    let currentCommit = null;
    for (const line of lines) {
        if (line.includes('|')) {
            // Commit line: hash|message|author
            if (currentCommit) {
                commits.push(currentCommit);
            }
            const [hash, message, author] = line.split('|');
            currentCommit = {
                hash: hash.substring(0, 7),
                message,
                author,
                files: [],
            };
        }
        else if (line.trim() && currentCommit) {
            // File line
            currentCommit.files.push(line.trim());
        }
    }
    if (currentCommit) {
        commits.push(currentCommit);
    }
    return commits;
}
/**
 * Calculate overall pipeline health score
 */
export async function getPipelineHealth(configPath, config) {
    try {
        // Gather all intelligence data
        const [taskHistory, recentFailures, flakinessReport, performanceRegressions,] = await Promise.all([
            getTaskHistory(configPath, config),
            getRecentFailures(configPath, config, 20),
            detectFlakyTasks(configPath, config),
            detectPerformanceRegressions(configPath, config),
        ]);
        // Calculate health score components
        let healthScore = 100;
        const issues = [];
        const warnings = [];
        // 1. Recent failure rate (max -30 points)
        const recentFailureRate = recentFailures.summary.totalFailures / Math.max(recentFailures.totalRuns, 1);
        const failurePenalty = Math.min(30, Math.round(recentFailureRate * 100));
        healthScore -= failurePenalty;
        if (recentFailures.summary.newFailures > 0) {
            issues.push({
                type: 'new_failures',
                severity: 'high',
                count: recentFailures.summary.newFailures,
                message: `${recentFailures.summary.newFailures} task(s) started failing recently`,
            });
        }
        // 2. Flakiness (max -25 points)
        const flakinessPenalty = Math.min(25, flakinessReport.summary.flakyCount * 10);
        healthScore -= flakinessPenalty;
        if (flakinessReport.summary.flakyCount > 0) {
            issues.push({
                type: 'flaky_tests',
                severity: 'medium',
                count: flakinessReport.summary.flakyCount,
                message: `${flakinessReport.summary.flakyCount} flaky task(s) detected`,
                tasks: flakinessReport.flakyTasks.slice(0, 3).map((t) => t.taskId),
            });
        }
        // 3. Performance regressions (max -25 points)
        const regressionPenalty = Math.min(25, performanceRegressions.summary.regressedTasks * 8);
        healthScore -= regressionPenalty;
        if (performanceRegressions.summary.criticalRegressions > 0) {
            issues.push({
                type: 'performance_regression',
                severity: 'high',
                count: performanceRegressions.summary.criticalRegressions,
                message: `${performanceRegressions.summary.criticalRegressions} task(s) are 2x+ slower`,
                tasks: performanceRegressions.regressions
                    .filter((r) => r.severity === 'critical')
                    .map((r) => r.taskId),
            });
        }
        else if (performanceRegressions.summary.regressedTasks > 0) {
            warnings.push({
                type: 'performance_degradation',
                count: performanceRegressions.summary.regressedTasks,
                message: `${performanceRegressions.summary.regressedTasks} task(s) getting slower`,
            });
        }
        // 4. Overall success rate (max -20 points)
        const totalTasks = Object.keys(taskHistory.tasks).length;
        let overallSuccessRate = 0;
        if (totalTasks > 0) {
            const successCounts = Object.values(taskHistory.tasks).map((t) => t.successCount);
            const totalCounts = Object.values(taskHistory.tasks).map((t) => t.totalRuns);
            const totalSuccess = successCounts.reduce((a, b) => a + b, 0);
            const totalRuns = totalCounts.reduce((a, b) => a + b, 0);
            overallSuccessRate = totalRuns > 0 ? totalSuccess / totalRuns : 1;
            const successPenalty = Math.round((1 - overallSuccessRate) * 20);
            healthScore -= successPenalty;
        }
        // Determine status
        let status = 'excellent';
        if (healthScore < 50)
            status = 'critical';
        else if (healthScore < 70)
            status = 'poor';
        else if (healthScore < 85)
            status = 'fair';
        else if (healthScore < 95)
            status = 'good';
        // Generate recommendations
        const recommendations = [];
        if (recentFailures.summary.newFailures > 0) {
            recommendations.push('Investigate recently failing tasks - likely caused by recent changes');
        }
        if (flakinessReport.summary.flakyCount > 0) {
            recommendations.push('Fix flaky tests to improve pipeline reliability');
        }
        if (performanceRegressions.summary.criticalRegressions > 0) {
            recommendations.push('Critical: Some tasks are 2x+ slower - immediate optimization needed');
        }
        if (overallSuccessRate < 0.9) {
            recommendations.push('Overall success rate is low - review task configurations');
        }
        return {
            healthScore: Math.max(0, Math.round(healthScore)),
            status,
            timestamp: new Date().toISOString(),
            metrics: {
                totalTasks,
                totalRuns: taskHistory.totalRuns,
                recentFailureRate: Math.round(recentFailureRate * 100) / 100,
                overallSuccessRate: Math.round(overallSuccessRate * 100) / 100,
                flakyTaskCount: flakinessReport.summary.flakyCount,
                regressedTaskCount: performanceRegressions.summary.regressedTasks,
            },
            issues,
            warnings,
            recommendations,
            details: {
                recentFailures: recentFailures.summary,
                flakiness: flakinessReport.summary,
                performance: performanceRegressions.summary,
            },
        };
    }
    catch (error) {
        throw new Error(`Failed to calculate pipeline health: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * Compare two pipeline runs
 */
export async function compareRuns(configPath, config, run1Id, run2Id) {
    try {
        const outputDir = getOutputDir(configPath, config);
        const runsDir = join(outputDir, 'runs');
        // Check if runs directory exists
        try {
            await access(runsDir);
        }
        catch {
            throw new Error('No runs directory found');
        }
        // Get all run directories
        const runDirs = await readdir(runsDir);
        const sortedRuns = runDirs.sort().reverse(); // Newest first
        // Resolve run IDs
        let actualRun1Id = run1Id;
        let actualRun2Id = run2Id;
        if (run1Id === 'latest') {
            actualRun1Id = sortedRuns[0];
        }
        if (run2Id === 'previous') {
            const run1Index = sortedRuns.indexOf(actualRun1Id);
            if (run1Index < 0 || run1Index >= sortedRuns.length - 1) {
                throw new Error('No previous run found');
            }
            actualRun2Id = sortedRuns[run1Index + 1];
        }
        // Load both runs
        const run1Path = join(runsDir, actualRun1Id, 'run.json');
        const run2Path = join(runsDir, actualRun2Id, 'run.json');
        let run1Data;
        let run2Data;
        try {
            run1Data = JSON.parse(await readFile(run1Path, 'utf-8'));
        }
        catch {
            throw new Error(`Run not found: ${actualRun1Id}`);
        }
        try {
            run2Data = JSON.parse(await readFile(run2Path, 'utf-8'));
        }
        catch {
            throw new Error(`Run not found: ${actualRun2Id}`);
        }
        // Compare results
        const taskComparisons = [];
        const newFailures = [];
        const newPasses = [];
        const performanceChanges = [];
        // Create task maps
        const run1Tasks = new Map(run1Data.tasks?.map((t) => [t.id, t]) || []);
        const run2Tasks = new Map(run2Data.tasks?.map((t) => [t.id, t]) || []);
        // Get all unique task IDs
        const allTaskIds = new Set([...run1Tasks.keys(), ...run2Tasks.keys()]);
        for (const taskId of allTaskIds) {
            const task1 = run1Tasks.get(taskId);
            const task2 = run2Tasks.get(taskId);
            if (!task1 && task2) {
                // New task in run1
                taskComparisons.push({
                    taskId,
                    status: 'new_task',
                    run1Status: task2.status,
                    run2Status: 'not_present',
                });
                continue;
            }
            if (task1 && !task2) {
                // Task removed in run1
                taskComparisons.push({
                    taskId,
                    status: 'removed_task',
                    run1Status: 'not_present',
                    run2Status: task1.status,
                });
                continue;
            }
            if (!task1 || !task2)
                continue;
            // Compare status
            const statusChanged = task1.status !== task2.status;
            let statusChange = 'unchanged';
            if (statusChanged) {
                if (task1.status === 'FAIL' && task2.status === 'PASS') {
                    statusChange = 'new_failure';
                    newFailures.push({
                        taskId,
                        taskName: task1.name,
                        exitCode: task1.exitCode,
                    });
                }
                else if (task1.status === 'PASS' && task2.status === 'FAIL') {
                    statusChange = 'fixed';
                    newPasses.push({
                        taskId,
                        taskName: task1.name,
                    });
                }
                else {
                    statusChange = 'status_changed';
                }
            }
            // Compare duration (only for successful tasks)
            let durationChange = 0;
            let durationPercent = 0;
            if (task1.status === 'PASS' && task2.status === 'PASS') {
                durationChange = task1.duration - task2.duration;
                durationPercent = task2.duration > 0 ? Math.round((durationChange / task2.duration) * 100) : 0;
                if (Math.abs(durationPercent) >= 20) {
                    performanceChanges.push({
                        taskId,
                        taskName: task1.name,
                        run1Duration: task1.duration,
                        run2Duration: task2.duration,
                        change: durationChange,
                        percentChange: durationPercent,
                        type: durationPercent > 0 ? 'slower' : 'faster',
                    });
                }
            }
            taskComparisons.push({
                taskId,
                taskName: task1.name,
                run1Status: task1.status,
                run2Status: task2.status,
                statusChange,
                run1Duration: task1.duration,
                run2Duration: task2.duration,
                durationChange,
                durationPercent,
            });
        }
        // Compare metrics if available
        const metricsComparison = {};
        // Try to load JUnit metrics
        try {
            const run1MetricsPath = join(runsDir, actualRun1Id, 'metrics');
            const run2MetricsPath = join(runsDir, actualRun2Id, 'metrics');
            const run1Files = await readdir(run1MetricsPath).catch(() => []);
            const run2Files = await readdir(run2MetricsPath).catch(() => []);
            const junitFiles1 = run1Files.filter(f => f.endsWith('.xml'));
            const junitFiles2 = run2Files.filter(f => f.endsWith('.xml'));
            if (junitFiles1.length > 0 && junitFiles2.length > 0) {
                metricsComparison.junit = {
                    run1Files: junitFiles1.length,
                    run2Files: junitFiles2.length,
                    note: 'Detailed metric comparison available via parse_metrics tool',
                };
            }
        }
        catch {
            // Metrics comparison not available
        }
        return {
            run1: {
                id: actualRun1Id,
                timestamp: run1Data.timestamp,
                success: run1Data.success,
                duration: run1Data.duration,
                tasksRun: run1Data.tasks?.length || 0,
            },
            run2: {
                id: actualRun2Id,
                timestamp: run2Data.timestamp,
                success: run2Data.success,
                duration: run2Data.duration,
                tasksRun: run2Data.tasks?.length || 0,
            },
            summary: {
                newFailures: newFailures.length,
                fixed: newPasses.length,
                performanceRegressions: performanceChanges.filter((p) => p.type === 'slower').length,
                performanceImprovements: performanceChanges.filter((p) => p.type === 'faster').length,
                totalDurationChange: run1Data.duration - run2Data.duration,
            },
            newFailures,
            fixed: newPasses,
            performanceChanges,
            taskComparisons,
            metricsComparison,
        };
    }
    catch (error) {
        throw new Error(`Failed to compare runs: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * Predict which tasks are likely to fail based on changed files and historical patterns
 */
export async function predictImpact(configPath, config) {
    try {
        const cwd = dirname(configPath);
        // Get changed files
        const changedFiles = await getChangedFiles(configPath, config);
        if (changedFiles.count === 0) {
            return {
                predictions: [],
                recommendation: 'No changes detected - all tasks should pass',
                changedFiles: [],
            };
        }
        // Get historical correlation data
        const correlation = await analyzeChangeCorrelation(configPath, config);
        // Get task history for failure rates
        const taskHistory = await getTaskHistory(configPath, config);
        // Analyze each task
        const predictions = [];
        const tasks = config.tasks ? Object.values(config.tasks) : [];
        for (const task of tasks) {
            const taskId = task.id || '';
            const watchPaths = task.watchPaths || [];
            // Calculate risk score based on multiple factors
            let riskScore = 0;
            const riskFactors = [];
            // Factor 1: WatchPaths matching (40 points)
            const matchedFiles = changedFiles.files.filter((file) => watchPaths.length === 0 || watchPaths.some((pattern) => minimatch(file, pattern)));
            if (matchedFiles.length > 0) {
                const matchRatio = matchedFiles.length / changedFiles.count;
                riskScore += Math.round(matchRatio * 40);
                riskFactors.push(`${matchedFiles.length} changed file(s) match watchPaths`);
            }
            // Factor 2: Historical failure correlation (30 points)
            const taskCorrelations = correlation.correlations.filter((c) => c.taskId === taskId);
            if (taskCorrelations.length > 0) {
                const highLikelihood = taskCorrelations.filter((c) => c.likelihood === 'high').length;
                const mediumLikelihood = taskCorrelations.filter((c) => c.likelihood === 'medium').length;
                if (highLikelihood > 0) {
                    riskScore += 30;
                    riskFactors.push(`High correlation with past failures (${highLikelihood} occurrence(s))`);
                }
                else if (mediumLikelihood > 0) {
                    riskScore += 15;
                    riskFactors.push(`Medium correlation with past failures (${mediumLikelihood} occurrence(s))`);
                }
            }
            // Factor 3: Recent failure rate (30 points)
            const history = taskHistory.tasks[taskId];
            if (history) {
                const recentFailureRate = history.failureCount / history.totalRuns;
                riskScore += Math.round(recentFailureRate * 30);
                if (recentFailureRate > 0.3) {
                    riskFactors.push(`High recent failure rate (${Math.round(recentFailureRate * 100)}%)`);
                }
                else if (recentFailureRate > 0.1) {
                    riskFactors.push(`Moderate recent failure rate (${Math.round(recentFailureRate * 100)}%)`);
                }
            }
            // Only include tasks with some risk
            if (riskScore > 0) {
                let riskLevel = 'low';
                if (riskScore >= 70)
                    riskLevel = 'critical';
                else if (riskScore >= 50)
                    riskLevel = 'high';
                else if (riskScore >= 30)
                    riskLevel = 'medium';
                predictions.push({
                    taskId,
                    taskName: task.name || taskId,
                    riskScore,
                    riskLevel,
                    riskFactors,
                    matchedFiles,
                    recommendation: riskScore >= 70
                        ? 'Very likely to fail - run this task first'
                        : riskScore >= 50
                            ? 'High risk - include in pre-merge validation'
                            : riskScore >= 30
                                ? 'Medium risk - monitor closely'
                                : 'Low risk - standard validation',
                });
            }
        }
        // Sort by risk score (highest first)
        predictions.sort((a, b) => b.riskScore - a.riskScore);
        // Generate recommendations
        const highRiskTasks = predictions.filter(p => p.riskLevel === 'critical' || p.riskLevel === 'high');
        const mediumRiskTasks = predictions.filter(p => p.riskLevel === 'medium');
        let recommendation = '';
        const suggestedTasks = [];
        if (highRiskTasks.length > 0) {
            suggestedTasks.push(...highRiskTasks.map(t => t.taskId));
            recommendation = `Run high-risk tasks first: ${highRiskTasks.map(t => t.taskId).join(', ')}`;
        }
        else if (mediumRiskTasks.length > 0) {
            suggestedTasks.push(...mediumRiskTasks.slice(0, 3).map(t => t.taskId));
            recommendation = `Consider running: ${mediumRiskTasks.slice(0, 3).map(t => t.taskId).join(', ')}`;
        }
        else if (predictions.length > 0) {
            recommendation = 'Low risk changes - standard validation recommended';
        }
        else {
            recommendation = 'No specific tasks at risk - run full pipeline';
        }
        return {
            predictions,
            summary: {
                totalTasks: tasks.length,
                atRiskTasks: predictions.length,
                criticalRisk: predictions.filter(p => p.riskLevel === 'critical').length,
                highRisk: predictions.filter(p => p.riskLevel === 'high').length,
                mediumRisk: predictions.filter(p => p.riskLevel === 'medium').length,
                lowRisk: predictions.filter(p => p.riskLevel === 'low').length,
            },
            changedFiles: changedFiles.files,
            totalChangedFiles: changedFiles.count,
            recommendation,
            suggestedCommand: suggestedTasks.length > 0
                ? `devpipe --only ${suggestedTasks.join(',')}`
                : 'devpipe',
        };
    }
    catch (error) {
        throw new Error(`Failed to predict impact: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * Analyze which tasks will run based on watchPaths and changed files
 */
export async function getWatchPathsAnalysis(configPath, config) {
    try {
        // Get changed files
        const changedFiles = await getChangedFiles(configPath, config);
        // Get all tasks as array
        const tasks = config.tasks ? Object.values(config.tasks) : [];
        // Analyze each task
        const analysis = tasks.map((task) => {
            if (!task.watchPaths || task.watchPaths.length === 0) {
                return {
                    id: task.id,
                    name: task.name,
                    willRun: true,
                    reason: 'No watchPaths configured - always runs',
                    watchPaths: [],
                    matchedFiles: [],
                };
            }
            // Check if any changed file matches watchPaths patterns
            const matchedFiles = changedFiles.files.filter((file) => task.watchPaths.some((pattern) => minimatch(file, pattern)));
            return {
                id: task.id,
                name: task.name,
                willRun: matchedFiles.length > 0,
                reason: matchedFiles.length > 0
                    ? `Matched ${matchedFiles.length} changed file(s)`
                    : 'No changed files match watchPaths',
                watchPaths: task.watchPaths,
                matchedFiles,
            };
        });
        return {
            gitMode: changedFiles.mode,
            totalChangedFiles: changedFiles.count,
            changedFiles: changedFiles.files,
            tasks: analysis,
            summary: {
                willRun: analysis.filter((t) => t.willRun).length,
                willSkip: analysis.filter((t) => !t.willRun).length,
                total: analysis.length,
            },
        };
    }
    catch (error) {
        throw new Error(`Failed to analyze watchPaths: ${error instanceof Error ? error.message : String(error)}`);
    }
}
//# sourceMappingURL=utils.js.map