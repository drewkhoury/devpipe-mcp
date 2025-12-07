# Devpipe MCP Server - Usage Examples

This document provides detailed examples of how to use the devpipe MCP server with AI assistants.

## Example 1: Quick Pipeline Run

**User:** "Run my devpipe pipeline with fast mode"

**AI Assistant uses:**
- Tool: `run_pipeline`
- Parameters: `{ "fast": true }`

**Result:** Pipeline executes skipping slow tasks, returns execution summary with task results.

---

## Example 2: Debugging a Failed Task

**User:** "The lint task failed in my last run. Can you help me figure out why?"

**AI Assistant workflow:**
1. Uses `get_last_run` to get run metadata
2. Uses `view_run_logs` with `{ "taskId": "lint" }` to get the log
3. Analyzes the error and suggests fixes

**Result:** Detailed analysis of the failure with actionable recommendations.

---

## Example 3: Configuration Analysis

**User:** "Analyze my pipeline configuration and suggest improvements"

**AI Assistant uses:**
- Prompt: `analyze-config`
- Resource: `devpipe://config`
- Tool: `list_tasks`

**Result:** Comprehensive analysis covering:
- Task organization and phases
- Parallel execution opportunities
- Missing common checks
- Configuration best practices

---

## Example 4: Creating a New Task

**User:** "Help me create a task to run Go tests with coverage"

**AI Assistant uses:**
- Prompt: `create-task` with `{ "technology": "Go", "taskType": "test" }`

**Result:** Complete TOML configuration:
```toml
[tasks.go-test]
name = "Go Tests with Coverage"
desc = "Run Go unit tests and generate coverage report"
command = "go test -v -race -coverprofile=coverage.out ./..."
type = "test"
workdir = "."
metricsFormat = "junit"
metricsPath = "test-results.xml"
```

---

## Example 5: Running Specific Tasks

**User:** "Run only the lint and format tasks, skip everything else"

**AI Assistant uses:**
- Tool: `run_pipeline`
- Parameters: `{ "only": ["lint", "format"] }`

**Result:** Only specified tasks execute.

---

## Example 6: Validating Configuration

**User:** "I just modified my config.toml. Can you validate it?"

**AI Assistant uses:**
- Tool: `validate_config`
- Parameters: `{ "configs": ["config.toml"] }`

**Result:** Validation results showing any syntax or structural errors.

---

## Example 7: Security Review

**User:** "Review the security findings from my last SARIF scan"

**AI Assistant uses:**
- Prompt: `security-review`
- Tool: `get_dashboard_data`
- Resource: `devpipe://summary`

**Result:** Security analysis with:
- Findings grouped by severity
- Critical issues highlighted
- Remediation recommendations
- Suggested additional security checks

---

## Example 8: Pipeline Optimization

**User:** "My pipeline is taking too long. How can I speed it up?"

**AI Assistant uses:**
- Prompt: `optimize-pipeline`
- Tool: `list_tasks`
- Tool: `get_dashboard_data`

**Result:** Optimization suggestions:
- Tasks that can run in parallel
- Fast mode configuration
- Caching strategies
- Git integration for change-based runs

---

## Example 9: Dry Run Before Commit

**User:** "Show me what would run if I execute devpipe right now"

**AI Assistant uses:**
- Tool: `run_pipeline`
- Parameters: `{ "dryRun": true, "verbose": true }`

**Result:** List of tasks that would execute without actually running them.

---

## Example 10: Git-Based Execution

**User:** "Run checks only on files I've changed since main branch"

**AI Assistant uses:**
- Tool: `run_pipeline`
- Parameters: `{ "since": "origin/main" }`

**Result:** Pipeline runs only on changed files, saving time.

---

## Example 11: Viewing All Resources

**User:** "Show me the current state of my pipeline"

**AI Assistant accesses:**
- Resource: `devpipe://config` - Current configuration
- Resource: `devpipe://tasks` - All task definitions
- Resource: `devpipe://last-run` - Latest run results
- Resource: `devpipe://summary` - Overall summary

**Result:** Complete overview of pipeline state and history.

---

## Example 12: Multi-Config Validation

**User:** "Validate all my config files"

**AI Assistant uses:**
- Tool: `validate_config`
- Parameters: `{ "configs": ["config.toml", "config.ci.toml", "config.prod.toml"] }`

**Result:** Validation results for all configuration files.

---

## Example 13: Task Log Investigation

**User:** "Show me what happened during the build task"

**AI Assistant uses:**
- Tool: `view_run_logs`
- Parameters: `{ "taskId": "build" }`

**Result:** Complete build task log output.

---

## Example 14: Metrics Parsing

**User:** "Parse the JUnit test results from my last run"

**AI Assistant uses:**
- Tool: `get_last_run` to find the run directory
- Tool: `parse_metrics` with `{ "metricsPath": ".devpipe/runs/.../junit.xml", "format": "junit" }`

**Result:** Parsed test metrics with pass/fail counts and details.

---

## Example 15: Installation Check

**User:** "Is devpipe installed on this system?"

**AI Assistant uses:**
- Tool: `check_devpipe`

**Result:** Installation status and version information, or installation instructions if not found.

---

## Complex Workflow Example

**User:** "I want to set up a comprehensive Go project pipeline"

**AI Assistant workflow:**
1. Uses `check_devpipe` to verify installation
2. Uses `list_tasks` to see current configuration
3. Uses `create-task` prompt multiple times for:
   - Go formatting (gofmt)
   - Go linting (golangci-lint)
   - Go tests with coverage
   - Go build
   - Security scanning (gosec)
4. Suggests phase organization for parallel execution
5. Recommends metrics configuration (JUnit for tests, SARIF for security)
6. Uses `validate_config` to verify the new configuration
7. Uses `run_pipeline` with `{ "dryRun": true }` to preview execution

**Result:** Complete, validated pipeline configuration ready to use.

---

## Tips for AI Assistants

When using this MCP server:

1. **Always check devpipe installation first** for new users
2. **Use dry-run mode** before making destructive changes
3. **Combine tools** for comprehensive analysis (e.g., get_last_run + view_run_logs)
4. **Leverage prompts** for complex workflows (analyze-config, optimize-pipeline)
5. **Access resources** for context before making suggestions
6. **Parse metrics** to provide data-driven recommendations
7. **Validate configs** after suggesting changes

## Common Patterns

### Pattern: Debug Workflow
1. `get_last_run` - Get run metadata
2. `view_run_logs` - Get specific task log
3. Analyze and suggest fixes

### Pattern: Optimization Workflow
1. `list_tasks` - See current tasks
2. `get_dashboard_data` - Get performance data
3. `optimize-pipeline` prompt - Get suggestions
4. `validate_config` - Verify changes

### Pattern: Setup Workflow
1. `check_devpipe` - Verify installation
2. `create-task` prompts - Generate tasks
3. `validate_config` - Verify configuration
4. `run_pipeline` with dryRun - Preview execution
