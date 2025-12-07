# Release Notes - v0.2.0

## New Features

### 1. **Verbose Task Listing** (`list_tasks_verbose`)
- Uses `devpipe list --verbose` command directly
- Shows task execution statistics and average durations
- Provides real execution data instead of just config parsing
- Complements existing `list_tasks` tool

**Usage:**
```json
{
  "config": "./config.toml"
}
```

### 2. **Project Analysis** (`analyze_project`)
- Automatically detects technologies in a project directory
- Suggests missing tasks based on detected technologies
- Supports: Go, Python, Node.js, TypeScript, Rust, Docker
- Helps bootstrap devpipe configurations

**Usage:**
```json
{
  "projectPath": "/path/to/project"
}
```

**Example Output:**
```json
{
  "detectedTechnologies": ["Go", "Docker"],
  "suggestedTasks": [
    { "technology": "Go", "taskType": "check-format", "reason": "go fmt for formatting" },
    { "technology": "Go", "taskType": "check-lint", "reason": "golangci-lint for linting" }
  ]
}
```

### 3. **Task Generation** (`generate_task`)
- Generates ready-to-use task configurations from templates
- Supports multiple technologies and task types
- Outputs TOML configuration that can be copied into config.toml
- Includes best practices for each technology

**Supported Technologies:**
- **Go**: check-format, check-lint, check-static, test-unit, build
- **Python**: check-format, check-lint, check-types, test-unit
- **Node.js**: check-lint, test-unit, build
- **TypeScript**: check-types

**Usage:**
```json
{
  "technology": "Go",
  "taskType": "check-lint",
  "taskId": "golangci-lint"
}
```

**Example Output:**
```toml
[tasks.golangci-lint]
name = "Golang CI Lint"
desc = "Runs comprehensive linting on Go code"
type = "check"
command = "golangci-lint run"
fixType = "auto"
fixCommand = "golangci-lint run --fix"
```

### 4. **CI/CD Configuration Generation** (`generate_ci_config`)
- Generates GitHub Actions or GitLab CI configuration
- Based on existing devpipe config
- Includes devpipe installation and execution
- Uploads artifacts and test results

**Supported Platforms:**
- GitHub Actions
- GitLab CI

**Usage:**
```json
{
  "config": "./config.toml",
  "platform": "github"
}
```

**Example Output (GitHub Actions):**
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

## Technical Changes

- Added new utility functions in `utils.ts`:
  - `listTasksVerbose()` - Execute devpipe list command
  - `analyzeProject()` - Detect technologies and suggest tasks
  - `generateTaskConfig()` - Generate task TOML from templates
  - `generateCIConfig()` - Generate CI/CD configuration

- Updated MCP server to expose 4 new tools (total: 12 tools)
- Version bumped from 0.1.0 to 0.2.0

## Breaking Changes

None - all changes are additive.

## Testing

Build the project and test with MCP Inspector:
```bash
make build
make test-inspector
```

Or test from a specific project directory:
```bash
make test-inspector WORKDIR=/path/to/your/project
```

## Use Cases

### Bootstrap a New Project
1. Use `analyze_project` to detect technologies
2. Use `generate_task` for each suggested task
3. Copy generated TOML into config.toml
4. Use `generate_ci_config` to create CI/CD pipeline

### Enhance Existing Configuration
1. Use `list_tasks_verbose` to see execution statistics
2. Use `analyze_project` to find missing tasks
3. Use `generate_task` to add new checks

### CI/CD Integration
1. Use `generate_ci_config` to create initial pipeline
2. Customize as needed for your workflow
3. Commit to repository

## Next Steps

Future enhancements being considered:
- SARIF viewer integration (`view_sarif`)
- Report regeneration (`regenerate_reports`)
- Interactive task selection
- Performance profiling
- Git integration helpers

## Upgrade Instructions

1. Pull latest changes
2. Run `npm install` (if dependencies changed)
3. Run `make build`
4. Restart your MCP client (Windsurf/Claude)

No configuration changes required.
