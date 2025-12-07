# Quick Reference - Devpipe MCP Server

## Installation

```bash
cd devpipe-mcp
npm install
npm run build
```

## MCP Configuration

### Windsurf
```json
{
  "mcpServers": {
    "devpipe": {
      "command": "node",
      "args": ["/path/to/devpipe-mcp/dist/index.js"]
    }
  }
}
```

### Claude Desktop (macOS)
Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "devpipe": {
      "command": "node",
      "args": ["/path/to/devpipe-mcp/dist/index.js"]
    }
  }
}
```

## Common Commands (via AI Assistant)

| What You Want | What To Say |
|---------------|-------------|
| Check if devpipe is installed | "Is devpipe installed?" |
| List all tasks | "Show me all tasks in my config" |
| Run pipeline | "Run devpipe" |
| Run with fast mode | "Run devpipe with --fast" |
| Run specific tasks | "Run only the lint and test tasks" |
| Skip tasks | "Run devpipe but skip the e2e-tests" |
| Dry run | "Show me what would run without executing" |
| Validate config | "Validate my config.toml" |
| Get last run results | "What happened in the last run?" |
| View task logs | "Show me the logs for the lint task" |
| Debug failure | "Why did the build task fail?" |
| Analyze config | "Analyze my pipeline configuration" |
| Optimize pipeline | "How can I make my pipeline faster?" |
| Create new task | "Create a task for running Go tests" |
| Security review | "Review the security findings" |

## MCP Tools

| Tool | Purpose |
|------|---------|
| `check_devpipe` | Check installation status |
| `list_tasks` | List all tasks from config |
| `run_pipeline` | Execute devpipe |
| `validate_config` | Validate config files |
| `get_last_run` | Get last run results |
| `view_run_logs` | Read task/pipeline logs |
| `parse_metrics` | Parse JUnit/SARIF metrics |
| `get_dashboard_data` | Get summary data |

## MCP Resources

| Resource | Content |
|----------|---------|
| `devpipe://config` | Current config.toml |
| `devpipe://tasks` | Task definitions |
| `devpipe://last-run` | Last run results |
| `devpipe://summary` | Pipeline summary |

## MCP Prompts

| Prompt | Purpose |
|--------|---------|
| `analyze-config` | Analyze configuration |
| `debug-failure` | Debug task failure |
| `optimize-pipeline` | Suggest optimizations |
| `create-task` | Create new task |
| `security-review` | Review security findings |

## Run Pipeline Flags

| Flag | Type | Description |
|------|------|-------------|
| `config` | string | Path to config.toml |
| `only` | string[] | Run only these tasks |
| `skip` | string[] | Skip these tasks |
| `since` | string | Git ref for changes |
| `fixType` | enum | auto, helper, none |
| `ui` | enum | basic, full |
| `dashboard` | boolean | Show dashboard |
| `failFast` | boolean | Stop on first failure |
| `fast` | boolean | Skip slow tasks |
| `dryRun` | boolean | Preview execution |
| `verbose` | boolean | Verbose output |
| `noColor` | boolean | Disable colors |

## File Locations

| File | Purpose |
|------|---------|
| `config.toml` | Devpipe configuration |
| `.devpipe/` | Output directory |
| `.devpipe/report.html` | HTML dashboard |
| `.devpipe/summary.json` | Aggregated metrics |
| `.devpipe/runs/*/run.json` | Run metadata |
| `.devpipe/runs/*/pipeline.log` | Full pipeline log |
| `.devpipe/runs/*/logs/*.log` | Individual task logs |

## Example Workflows

### Setup New Project
1. "Is devpipe installed?"
2. "Create a task for [technology]"
3. "Validate my config"
4. "Run devpipe in dry-run mode"

### Debug Failure
1. "What happened in the last run?"
2. "Show me the logs for [task]"
3. "Why did [task] fail?"

### Optimize Performance
1. "Analyze my pipeline configuration"
2. "How can I make my pipeline faster?"
3. "Run devpipe with --fast"

### Security Review
1. "Run devpipe"
2. "Review the security findings"
3. "Show me SARIF results"

## Troubleshooting

| Problem | Solution |
|---------|----------|
| MCP server not found | Check path in MCP config, rebuild project |
| devpipe not found | `brew install drewkhoury/tap/devpipe` |
| Config not found | Navigate to project dir or specify path |
| Permission denied | `chmod +x dist/index.js` |
| Build errors | `npm install && npm run build` |

## Development

```bash
# Build
npm run build

# Watch mode
npm run watch

# Test manually
node dist/index.js
```

## Links

- [Full Documentation](./README.md)
- [Setup Guide](./SETUP.md)
- [Examples](./EXAMPLES.md)
- [Contributing](./CONTRIBUTING.md)
- [devpipe GitHub](https://github.com/drewkhoury/devpipe)
