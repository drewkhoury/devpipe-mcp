/**
 * Utility functions for devpipe MCP server
 */
import type { DevpipeConfig, SummaryData, RunMetadata } from './types.js';
/**
 * Check if devpipe is installed and accessible
 */
export declare function checkDevpipeInstalled(): Promise<{
    installed: boolean;
    version?: string;
    error?: string;
}>;
/**
 * Find config.toml file in current directory or parent directories
 * Starts from provided directory or process working directory
 */
export declare function findConfigFile(startDir?: string): Promise<string | null>;
/**
 * Parse TOML configuration file
 */
export declare function parseConfig(configPath: string): Promise<DevpipeConfig>;
/**
 * Get the output directory path
 */
export declare function getOutputDir(configPath: string, config?: DevpipeConfig): string;
/**
 * Get the most recent run directory
 */
export declare function getLastRunDir(outputDir: string): Promise<string | null>;
/**
 * Read summary.json file
 */
export declare function readSummary(outputDir: string): Promise<SummaryData | null>;
/**
 * Read run.json metadata from a specific run
 */
export declare function readRunMetadata(runDir: string): Promise<RunMetadata | null>;
/**
 * Read task log file
 */
export declare function readTaskLog(runDir: string, taskId: string): Promise<string | null>;
/**
 * Read pipeline.log file
 */
export declare function readPipelineLog(runDir: string): Promise<string | null>;
/**
 * Parse JUnit XML metrics
 */
export declare function parseJUnitMetrics(metricsPath: string): Promise<any>;
/**
 * Parse SARIF JSON metrics
 */
export declare function parseSARIFMetrics(metricsPath: string): Promise<any>;
/**
 * Build devpipe command with arguments
 */
export declare function buildDevpipeCommand(args: {
    config?: string;
    only?: string[];
    skip?: string[];
    since?: string;
    fixType?: string;
    ui?: string;
    dashboard?: boolean;
    failFast?: boolean;
    fast?: boolean;
    ignoreWatchPaths?: boolean;
    dryRun?: boolean;
    verbose?: boolean;
    noColor?: boolean;
}): string;
/**
 * Execute devpipe command
 */
export declare function executeDevpipe(command: string, cwd?: string): Promise<{
    stdout: string;
    stderr: string;
    exitCode: number;
}>;
/**
 * List all available tasks from config
 */
export declare function listTasksFromConfig(config: DevpipeConfig): Array<{
    id: string;
    name: string;
    description: string;
    type: string;
    command: string;
    enabled: boolean;
    isPhaseHeader: boolean;
}>;
/**
 * List tasks using devpipe list --verbose command
 */
export declare function listTasksVerbose(configPath?: string): Promise<{
    stdout: string;
    parsed: any;
}>;
/**
 * Analyze project directory to detect technologies and suggest tasks
 */
export declare function analyzeProject(projectPath?: string): Promise<{
    detectedTechnologies: string[];
    suggestedTasks: Array<{
        technology: string;
        taskType: string;
        reason: string;
    }>;
    existingFiles: {
        [key: string]: boolean;
    };
}>;
/**
 * Generate a phase header task
 * Note: Phase headers have NO required fields - they're just organizational markers
 * Common practice: include name OR desc, but neither is required
 */
export declare function generatePhaseHeader(phaseName?: string, description?: string): string;
/**
 * Generate task configuration from template
 */
export declare function generateTaskConfig(technology: string, taskType: string, taskId?: string): string;
/**
 * Create a complete config.toml file from scratch
 */
export declare function createConfig(projectPath?: string, options?: {
    includeDefaults?: boolean;
    autoDetect?: boolean;
}): Promise<string>;
/**
 * Generate CI/CD configuration from devpipe config
 */
export declare function generateCIConfig(config: DevpipeConfig, platform: 'github' | 'gitlab'): string;
/**
 * Extract a Go template constant from source code
 */
export declare function extractGoTemplate(sourceCode: string, templateName: string): string;
/**
 * Get git status for the current repository
 */
export declare function getGitStatus(cwd?: string): Promise<any>;
/**
 * Get changed files based on git mode from config
 */
export declare function getChangedFiles(configPath: string, config: DevpipeConfig): Promise<any>;
/**
 * Get aggregated metrics summary across all runs
 */
export declare function getMetricsSummary(configPath: string, config: DevpipeConfig): Promise<any>;
/**
 * Get task history across all runs
 */
export declare function getTaskHistory(configPath: string, config: DevpipeConfig): Promise<any>;
/**
 * Get recent task failures with error details and patterns
 */
export declare function getRecentFailures(configPath: string, config: DevpipeConfig, limit?: number): Promise<any>;
/**
 * Detect flaky tasks based on inconsistent pass/fail patterns
 */
export declare function detectFlakyTasks(configPath: string, config: DevpipeConfig, minRuns?: number): Promise<any>;
/**
 * Detect performance regressions in task execution times
 */
export declare function detectPerformanceRegressions(configPath: string, config: DevpipeConfig, threshold?: number): Promise<any>;
/**
 * Correlate task failures with recent file changes
 */
export declare function analyzeChangeCorrelation(configPath: string, config: DevpipeConfig): Promise<any>;
/**
 * Calculate overall pipeline health score
 */
export declare function getPipelineHealth(configPath: string, config: DevpipeConfig): Promise<any>;
/**
 * Compare two pipeline runs
 */
export declare function compareRuns(configPath: string, config: DevpipeConfig, run1Id: string, run2Id: string): Promise<any>;
/**
 * Predict which tasks are likely to fail based on changed files and historical patterns
 */
export declare function predictImpact(configPath: string, config: DevpipeConfig): Promise<any>;
/**
 * Analyze which tasks will run based on watchPaths and changed files
 */
export declare function getWatchPathsAnalysis(configPath: string, config: DevpipeConfig): Promise<any>;
//# sourceMappingURL=utils.d.ts.map