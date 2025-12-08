## [0.2.3](https://github.com/drewkhoury/devpipe-mcp/compare/v0.2.2...v0.2.3) (2025-12-08)


### Bug Fixes

* update all field references to outputType/outputPath ([a879954](https://github.com/drewkhoury/devpipe-mcp/commit/a879954b757f118c0f62a15119d3ed0881513119))

# Changelog

All notable changes to the devpipe MCP server will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.2] - 2024-12-07

### Added
- **devpipe v0.2.0 compatibility** - Updated for devpipe v0.2.0 field renames (metricsFormat/Path → outputType/Path)
- **`ignoreWatchPaths` flag support** - Added support for devpipe v0.1.0's `--ignore-watch-paths` flag to run all tasks regardless of git changes
- **Template resources** - Added `devpipe://template-dashboard` and `devpipe://template-ide` resources that fetch HTML templates directly from devpipe GitHub source
- **Release resources** - Added `devpipe://releases-latest` and `devpipe://releases-all` resources that fetch release notes from GitHub releases API
- **Documentation resources** - Added `devpipe://readme`, `devpipe://docs-configuration`, `devpipe://docs-examples`, `devpipe://docs-cli-reference`, `devpipe://docs-config-validation`, `devpipe://docs-features`, `devpipe://docs-project-root`, and `devpipe://docs-safety-checks` resources that fetch complete documentation from GitHub
- **Runtime resources** - Added `devpipe://version-info` and `devpipe://available-commands` resources that query the locally installed devpipe binary
- **Git resources** - Added `devpipe://git-status` and `devpipe://changed-files` resources that provide git repository context
- **Historical analysis resources** - Added `devpipe://task-history` and `devpipe://metrics-summary` resources that aggregate data across all pipeline runs
- **WatchPaths analysis resource** - Added `devpipe://watchpaths-analysis` resource that explains which tasks will run based on changed files and watchPaths patterns
- **Recent failures resource** - Added `devpipe://recent-failures` resource that shows failed tasks with error details, failure patterns, and identifies new vs pre-existing failures
- **Flakiness detection resource** - Added `devpipe://flakiness-report` resource that identifies tasks with inconsistent pass/fail patterns
- **Performance regression detection** - Added `devpipe://performance-regressions` resource that detects tasks getting slower over time
- **Change correlation analysis** - Added `devpipe://change-correlation` resource that correlates task failures with recent commits and file changes
- **DEVPIPE_CWD environment variable support** - MCP server now respects `DEVPIPE_CWD` environment variable to locate config files in user's project directory instead of MCP server's installation directory
- New documentation file `docs/DEVPIPE_CWD.md` with comprehensive guide on using the environment variable
- New documentation file `docs/FIX_SUMMARY.md` documenting the config path fix
- New utility function `extractGoTemplate()` to parse Go template constants from source code
- New prompt `configure-metrics` to guide users on proper JUnit, SARIF, and artifact metrics configuration
- New prompt `mcp-info` to show MCP version and devpipe compatibility information
- New tool `get_pipeline_health` to calculate overall pipeline health score with trend analysis and recommendations
- New tool `compare_runs` to compare two pipeline runs and identify changes in failures, performance, and metrics
- New tool `predict_impact` to predict which tasks are likely to fail based on changed files and historical patterns

### Changed
- **Updated for devpipe v0.2.0 compatibility**
  - Minimum required version is now v0.2.0
  - Updated field names: metricsFormat → outputType, metricsPath → outputPath
  - Updated configure-metrics prompt with new field names
  - Updated type definitions and documentation
  - Note: Run folder structure changed (artifacts/ → outputs/)
- **Previously updated for devpipe v0.1.0**
  - Added `ignoreWatchPaths` parameter to `run_pipeline` tool
- **Improved error messages** - Resource handler now shows where it's searching for config files and provides actionable guidance when config.toml is not found
- **Updated all configuration examples** in README.md and SETUP.md to include DEVPIPE_CWD environment variable
- **Enhanced troubleshooting section** in SETUP.md with DEVPIPE_CWD configuration as the primary solution

### Fixed
- **Config file not found error** - Fixed issue where MCP server couldn't find config.toml files because it was searching from its own installation directory instead of the user's project directory

## [0.1.0] - 2024-12-05

### Added
- Initial release of devpipe MCP server
- **Tools**:
  - `list_tasks` - Parse and list tasks from config.toml
  - `run_pipeline` - Execute devpipe with specified flags
  - `validate_config` - Validate configuration files
  - `get_last_run` - Get results from most recent run
  - `view_run_logs` - Read logs from specific tasks or pipeline
  - `parse_metrics` - Parse JUnit/SARIF metrics
  - `get_dashboard_data` - Extract dashboard data from summary.json
  - `check_devpipe` - Check devpipe installation status
- **Resources**:
  - `devpipe://config` - Current configuration contents
  - `devpipe://tasks` - Task definitions
  - `devpipe://last-run` - Last run results
  - `devpipe://summary` - Pipeline summary
- **Prompts**:
  - `analyze-config` - Analyze configuration and suggest improvements
  - `debug-failure` - Debug task failures
  - `optimize-pipeline` - Suggest pipeline optimizations
  - `create-task` - Help create new tasks
  - `security-review` - Review SARIF security findings
- Comprehensive documentation and examples
- Support for all devpipe CLI flags
- TOML configuration parsing
- Git integration support
- Metrics parsing (JUnit, SARIF)
- Error handling and validation

### Documentation
- README with installation and usage instructions
- EXAMPLES with detailed usage scenarios
- CONTRIBUTING guide for developers
- Example configurations for Node.js, Go, and Python projects
- MIT License

## [0.2.1] - 2024-12-07

### Changed
- **Updated for devpipe v0.0.8 compatibility**
  - Updated default values to match v0.0.8 documentation:
    - `fastThreshold` from 5000ms to 300s (seconds, not milliseconds!)
    - `animationRefreshMs` from 100ms to 500ms
    - Added `workdir = "."` to task_defaults
    - Updated git ref default from "main" to "HEAD"
    - Commented out `fixType` in task_defaults (no default value)
- **Phase header improvements**
  - Confirmed phase headers have NO required fields (both name and desc are optional)
  - Updated documentation to reflect this
  - `create_config` now includes both name and desc for better UX
- **Documentation updates**
  - Added version requirement: devpipe v0.0.8+
  - Updated all examples to use v0.0.8 defaults
  - Added notes about default value changes

### Fixed
- Corrected phase header generation to match devpipe v0.0.8 behavior
- Fixed default values to match official devpipe documentation

## [0.2.0] - 2024-12-07

### Added
- **New Tools** (5 total):
  - `list_tasks_verbose` - Use devpipe list --verbose for execution statistics
  - `analyze_project` - Auto-detect technologies and suggest missing tasks
  - `generate_task` - Generate task configurations from templates (supports phase headers)
  - `create_config` - Create complete config.toml from scratch
  - `generate_ci_config` - Generate GitHub Actions or GitLab CI configuration
- **Technology Detection**: Go, Python, Node.js, TypeScript, Rust, Docker, Make
- **Task Templates**: Pre-built templates for common tasks across multiple technologies
- **Phase Header Support**: Generate phase headers with `technology="phase"`
- **CI/CD Generation**: GitHub Actions and GitLab CI pipeline configs

### Changed
- Bumped version to 0.2.0
- Total tools increased from 8 to 13

### Documentation
- Comprehensive README updates with all new tool examples
- Added RELEASE_NOTES_v0.2.0.md
- Added IMPLEMENTATION_SUMMARY.md
- Updated Makefile with WORKDIR support for testing

## [Unreleased]

### Planned
- Automated tests
- XML parser for proper JUnit parsing
- Watch mode for configuration changes
- Interactive task selection
- Pipeline visualization
- Performance profiling
- Custom output formatters
- Integration with CI/CD platforms
