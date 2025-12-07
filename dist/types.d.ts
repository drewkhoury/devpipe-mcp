/**
 * Type definitions for devpipe MCP server
 */
export interface DevpipeConfig {
    defaults?: {
        outputRoot?: string;
        fastThreshold?: number;
        uiMode?: 'basic' | 'full';
        animationRefreshMs?: number;
        animatedGroupBy?: 'phase' | 'type';
        git?: {
            mode?: 'staged' | 'staged_unstaged' | 'ref';
            ref?: string;
        };
    };
    task_defaults?: {
        enabled?: boolean;
        workdir?: string;
        fixType?: 'auto' | 'helper' | 'none';
    };
    tasks: {
        [taskId: string]: DevpipeTask;
    };
}
export interface DevpipeTask {
    command?: string;
    name?: string;
    desc?: string;
    type?: 'check' | 'build' | 'test';
    workdir?: string;
    enabled?: boolean;
    fixType?: 'auto' | 'helper' | 'none';
    fixCommand?: string;
    metricsFormat?: 'junit' | 'sarif' | 'artifact';
    metricsPath?: string;
}
export interface RunMetadata {
    timestamp: string;
    config: string;
    tasks: TaskResult[];
    duration: number;
    success: boolean;
}
export interface TaskResult {
    id: string;
    name: string;
    status: 'success' | 'failure' | 'skipped';
    duration: number;
    exitCode: number;
    output?: string;
    error?: string;
}
export interface SummaryData {
    lastRun?: {
        timestamp: string;
        success: boolean;
        duration: number;
        tasksRun: number;
        tasksPassed: number;
        tasksFailed: number;
    };
    metrics?: {
        junit?: JUnitMetrics;
        sarif?: SARIFMetrics;
    };
}
export interface JUnitMetrics {
    tests: number;
    failures: number;
    errors: number;
    skipped: number;
    time: number;
    testCases?: Array<{
        name: string;
        classname: string;
        time: number;
        status: 'passed' | 'failed' | 'error' | 'skipped';
        message?: string;
    }>;
}
export interface SARIFMetrics {
    runs: Array<{
        tool: {
            driver: {
                name: string;
                version?: string;
            };
        };
        results: Array<{
            ruleId: string;
            level: 'error' | 'warning' | 'note';
            message: {
                text: string;
            };
            locations?: Array<{
                physicalLocation?: {
                    artifactLocation?: {
                        uri: string;
                    };
                    region?: {
                        startLine: number;
                        startColumn?: number;
                    };
                };
            }>;
        }>;
    }>;
}
export interface RunPipelineArgs {
    config?: string;
    only?: string[];
    skip?: string[];
    since?: string;
    fixType?: 'auto' | 'helper' | 'none';
    ui?: 'basic' | 'full';
    dashboard?: boolean;
    failFast?: boolean;
    fast?: boolean;
    dryRun?: boolean;
    verbose?: boolean;
    noColor?: boolean;
}
//# sourceMappingURL=types.d.ts.map