/**
 * Utility functions for devpipe MCP server
 */
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile, access, readdir, stat } from 'fs/promises';
import { join, dirname } from 'path';
import * as TOML from '@iarna/toml';
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
 */
export async function findConfigFile(startDir = process.cwd()) {
    let currentDir = startDir;
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
                metricsFormat: 'junit',
                metricsPath: 'test-results.xml'
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
                metricsFormat: 'junit',
                metricsPath: 'test-results.xml'
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
    if (template.metricsFormat) {
        toml += `metricsFormat = "${template.metricsFormat}"\n`;
    }
    if (template.metricsPath) {
        toml += `metricsPath = "${template.metricsPath}"\n`;
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
//# sourceMappingURL=utils.js.map