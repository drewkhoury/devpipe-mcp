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
- **devpipe** v0.0.8 or higher installed and accessible in PATH
  ```bash
  brew install drewkhoury/tap/devpipe
  ```
  
  **Note:** This MCP is optimized for devpipe v0.0.8+ which includes updated default values and improved documentation.

## Installation

### Option 1: Install from npm (when published)

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

### For Windsurf/Cascade

Add to your Windsurf MCP settings file (usually `~/.windsurf/mcp.json` or similar):

```json
{
  "mcpServers": {
    "devpipe": {
      "command": "devpipe-mcp"
    }
  }
}
```

### For Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

```json
{
  "mcpServers": {
    "devpipe": {
      "command": "devpipe-mcp"
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

Once configured, you can interact with devpipe through your AI assistant. Here are some example requests:

### List Tasks

```
"Show me all the tasks in my devpipe configuration"
"What tasks are defined in config.toml?"
```

### Run Pipeline

```
"Run the devpipe pipeline"
"Run only the lint and test tasks"
"Run devpipe with --fast and --fail-fast flags"
"Execute devpipe in dry-run mode"
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
"Analyze my project and suggest tasks"
"What technologies did you detect in /path/to/project?"
```

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
- `dryRun` (optional): Show what would run
- `verbose` (optional): Verbose output
- `noColor` (optional): Disable colors

**Example:**
```json
{
  "only": ["lint", "test"],
  "fast": true,
  "failFast": true
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
- Ready-to-use TOML configuration compatible with devpipe v0.0.8+

**Use Case:** Bootstrap a new project with devpipe configuration.

**Note:** Generated configs use devpipe v0.0.8 defaults (fastThreshold=300s, not 5000ms).

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
