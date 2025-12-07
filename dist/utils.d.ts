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
//# sourceMappingURL=utils.d.ts.map