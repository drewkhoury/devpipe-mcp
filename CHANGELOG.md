# Changelog

All notable changes to the devpipe MCP server will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **DEVPIPE_CWD environment variable support** - MCP server now respects `DEVPIPE_CWD` environment variable to locate config files in user's project directory instead of MCP server's installation directory
- New documentation file `docs/DEVPIPE_CWD.md` with comprehensive guide on using the environment variable
- New documentation file `docs/FIX_SUMMARY.md` documenting the config path fix

### Changed
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
