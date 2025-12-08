# Release Notes v0.2.2

**Release Date:** December 7, 2024

## Overview

This release adds support for devpipe v0.1.0, including the new `--ignore-watch-paths` flag that allows running all tasks regardless of git changes.

## What's New

### 🎯 devpipe v0.1.0 Compatibility

- **Minimum required version:** devpipe v0.1.0+
- **New flag support:** `ignoreWatchPaths` parameter in `run_pipeline` tool

### ⚡ Key Feature: `ignoreWatchPaths`

The new `ignoreWatchPaths` flag solves a common pain point - running all tasks even when git watchPaths would normally skip them.

### 📄 New Resources (19 total!)

Nineteen new resources provide comprehensive access to devpipe:

**GitHub Resources (12):**

*Templates:*
- **`devpipe://template-dashboard`** - Dashboard report template
- **`devpipe://template-ide`** - IDE-optimized view template

*Documentation (Complete Coverage):*
- **`devpipe://readme`** - Complete devpipe documentation
- **`devpipe://docs-configuration`** - Official configuration guide
- **`devpipe://docs-examples`** - Example config.toml with all options
- **`devpipe://docs-cli-reference`** - CLI commands and flags reference
- **`devpipe://docs-config-validation`** - Configuration validation rules
- **`devpipe://docs-features`** - Complete features guide
- **`devpipe://docs-project-root`** - Project root configuration
- **`devpipe://docs-safety-checks`** - Safety checks documentation

*Releases:*
- **`devpipe://releases-latest`** - Latest release notes (from GitHub releases)
- **`devpipe://releases-all`** - Complete release history (from GitHub releases)

**Runtime Resources (2):**
- **`devpipe://version-info`** - Installed version and capabilities
- **`devpipe://available-commands`** - All CLI commands and flags

**Git Context Resources (2):**
- **`devpipe://git-status`** - Current repository status (branch, changes, staged files)
- **`devpipe://changed-files`** - Files changed based on git mode configuration

**Historical Analysis Resources (3):**
- **`devpipe://task-history`** - Task performance trends across all runs
- **`devpipe://metrics-summary`** - Aggregated test results and security findings
- **`devpipe://watchpaths-analysis`** - Explains which tasks will run based on watchPaths ⭐

These resources allow AI assistants to:
- **Complete devpipe knowledge** - All official documentation available
- **Understand report structure** - HTML templates for dashboard and IDE views
- **Know latest features** - Release notes from GitHub releases
- **Help configure** - Configuration guide, examples, and validation rules
- **Answer CLI questions** - Complete command reference
- **Explain features** - Features guide and safety checks
- **Debug path issues** - Project root configuration docs
- **Check compatibility** - Version info and capabilities
- **Explain git behavior** - Why tasks run or skip based on git changes
- **Answer "why didn't it run?"** - WatchPaths analysis shows exactly which tasks match changed files
- **Analyze performance** - Task performance trends and bottlenecks
- **Track quality** - Test failures and security issues over time

**Usage Example:**
```json
{
  "ignoreWatchPaths": true,
  "failFast": true
}
```

**Natural Language:**
```
"Run devpipe and ignore watch paths"
"Run all tasks regardless of git changes"
```

## Why This Matters

Previously, if you wanted to run all tasks without git-based filtering, you had to:
- Manually modify config files
- Use workarounds with `--since` flags
- Run tasks individually

Now you can simply set `ignoreWatchPaths: true` and run everything!

## Breaking Changes

None - fully backward compatible.

## Migration Guide

### If You're Using devpipe v0.0.8

Upgrade to v0.1.0:
```bash
brew upgrade drewkhoury/tap/devpipe
```

### If You're Using the MCP

Update to the latest version:
```bash
npm install -g devpipe-mcp@latest
```

Or if using npx in your MCP config, it will auto-update on next use.

## Updated Documentation

- README.md - Updated version requirements and examples
- CHANGELOG.md - Full v0.2.2 release notes
- Tool schemas - Added `ignoreWatchPaths` parameter

## What's Next

Future releases may include:
- Additional devpipe v0.1.0+ features as they're released
- Enhanced error handling and debugging tools
- More intelligent task suggestions

## Feedback

Found a bug or have a feature request? 
- [Open an issue](https://github.com/drewkhoury/devpipe-mcp/issues)
- [Start a discussion](https://github.com/drewkhoury/devpipe-mcp/discussions)

---

**Full Changelog:** [v0.2.1...v0.2.2](https://github.com/drewkhoury/devpipe-mcp/compare/v0.2.1...v0.2.2)
