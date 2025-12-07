#!/usr/bin/env node
/**
 * Devpipe MCP Server
 *
 * A Model Context Protocol server that helps AI assistants interact with devpipe
 * to manage development workflows.
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, ListResourcesRequestSchema, ReadResourceRequestSchema, ListPromptsRequestSchema, GetPromptRequestSchema, InitializeRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { checkDevpipeInstalled, findConfigFile, parseConfig, getOutputDir, getLastRunDir, readSummary, readRunMetadata, readTaskLog, readPipelineLog, parseJUnitMetrics, parseSARIFMetrics, buildDevpipeCommand, executeDevpipe, listTasksFromConfig, listTasksVerbose, analyzeProject, generateTaskConfig, createConfig, generateCIConfig, } from './utils.js';
// Create MCP server
const server = new Server({
    name: 'devpipe-mcp',
    version: '0.2.1',
}, {
    capabilities: {
        tools: {},
        resources: {},
        prompts: {},
    },
});
/**
 * Handle initialization request
 * Log raw payload to check for workspace-related parameters
 */
server.setRequestHandler(InitializeRequestSchema, async (request) => {
    const logData = {
        timestamp: new Date().toISOString(),
        fullRequest: request,
        requestKeys: Object.keys(request),
        paramsKeys: Object.keys(request.params || {}),
        workspaceParams: {
            roots: request.params?.roots,
            workspaceFolders: request.params?.workspaceFolders,
            rootUri: request.params?.rootUri,
            rootPath: request.params?.rootPath,
            processId: request.params?.processId,
            clientInfo: request.params?.clientInfo,
        },
    };
    // Log to stderr
    console.error('=== MCP Initialize Request ===');
    console.error(JSON.stringify(logData, null, 2));
    console.error('================================\n');
    // Also write to a file for easy inspection
    try {
        const { writeFile } = await import('fs/promises');
        const logPath = '/tmp/devpipe-mcp-init.json';
        await writeFile(logPath, JSON.stringify(logData, null, 2));
        console.error(`Initialization data written to: ${logPath}\n`);
    }
    catch (err) {
        console.error('Failed to write log file:', err);
    }
    // Return default initialization response
    return {
        protocolVersion: '2024-11-05',
        capabilities: {
            tools: {},
            resources: {},
            prompts: {},
        },
        serverInfo: {
            name: 'devpipe-mcp',
            version: '0.2.1',
        },
    };
});
/**
 * Tool: list_tasks
 * Parse and list all tasks from a config.toml file
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: 'list_tasks',
                description: 'Parse and list all tasks from a devpipe config.toml file. Shows task IDs, names, types, commands, and enabled status.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        config: {
                            type: 'string',
                            description: 'Path to config.toml file. If not provided, searches for config.toml in current directory and parent directories.',
                        },
                    },
                },
            },
            {
                name: 'run_pipeline',
                description: 'Execute devpipe with specified configuration and flags. Runs the development pipeline and returns results.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        config: {
                            type: 'string',
                            description: 'Path to config.toml file',
                        },
                        only: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Run only specific tasks (can specify multiple)',
                        },
                        skip: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Skip specific tasks (can specify multiple)',
                        },
                        since: {
                            type: 'string',
                            description: 'Git reference to run checks on changes since (e.g., HEAD, main, origin/main)',
                        },
                        fixType: {
                            type: 'string',
                            enum: ['auto', 'helper', 'none'],
                            description: 'How to handle auto-fixable issues: auto (fix automatically), helper (show fix command), none (no fixes)',
                        },
                        ui: {
                            type: 'string',
                            enum: ['basic', 'full'],
                            description: 'UI mode: basic (simple output) or full (animated progress)',
                        },
                        dashboard: {
                            type: 'boolean',
                            description: 'Show dashboard view in terminal',
                        },
                        failFast: {
                            type: 'boolean',
                            description: 'Stop execution on first failure',
                        },
                        fast: {
                            type: 'boolean',
                            description: 'Skip tasks that take longer than fastThreshold',
                        },
                        dryRun: {
                            type: 'boolean',
                            description: 'Show what would be executed without running',
                        },
                        verbose: {
                            type: 'boolean',
                            description: 'Enable verbose output',
                        },
                        noColor: {
                            type: 'boolean',
                            description: 'Disable colored output',
                        },
                    },
                },
            },
            {
                name: 'validate_config',
                description: 'Validate one or more devpipe config.toml files for syntax and structure errors.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        configs: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Paths to config files to validate. If not provided, validates config.toml in current directory.',
                        },
                    },
                },
            },
            {
                name: 'get_last_run',
                description: 'Get results and metadata from the most recent devpipe run, including task results, duration, and success status.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        config: {
                            type: 'string',
                            description: 'Path to config.toml file to determine output directory',
                        },
                    },
                },
            },
            {
                name: 'view_run_logs',
                description: 'Read logs from a specific task or the entire pipeline from the most recent run.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        taskId: {
                            type: 'string',
                            description: 'Task ID to view logs for. If not provided, returns the pipeline.log.',
                        },
                        config: {
                            type: 'string',
                            description: 'Path to config.toml file to determine output directory',
                        },
                    },
                },
            },
            {
                name: 'parse_metrics',
                description: 'Parse JUnit or SARIF metrics from a devpipe run to analyze test results or security findings.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        metricsPath: {
                            type: 'string',
                            description: 'Path to metrics file (JUnit XML or SARIF JSON)',
                        },
                        format: {
                            type: 'string',
                            enum: ['junit', 'sarif'],
                            description: 'Metrics format',
                        },
                    },
                    required: ['metricsPath', 'format'],
                },
            },
            {
                name: 'get_dashboard_data',
                description: 'Extract aggregated data from summary.json or the HTML dashboard, including overall run statistics and metrics.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        config: {
                            type: 'string',
                            description: 'Path to config.toml file to determine output directory',
                        },
                    },
                },
            },
            {
                name: 'check_devpipe',
                description: 'Check if devpipe is installed and get version information.',
                inputSchema: {
                    type: 'object',
                    properties: {},
                },
            },
            {
                name: 'list_tasks_verbose',
                description: 'List tasks using devpipe list --verbose command. Shows task execution statistics and averages.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        config: {
                            type: 'string',
                            description: 'Path to config.toml file',
                        },
                    },
                },
            },
            {
                name: 'analyze_project',
                description: 'Analyze project directory to detect technologies and suggest missing tasks.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        projectPath: {
                            type: 'string',
                            description: 'Path to project directory to analyze (defaults to current directory)',
                        },
                    },
                },
            },
            {
                name: 'generate_task',
                description: 'Generate task configuration from template for a specific technology and task type. Use technology="phase" to create phase headers.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        technology: {
                            type: 'string',
                            description: 'Technology name (e.g., "Go", "Python", "Node.js", "TypeScript", "Rust") or "phase" for phase headers',
                        },
                        taskType: {
                            type: 'string',
                            description: 'Task type (e.g., "check-format", "check-lint", "test-unit", "build") or phase name (e.g., "Validation", "Build")',
                        },
                        taskId: {
                            type: 'string',
                            description: 'Optional: custom task ID for regular tasks, or description for phase headers',
                        },
                    },
                    required: ['technology', 'taskType'],
                },
            },
            {
                name: 'generate_ci_config',
                description: 'Generate CI/CD configuration file (GitHub Actions or GitLab CI) from devpipe config.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        config: {
                            type: 'string',
                            description: 'Path to config.toml file',
                        },
                        platform: {
                            type: 'string',
                            enum: ['github', 'gitlab'],
                            description: 'CI/CD platform to generate config for',
                        },
                    },
                    required: ['platform'],
                },
            },
            {
                name: 'create_config',
                description: 'Create a complete config.toml file from scratch with auto-detected tasks based on project technologies.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        projectPath: {
                            type: 'string',
                            description: 'Path to project directory (defaults to current directory)',
                        },
                        includeDefaults: {
                            type: 'boolean',
                            description: 'Include [defaults] section with recommended settings (default: true)',
                        },
                        autoDetect: {
                            type: 'boolean',
                            description: 'Auto-detect technologies and generate tasks (default: true)',
                        },
                    },
                },
            },
        ],
    };
});
/**
 * Handle tool execution
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    // Debug: Log what we receive from the client
    if (process.env.DEBUG_MCP) {
        console.error('=== MCP Request Debug ===');
        console.error('Request keys:', Object.keys(request));
        console.error('Request.params keys:', Object.keys(request.params || {}));
        console.error('Full request:', JSON.stringify(request, null, 2));
        console.error('========================');
    }
    try {
        switch (name) {
            case 'check_devpipe': {
                const result = await checkDevpipeInstalled();
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            case 'list_tasks': {
                const configPath = args?.config || await findConfigFile();
                if (!configPath) {
                    throw new Error('No config.toml file found. Please specify a config path or ensure config.toml exists in the current directory or parent directories.');
                }
                const config = await parseConfig(configPath);
                const tasks = listTasksFromConfig(config);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                configPath,
                                taskCount: tasks.length,
                                tasks,
                            }, null, 2),
                        },
                    ],
                };
            }
            case 'run_pipeline': {
                const devpipeCheck = await checkDevpipeInstalled();
                if (!devpipeCheck.installed) {
                    throw new Error(devpipeCheck.error);
                }
                const runArgs = args;
                const command = buildDevpipeCommand(runArgs);
                const result = await executeDevpipe(command);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                command,
                                exitCode: result.exitCode,
                                success: result.exitCode === 0,
                                stdout: result.stdout,
                                stderr: result.stderr,
                            }, null, 2),
                        },
                    ],
                };
            }
            case 'validate_config': {
                const devpipeCheck = await checkDevpipeInstalled();
                if (!devpipeCheck.installed) {
                    throw new Error(devpipeCheck.error);
                }
                const configs = args?.configs || ['config.toml'];
                const command = `devpipe validate ${configs.join(' ')}`;
                const result = await executeDevpipe(command);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                command,
                                exitCode: result.exitCode,
                                valid: result.exitCode === 0,
                                stdout: result.stdout,
                                stderr: result.stderr,
                            }, null, 2),
                        },
                    ],
                };
            }
            case 'get_last_run': {
                if (process.env.DEBUG_MCP) {
                    console.error('=== get_last_run Debug ===');
                    console.error('args?.config:', args?.config);
                    console.error('Will use findConfigFile:', !args?.config);
                    console.error('========================');
                }
                const configPath = args?.config || await findConfigFile();
                if (!configPath) {
                    throw new Error('No config.toml file found');
                }
                const config = await parseConfig(configPath);
                const outputDir = getOutputDir(configPath, config);
                const lastRunDir = await getLastRunDir(outputDir);
                if (!lastRunDir) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify({ error: 'No previous runs found' }, null, 2),
                            },
                        ],
                    };
                }
                const metadata = await readRunMetadata(lastRunDir);
                const summary = await readSummary(outputDir);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                runDirectory: lastRunDir,
                                metadata,
                                summary,
                            }, null, 2),
                        },
                    ],
                };
            }
            case 'view_run_logs': {
                const configPath = args?.config || await findConfigFile();
                if (!configPath) {
                    throw new Error('No config.toml file found');
                }
                const config = await parseConfig(configPath);
                const outputDir = getOutputDir(configPath, config);
                const lastRunDir = await getLastRunDir(outputDir);
                if (!lastRunDir) {
                    throw new Error('No previous runs found');
                }
                let logContent;
                if (args?.taskId) {
                    logContent = await readTaskLog(lastRunDir, args.taskId);
                }
                else {
                    logContent = await readPipelineLog(lastRunDir);
                }
                if (!logContent) {
                    throw new Error(`Log not found for ${args?.taskId || 'pipeline'}`);
                }
                return {
                    content: [
                        {
                            type: 'text',
                            text: logContent,
                        },
                    ],
                };
            }
            case 'parse_metrics': {
                const metricsPath = args?.metricsPath;
                const format = args?.format;
                if (!metricsPath || !format) {
                    throw new Error('metricsPath and format are required parameters');
                }
                let metrics;
                if (format === 'junit') {
                    metrics = await parseJUnitMetrics(metricsPath);
                }
                else if (format === 'sarif') {
                    metrics = await parseSARIFMetrics(metricsPath);
                }
                else {
                    throw new Error(`Unsupported metrics format: ${format}`);
                }
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(metrics, null, 2),
                        },
                    ],
                };
            }
            case 'get_dashboard_data': {
                const configPath = args?.config || await findConfigFile();
                if (!configPath) {
                    throw new Error('No config.toml file found');
                }
                const config = await parseConfig(configPath);
                const outputDir = getOutputDir(configPath, config);
                const summary = await readSummary(outputDir);
                if (!summary) {
                    throw new Error('No summary.json found. Run devpipe first to generate dashboard data.');
                }
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(summary, null, 2),
                        },
                    ],
                };
            }
            case 'list_tasks_verbose': {
                const devpipeCheck = await checkDevpipeInstalled();
                if (!devpipeCheck.installed) {
                    throw new Error(devpipeCheck.error);
                }
                const configPath = args?.config;
                const result = await listTasksVerbose(configPath);
                return {
                    content: [
                        {
                            type: 'text',
                            text: result.stdout,
                        },
                    ],
                };
            }
            case 'analyze_project': {
                const projectPath = args?.projectPath || process.cwd();
                const analysis = await analyzeProject(projectPath);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                projectPath,
                                detectedTechnologies: analysis.detectedTechnologies,
                                suggestedTasks: analysis.suggestedTasks,
                                summary: `Found ${analysis.detectedTechnologies.length} technologies with ${analysis.suggestedTasks.length} suggested tasks`,
                            }, null, 2),
                        },
                    ],
                };
            }
            case 'generate_task': {
                const technology = args?.technology;
                const taskType = args?.taskType;
                const taskId = args?.taskId;
                if (!technology || !taskType) {
                    throw new Error('technology and taskType are required parameters');
                }
                const taskConfig = generateTaskConfig(technology, taskType, taskId);
                return {
                    content: [
                        {
                            type: 'text',
                            text: taskConfig,
                        },
                    ],
                };
            }
            case 'generate_ci_config': {
                const configPath = args?.config || await findConfigFile();
                if (!configPath) {
                    throw new Error('No config.toml file found');
                }
                const platform = args?.platform;
                if (!platform) {
                    throw new Error('platform is required (github or gitlab)');
                }
                const config = await parseConfig(configPath);
                const ciConfig = generateCIConfig(config, platform);
                return {
                    content: [
                        {
                            type: 'text',
                            text: ciConfig,
                        },
                    ],
                };
            }
            case 'create_config': {
                const projectPath = args?.projectPath || process.cwd();
                const includeDefaults = args?.includeDefaults !== false;
                const autoDetect = args?.autoDetect !== false;
                const configContent = await createConfig(projectPath, {
                    includeDefaults,
                    autoDetect,
                });
                return {
                    content: [
                        {
                            type: 'text',
                            text: configContent,
                        },
                    ],
                };
            }
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
    catch (error) {
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        error: error instanceof Error ? error.message : String(error),
                    }, null, 2),
                },
            ],
            isError: true,
        };
    }
});
/**
 * List available resources
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
        resources: [
            {
                uri: 'devpipe://config',
                name: 'Current devpipe configuration',
                description: 'Contents of config.toml',
                mimeType: 'text/toml',
            },
            {
                uri: 'devpipe://tasks',
                name: 'Task definitions',
                description: 'All task definitions from config.toml',
                mimeType: 'application/json',
            },
            {
                uri: 'devpipe://last-run',
                name: 'Last run results',
                description: 'Results from the most recent pipeline run',
                mimeType: 'application/json',
            },
            {
                uri: 'devpipe://summary',
                name: 'Pipeline summary',
                description: 'Aggregated pipeline summary data',
                mimeType: 'application/json',
            },
            {
                uri: 'devpipe://schema',
                name: 'Configuration schema',
                description: 'JSON Schema for devpipe config.toml validation',
                mimeType: 'application/json',
            },
        ],
    };
});
/**
 * Read resource contents
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;
    try {
        const configPath = await findConfigFile();
        if (!configPath) {
            throw new Error(`No config.toml file found in ${process.cwd()} or parent directories.\n` +
                `Tip: Specify the project path in your prompt, e.g., "Analyze /path/to/your/project"`);
        }
        switch (uri) {
            case 'devpipe://config': {
                const { readFile } = await import('fs/promises');
                const content = await readFile(configPath, 'utf-8');
                return {
                    contents: [
                        {
                            uri,
                            mimeType: 'text/plain',
                            text: content,
                        },
                    ],
                };
            }
            case 'devpipe://tasks': {
                const config = await parseConfig(configPath);
                const tasks = listTasksFromConfig(config);
                return {
                    contents: [
                        {
                            uri,
                            mimeType: 'application/json',
                            text: JSON.stringify(tasks, null, 2),
                        },
                    ],
                };
            }
            case 'devpipe://last-run': {
                const config = await parseConfig(configPath);
                const outputDir = getOutputDir(configPath, config);
                const lastRunDir = await getLastRunDir(outputDir);
                if (!lastRunDir) {
                    throw new Error('No previous runs found');
                }
                const metadata = await readRunMetadata(lastRunDir);
                return {
                    contents: [
                        {
                            uri,
                            mimeType: 'application/json',
                            text: JSON.stringify(metadata, null, 2),
                        },
                    ],
                };
            }
            case 'devpipe://summary': {
                const config = await parseConfig(configPath);
                const outputDir = getOutputDir(configPath, config);
                const summary = await readSummary(outputDir);
                if (!summary) {
                    throw new Error('No summary.json found');
                }
                return {
                    contents: [
                        {
                            uri,
                            mimeType: 'application/json',
                            text: JSON.stringify(summary, null, 2),
                        },
                    ],
                };
            }
            case 'devpipe://schema': {
                // Fetch the official schema from GitHub
                const schemaUrl = 'https://raw.githubusercontent.com/drewkhoury/devpipe/refs/heads/main/config.schema.json';
                const response = await fetch(schemaUrl);
                if (!response.ok) {
                    throw new Error(`Failed to fetch schema: ${response.statusText}`);
                }
                const schema = await response.json();
                return {
                    contents: [
                        {
                            uri,
                            mimeType: 'application/json',
                            text: JSON.stringify(schema, null, 2),
                        },
                    ],
                };
            }
            default:
                throw new Error(`Unknown resource: ${uri}`);
        }
    }
    catch (error) {
        throw new Error(`Failed to read resource: ${error instanceof Error ? error.message : String(error)}`);
    }
});
/**
 * List available prompts
 */
server.setRequestHandler(ListPromptsRequestSchema, async () => {
    return {
        prompts: [
            {
                name: 'analyze-config',
                description: 'Analyze the devpipe configuration and suggest improvements',
            },
            {
                name: 'debug-failure',
                description: 'Help debug why a specific task failed',
                arguments: [
                    {
                        name: 'taskId',
                        description: 'The ID of the task that failed',
                        required: true,
                    },
                ],
            },
            {
                name: 'optimize-pipeline',
                description: 'Suggest optimizations for the pipeline configuration',
            },
            {
                name: 'create-task',
                description: 'Help create a new task for a specific technology or tool',
                arguments: [
                    {
                        name: 'technology',
                        description: 'The technology or tool to create a task for (e.g., "Go", "Python", "ESLint")',
                        required: true,
                    },
                    {
                        name: 'taskType',
                        description: 'Type of task: check, build, or test',
                        required: false,
                    },
                ],
            },
            {
                name: 'security-review',
                description: 'Review SARIF security findings and provide recommendations',
            },
        ],
    };
});
/**
 * Get prompt content
 */
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        const configPath = await findConfigFile();
        switch (name) {
            case 'analyze-config': {
                if (!configPath) {
                    throw new Error('No config.toml file found');
                }
                const config = await parseConfig(configPath);
                const tasks = listTasksFromConfig(config);
                return {
                    messages: [
                        {
                            role: 'user',
                            content: {
                                type: 'text',
                                text: `Please analyze this devpipe configuration and suggest improvements:

Configuration file: ${configPath}

Tasks (${tasks.length} total):
${JSON.stringify(tasks, null, 2)}

Full configuration:
${JSON.stringify(config, null, 2)}

Please review:
1. Task organization and phase structure
2. Parallel execution opportunities
3. Missing common checks (linting, formatting, security scans)
4. Git integration settings
5. Metrics and dashboard configuration
6. Any potential issues or anti-patterns`,
                            },
                        },
                    ],
                };
            }
            case 'debug-failure': {
                if (!args?.taskId) {
                    throw new Error('taskId argument is required');
                }
                if (!configPath) {
                    throw new Error('No config.toml file found');
                }
                const config = await parseConfig(configPath);
                const outputDir = getOutputDir(configPath, config);
                const lastRunDir = await getLastRunDir(outputDir);
                if (!lastRunDir) {
                    throw new Error('No previous runs found');
                }
                const taskLog = await readTaskLog(lastRunDir, args.taskId);
                const metadata = await readRunMetadata(lastRunDir);
                return {
                    messages: [
                        {
                            role: 'user',
                            content: {
                                type: 'text',
                                text: `Please help debug why task "${args.taskId}" failed:

Task Log:
${taskLog || 'No log available'}

Run Metadata:
${JSON.stringify(metadata, null, 2)}

Please analyze:
1. The error message and stack trace
2. Possible causes of the failure
3. Suggested fixes
4. Whether this is a configuration issue or code issue`,
                            },
                        },
                    ],
                };
            }
            case 'optimize-pipeline': {
                if (!configPath) {
                    throw new Error('No config.toml file found');
                }
                const config = await parseConfig(configPath);
                const tasks = listTasksFromConfig(config);
                const outputDir = getOutputDir(configPath, config);
                const summary = await readSummary(outputDir);
                return {
                    messages: [
                        {
                            role: 'user',
                            content: {
                                type: 'text',
                                text: `Please suggest optimizations for this devpipe pipeline:

Configuration: ${configPath}
Tasks: ${tasks.length}

${summary ? `Recent Performance:
${JSON.stringify(summary, null, 2)}
` : ''}

Task Details:
${JSON.stringify(tasks, null, 2)}

Please suggest:
1. How to improve parallel execution
2. Which tasks could be combined or split
3. Fast mode configuration (--fast flag)
4. Git integration optimizations
5. Caching strategies
6. Overall execution time improvements`,
                            },
                        },
                    ],
                };
            }
            case 'create-task': {
                if (!args?.technology) {
                    throw new Error('technology argument is required');
                }
                const taskType = args.taskType || 'check';
                return {
                    messages: [
                        {
                            role: 'user',
                            content: {
                                type: 'text',
                                text: `Please help me create a devpipe task for ${args.technology}.

Task type: ${taskType}

Please provide:
1. A complete task configuration in TOML format
2. The command to run
3. Recommended settings (workdir, fixType, metricsFormat, etc.)
4. Any dependencies or setup required
5. Example of how to integrate it into an existing config.toml

Consider best practices for ${args.technology} including:
- Standard tools and commands
- Common flags and options
- Output formats (JUnit, SARIF, etc.)
- Auto-fix capabilities if available`,
                            },
                        },
                    ],
                };
            }
            case 'security-review': {
                if (!configPath) {
                    throw new Error('No config.toml file found');
                }
                const config = await parseConfig(configPath);
                const outputDir = getOutputDir(configPath, config);
                const summary = await readSummary(outputDir);
                return {
                    messages: [
                        {
                            role: 'user',
                            content: {
                                type: 'text',
                                text: `Please review the security findings from devpipe SARIF reports:

${summary?.metrics ? `Summary Data:
${JSON.stringify(summary.metrics, null, 2)}
` : 'No metrics available. Please run devpipe with SARIF-enabled security scanners first.'}

Please provide:
1. Summary of security findings by severity
2. Critical issues that need immediate attention
3. Recommendations for fixing each issue
4. Suggested additional security checks to add
5. Best practices for the technologies in use`,
                            },
                        },
                    ],
                };
            }
            default:
                throw new Error(`Unknown prompt: ${name}`);
        }
    }
    catch (error) {
        throw new Error(`Failed to generate prompt: ${error instanceof Error ? error.message : String(error)}`);
    }
});
/**
 * Start the server
 */
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Devpipe MCP Server running on stdio');
}
main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map