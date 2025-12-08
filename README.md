# Devpipe MCP Server

A [Model Context Protocol](https://modelcontextprotocol.io) (MCP) server that enables AI assistants to interact with [devpipe](https://github.com/drewkhoury/devpipe) - a fast, local pipeline runner for development workflows.

## Features

This MCP server provides AI assistants with the ability to:

- 📋 **List and analyze tasks** from devpipe configurations (with verbose stats)
- 🚀 **Run pipelines** with full control over execution flags
- ✅ **Validate configurations** before running
- 📊 **Access run results** and metrics (JUnit, SARIF)
- 🔍 **Debug failures** by reading task logs
- 💡 **Suggest optimizations** for pipeline configurations
- 🛡️ **Review security findings** from SARIF reports
- 🔧 **Auto-detect technologies** and suggest missing tasks
- ⚡ **Generate task configurations** from templates
- 📝 **Create complete configs** from scratch
- 🔄 **Generate CI/CD configs** (GitHub Actions, GitLab CI)

## Prerequisites

- **Node.js** 18 or higher
- **devpipe** v0.1.0 or higher installed and accessible in PATH
  ```bash
  brew install drewkhoury/tap/devpipe
  ```
  
  **Note:** This MCP is optimized for devpipe v0.1.0+ which includes the `--ignore-watch-paths` flag and other improvements.

## Installation

### Option 1: Install from npm (recommended)

```bash
npm install -g devpipe-mcp
```

### Option 2: Install from source

```bash
git clone https://github.com/drewkhoury/devpipe-mcp.git
cd devpipe-mcp
npm install
npm run build
npm link
```

## Configuration

Add to your MCP configuration file:
- **Windsurf/Cascade**: `~/.codeium/windsurf/mcp_config.json`
- **Claude Desktop**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "devpipe": {
      "command": "npx",
      "args": [
        "-y",
        "devpipe-mcp@latest"
      ]
    }
  }
}
```

### For Other MCP Clients

The server runs on stdio, so you can connect any MCP client using:

```bash
devpipe-mcp
```

## Usage

Once configured, you can interact with devpipe through your AI assistant using **natural language**. The AI will automatically translate your requests into the appropriate tool calls.

> 📖 **[Complete Prompting Guide](./docs/PROMPTING_GUIDE.md)** - Learn all the ways to effectively prompt the MCP server

### 🎯 How to Prompt

**The key is to specify which project you want to work with:**

- **"this project"** or **"this repo"** - Uses your current workspace
- **Project name** - e.g., "the devpipe project", "my go-app"
- **Absolute path** - e.g., "/Users/you/projects/my-app"

### List Tasks

```
"Show me all the tasks in this project"
"What tasks are defined in /Users/you/projects/my-app/config.toml?"
"List tasks from the devpipe project"
```

### Run Pipeline

```
"Run devpipe in this project"
"Run the pipeline for /Users/you/projects/my-app"
"Run only the lint and test tasks in this repo"
"Execute devpipe in dry-run mode for the go-app project"
```

### Validate Configuration

```
"Validate my devpipe config"
"Check if config.toml is valid"
```

### Debug Failures

```
"Why did the lint task fail?"
"Show me the logs for the build task"
"What went wrong in the last run?"
```

### Analyze and Optimize

```
"Analyze my pipeline configuration"
"Suggest optimizations for my devpipe setup"
"How can I make my pipeline faster?"
```

### Create Tasks

```
"Create a devpipe task for running Go tests"
"Help me add a Python linting task"
"Generate a task configuration for ESLint"
```

### Bootstrap New Projects

```
"Create a devpipe config for this project"
"Analyze the project at /Users/you/projects/new-app"
"What technologies are in this repo?"
"Generate a config for /path/to/project"
```

### Working with Multiple Projects

```
"Analyze /Users/you/projects/project-a"
"Run devpipe in /Users/you/projects/project-b"
"Compare tasks between this project and /Users/you/projects/other-project"
```

**Pro Tip:** You don't need to configure anything special - just tell the AI which project you want to work with in your prompt!

### Generate CI/CD

```
"Generate a GitHub Actions workflow for devpipe"
"Create a GitLab CI config from my devpipe setup"
```

### Security Review

```
"Review the security findings from my last run"
"What security issues were found?"
"Analyze SARIF results"
```

## MCP Tools

The server provides the following tools:

### `list_tasks`
Parse and list all tasks from a config.toml file.

**Parameters:**
- `config` (optional): Path to config.toml file

**Example:**
```json
{
  "config": "./config.toml"
}
```

### `run_pipeline`
Execute devpipe with specified flags.

**Parameters:**
- `config` (optional): Path to config.toml
- `only` (optional): Array of task IDs to run
- `skip` (optional): Array of task IDs to skip
- `since` (optional): Git reference for change-based runs
- `fixType` (optional): `auto`, `helper`, or `none`
- `ui` (optional): `basic` or `full`
- `dashboard` (optional): Show dashboard view
- `failFast` (optional): Stop on first failure
- `fast` (optional): Skip slow tasks
- `ignoreWatchPaths` (optional): Ignore watchPaths and run all tasks
- `dryRun` (optional): Show what would run
- `verbose` (optional): Verbose output
- `noColor` (optional): Disable colors

**Example:**
```json
{
  "only": ["lint", "test"],
  "fast": true,
  "failFast": true,
  "ignoreWatchPaths": true
}
```

### `validate_config`
Validate devpipe configuration files.

**Parameters:**
- `configs` (optional): Array of config file paths

**Example:**
```json
{
  "configs": ["config.toml", "config.prod.toml"]
}
```

### `get_last_run`
Get results from the most recent pipeline run.

**Parameters:**
- `config` (optional): Path to config.toml

### `view_run_logs`
Read logs from a specific task or the entire pipeline.

**Parameters:**
- `taskId` (optional): Task ID to view logs for
- `config` (optional): Path to config.toml

**Example:**
```json
{
  "taskId": "lint"
}
```

### `parse_metrics`
Parse JUnit or SARIF metrics files.

**Parameters:**
- `metricsPath` (required): Path to metrics file
- `format` (required): `junit` or `sarif`

**Example:**
```json
{
  "metricsPath": ".devpipe/runs/latest/metrics.sarif",
  "format": "sarif"
}
```

### `get_dashboard_data`
Extract aggregated data from summary.json.

**Parameters:**
- `config` (optional): Path to config.toml

### `check_devpipe`
Check if devpipe is installed and get version info.

### `list_tasks_verbose`
List tasks using `devpipe list --verbose` command with execution statistics.

**Parameters:**
- `config` (optional): Path to config.toml file

**Example:**
```json
{
  "config": "./config.toml"
}
```

**Output:** Shows task table with average execution times and statistics.

### `analyze_project`
Analyze project directory to detect technologies and suggest missing tasks.

**Parameters:**
- `projectPath` (optional): Path to project directory (defaults to current)

**Example:**
```json
{
  "projectPath": "/path/to/project"
}
```

**Output:**
```json
{
  "projectPath": "/path/to/project",
  "detectedTechnologies": ["Go", "Docker"],
  "suggestedTasks": [
    {
      "technology": "Go",
      "taskType": "check-format",
      "reason": "go fmt for formatting"
    },
    {
      "technology": "Go",
      "taskType": "check-lint",
      "reason": "golangci-lint for linting"
    }
  ],
  "summary": "Found 2 technologies with 5 suggested tasks"
}
```

### `generate_task`
Generate task configuration from template for a specific technology or phase header.

**Parameters:**
- `technology` (required): Technology name (e.g., "Go", "Python", "Node.js", "TypeScript", "Rust") or "phase" for phase headers
- `taskType` (required): Task type (e.g., "check-format", "check-lint", "test-unit", "build") or phase name
- `taskId` (optional): Custom task ID for regular tasks, or description for phase headers

**Example (Regular Task):**
```json
{
  "technology": "Go",
  "taskType": "check-lint",
  "taskId": "golangci-lint"
}
```

**Output:**
```toml
[tasks.golangci-lint]
name = "Golang CI Lint"
desc = "Runs comprehensive linting on Go code"
type = "check"
command = "golangci-lint run"
fixType = "auto"
fixCommand = "golangci-lint run --fix"
```

**Example (Phase Header):**
```json
{
  "technology": "phase",
  "taskType": "Validation",
  "taskId": "Static analysis and tests"
}
```

**Output:**
```toml
[tasks.phase-validation]
name = "Validation"
desc = "Static analysis and tests"
```

**Note:** Phase headers have **no required fields** - they're organizational markers. Common practice is to include `name` or `desc` (or both), but neither is strictly required.

**Supported Technologies:**
- **Go**: check-format, check-lint, check-static, test-unit, build
- **Python**: check-format, check-lint, check-types, test-unit
- **Node.js**: check-lint, test-unit, build
- **TypeScript**: check-types
- **phase**: Creates phase headers (organizational markers, no command/type)

### `create_config`
Create a complete config.toml file from scratch with auto-detected tasks.

**Parameters:**
- `projectPath` (optional): Path to project directory (defaults to current)
- `includeDefaults` (optional): Include [defaults] section (default: true)
- `autoDetect` (optional): Auto-detect technologies and generate tasks (default: true)

**Example:**
```json
{
  "projectPath": "/path/to/project",
  "includeDefaults": true,
  "autoDetect": true
}
```

**Output:** Complete config.toml with:
- Defaults section (outputRoot, fastThreshold=300s, animationRefreshMs=500ms, git settings)
- Task defaults (enabled, workdir)
- Auto-detected tasks organized by phase
- Ready-to-use TOML configuration compatible with devpipe v0.1.0+

**Use Case:** Bootstrap a new project with devpipe configuration.

**Note:** Generated configs use devpipe v0.1.0 defaults (fastThreshold=300s, not 5000ms).

### `get_pipeline_health`
Calculate overall pipeline health score with trend analysis, failure rates, and performance metrics. Returns health score (0-100), issues, warnings, and recommendations.

### `compare_runs`
Compare two pipeline runs to identify changes in failures, performance, and metrics.

**Parameters:**
- `run1` (required): First run ID (e.g., `2024-12-07_20-00-00`) or `latest`
- `run2` (required): Second run ID or `previous`

**Returns:** New failures, fixed tasks, performance changes, and detailed task comparisons.

### `predict_impact`
Predict which tasks are likely to fail based on changed files and historical patterns.

**Returns:** Risk scores per task, recommended tasks to run, and suggested devpipe command.

**Risk scoring:**
- WatchPaths matching (40 points)
- Historical failure correlation (30 points)
- Recent failure rate (30 points)

### `generate_ci_config`
Generate CI/CD configuration file (GitHub Actions or GitLab CI) from devpipe config.

**Parameters:**
- `config` (optional): Path to config.toml file
- `platform` (required): `github` or `gitlab`

**Example:**
```json
{
  "config": "./config.toml",
  "platform": "github"
}
```

**Output (GitHub Actions):**
```yaml
name: CI Pipeline

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
```

## MCP Resources

The server exposes these resources:

- `devpipe://config` - Current config.toml contents
- `devpipe://tasks` - All task definitions
- `devpipe://last-run` - Most recent run results
- `devpipe://summary` - Aggregated pipeline summary
- `devpipe://schema` - JSON Schema for config.toml validation (fetched from official devpipe repo)
- `devpipe://template-dashboard` - HTML template for dashboard reports (fetched from devpipe source)
- `devpipe://template-ide` - HTML template for IDE-optimized views (fetched from devpipe source)
- `devpipe://releases-latest` - Latest devpipe release notes (from GitHub releases)
- `devpipe://releases-all` - Complete release history (from GitHub releases)
- `devpipe://readme` - Complete devpipe documentation (from GitHub)
- `devpipe://docs-configuration` - Official configuration guide (from GitHub)
- `devpipe://docs-examples` - Example config.toml with all options (from GitHub)
- `devpipe://docs-cli-reference` - CLI commands and flags reference (from GitHub)
- `devpipe://docs-config-validation` - Configuration validation rules (from GitHub)
- `devpipe://docs-features` - Complete features guide (from GitHub)
- `devpipe://docs-project-root` - Project root configuration (from GitHub)
- `devpipe://docs-safety-checks` - Safety checks documentation (from GitHub)
- `devpipe://version-info` - Installed devpipe version and capabilities (from local binary)
- `devpipe://available-commands` - All CLI commands and flags (from local binary)
- `devpipe://git-status` - Current git repository status (from local git)
- `devpipe://changed-files` - Files changed based on git mode (from local git)
- `devpipe://task-history` - Historical task performance across all runs (from local runs)
- `devpipe://metrics-summary` - Aggregated test and security metrics (from local runs)
- `devpipe://watchpaths-analysis` - Analyze which tasks will run based on watchPaths (from local config + git)
- `devpipe://recent-failures` - Recent task failures with error details and patterns (from local runs)
- `devpipe://flakiness-report` - Flaky task detection with pass/fail patterns (from local runs)
- `devpipe://performance-regressions` - Tasks that have gotten slower over time (from local runs)
- `devpipe://change-correlation` - Correlate failures with recent commits and file changes (from local git + runs)

## MCP Prompts

Pre-configured prompts for common workflows:

### `analyze-config`
Analyze the devpipe configuration and suggest improvements.

### `debug-failure`
Help debug why a specific task failed.

**Arguments:**
- `taskId` (required): The task that failed

### `optimize-pipeline`
Suggest optimizations for the pipeline.

### `create-task`
Help create a new task for a technology.

**Arguments:**
- `technology` (required): Technology name (e.g., "Go", "Python")
- `taskType` (optional): `check`, `build`, or `test`

### `security-review`
Review SARIF security findings and provide recommendations.

### `configure-metrics`
Help configure JUnit, SARIF, or artifact metrics for a task. Provides guidance on proper metricsFormat and metricsPath configuration.

## Examples

See [EXAMPLES.md](./EXAMPLES.md) for detailed usage examples and workflows.

### Quick Example

```
User: "Run my devpipe pipeline with fast mode"
Assistant: *Uses run_pipeline tool with { "fast": true }*
Result: Pipeline executes, skipping slow tasks
```

## Development

### Building from Source

```bash
git clone https://github.com/drewkhoury/devpipe-mcp.git
cd devpipe-mcp
npm install
npm run build
```

### Project Structure

```
devpipe-mcp/
├── src/
│   ├── index.ts       # Main MCP server
│   ├── types.ts       # Type definitions
│   └── utils.ts       # Utility functions
├── examples/          # Example configs
├── dist/              # Compiled output
└── README.md
```

### Watch Mode

```bash
npm run watch
```

## Troubleshooting

### devpipe not found

If you get "devpipe not found" errors:

```bash
# Install devpipe
brew install drewkhoury/tap/devpipe

# Verify installation
devpipe --version
```

### Config file not found

The MCP server searches for `config.toml` in:
1. Current directory
2. Parent directories (up to root)

You can also specify the config path explicitly in tool calls.

### Permission errors

Ensure the MCP server has permission to:
- Read config files
- Execute devpipe commands
- Access the `.devpipe` output directory

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](./LICENSE) file for details.

## Related Projects

- [devpipe](https://github.com/drewkhoury/devpipe) - The pipeline runner this MCP server integrates with
- [Model Context Protocol](https://modelcontextprotocol.io) - The protocol specification

## Support

- **Issues**: [GitHub Issues](https://github.com/drewkhoury/devpipe-mcp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/drewkhoury/devpipe-mcp/discussions)
- **devpipe**: [devpipe GitHub](https://github.com/drewkhoury/devpipe)

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history and changes.
