# Devpipe MCP Server - Project Summary

## Overview

The **devpipe-mcp** project is a Model Context Protocol (MCP) server that enables AI assistants like Windsurf/Cascade and Claude to interact with devpipe - a fast, local pipeline runner for development workflows.

## What Was Built

### Core Components

1. **MCP Server Implementation** (`src/index.ts`)
   - 8 MCP tools for interacting with devpipe
   - 4 MCP resources for accessing pipeline data
   - 5 MCP prompts for AI-assisted workflows
   - Full error handling and validation

2. **Utility Functions** (`src/utils.ts`)
   - devpipe installation detection
   - Config file parsing (TOML)
   - Run metadata and log reading
   - Metrics parsing (JUnit, SARIF)
   - Command building and execution

3. **Type Definitions** (`src/types.ts`)
   - Complete TypeScript types for devpipe configs
   - Run metadata and task result types
   - Metrics types (JUnit, SARIF)
   - Tool argument types

### Documentation

1. **README.md** - Main documentation with installation, usage, and API reference
2. **SETUP.md** - Detailed setup guide for different AI assistants
3. **EXAMPLES.md** - 15+ detailed usage examples and workflows
4. **QUICK_REFERENCE.md** - Quick lookup guide for common tasks
5. **CONTRIBUTING.md** - Guidelines for contributors
6. **CHANGELOG.md** - Version history and planned features

### Examples

1. **config.example.toml** - Node.js/TypeScript project example
2. **config.go.toml** - Go project example
3. **config.python.toml** - Python project example

## Features Implemented

### MCP Tools

| Tool | Description |
|------|-------------|
| `check_devpipe` | Check if devpipe is installed and get version |
| `list_tasks` | Parse and list all tasks from config.toml |
| `run_pipeline` | Execute devpipe with full flag support |
| `validate_config` | Validate one or more config files |
| `get_last_run` | Get results from the most recent run |
| `view_run_logs` | Read logs from specific tasks or pipeline |
| `parse_metrics` | Parse JUnit/SARIF metrics files |
| `get_dashboard_data` | Extract data from summary.json |

### MCP Resources

| Resource | Description |
|----------|-------------|
| `devpipe://config` | Current config.toml contents |
| `devpipe://tasks` | All task definitions |
| `devpipe://last-run` | Most recent run results |
| `devpipe://summary` | Aggregated pipeline summary |

### MCP Prompts

| Prompt | Description |
|--------|-------------|
| `analyze-config` | Analyze configuration and suggest improvements |
| `debug-failure` | Help debug why a task failed |
| `optimize-pipeline` | Suggest pipeline optimizations |
| `create-task` | Help create new tasks for technologies |
| `security-review` | Review SARIF security findings |

### Devpipe Integration

Full support for all devpipe features:
- ✅ All CLI flags (--config, --only, --skip, --fast, --dry-run, etc.)
- ✅ Git integration (--since for change-based runs)
- ✅ Phase-based execution
- ✅ Parallel task execution
- ✅ Auto-fix support
- ✅ Metrics parsing (JUnit, SARIF)
- ✅ Dashboard data access
- ✅ Run history and logs

## Project Structure

```
devpipe-mcp/
├── src/
│   ├── index.ts          # Main MCP server (850+ lines)
│   ├── types.ts          # TypeScript type definitions
│   └── utils.ts          # Utility functions
├── dist/                 # Compiled JavaScript output
├── examples/
│   ├── config.example.toml
│   ├── config.go.toml
│   └── config.python.toml
├── node_modules/         # Dependencies
├── package.json          # Project configuration
├── tsconfig.json         # TypeScript configuration
├── .gitignore
├── .npmignore
├── LICENSE               # MIT License
├── README.md             # Main documentation
├── SETUP.md              # Setup guide
├── EXAMPLES.md           # Usage examples
├── QUICK_REFERENCE.md    # Quick reference
├── CONTRIBUTING.md       # Contribution guidelines
├── CHANGELOG.md          # Version history
└── PROJECT_SUMMARY.md    # This file
```

## Technology Stack

- **Language**: TypeScript
- **Runtime**: Node.js 18+
- **MCP SDK**: @modelcontextprotocol/sdk v0.5.0
- **TOML Parser**: @iarna/toml v2.2.5
- **Build Tool**: TypeScript Compiler (tsc)

## Key Design Decisions

1. **TypeScript**: Chosen for type safety and better IDE support
2. **Stdio Transport**: Standard MCP communication method
3. **Async/Await**: Modern async patterns throughout
4. **Error Handling**: Comprehensive try-catch with helpful error messages
5. **Config Discovery**: Automatic search in current and parent directories
6. **Type Safety**: Strong typing for all devpipe structures
7. **Modular Design**: Separated concerns (server, utils, types)

## Use Cases

### For Developers
- Run pre-commit checks without leaving the IDE
- Debug pipeline failures with AI assistance
- Optimize pipeline configurations
- Create new tasks for different technologies
- Review security findings from SARIF reports

### For Teams
- Standardize development workflows
- Share pipeline configurations
- Automate common development tasks
- Integrate with CI/CD pipelines
- Maintain code quality standards

### For AI Assistants
- Provide context about development pipelines
- Help users set up and configure devpipe
- Debug and troubleshoot pipeline issues
- Suggest optimizations and best practices
- Generate task configurations

## Installation Methods

1. **From Source** (current):
   ```bash
   git clone https://github.com/drewkhoury/devpipe-mcp.git
   cd devpipe-mcp
   npm install
   npm run build
   ```

2. **From npm** (when published):
   ```bash
   npm install -g devpipe-mcp
   ```

## Configuration Examples

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

### Claude Desktop
```json
{
  "mcpServers": {
    "devpipe": {
      "command": "devpipe-mcp"
    }
  }
}
```

## Testing

Currently manual testing via:
1. Building the project
2. Configuring in an MCP client
3. Testing each tool with various inputs
4. Verifying error handling

Future: Automated tests planned

## Future Enhancements

Planned features (see CHANGELOG.md):
- Automated test suite
- Proper XML parser for JUnit
- Watch mode for config changes
- Interactive task selection
- Pipeline visualization
- Performance profiling
- Custom output formatters
- CI/CD platform integrations

## Success Metrics

The project successfully:
- ✅ Builds without errors
- ✅ Implements all planned MCP tools
- ✅ Provides comprehensive documentation
- ✅ Includes example configurations
- ✅ Handles errors gracefully
- ✅ Supports all devpipe features
- ✅ Works with multiple AI assistants

## How to Use

1. **Install devpipe**: `brew install drewkhoury/tap/devpipe`
2. **Build the MCP server**: `npm install && npm run build`
3. **Configure your AI assistant** (see SETUP.md)
4. **Start using it**: Ask your AI assistant to interact with devpipe

Example interactions:
- "Show me all tasks in my config"
- "Run devpipe with fast mode"
- "Why did the lint task fail?"
- "Analyze my pipeline configuration"
- "Create a task for running Go tests"

## Contributing

Contributions welcome! See CONTRIBUTING.md for:
- Development setup
- Code style guidelines
- How to add new tools/resources/prompts
- Pull request process

## License

MIT License - See LICENSE file

## Links

- **devpipe**: https://github.com/drewkhoury/devpipe
- **MCP Specification**: https://modelcontextprotocol.io
- **Issues**: https://github.com/drewkhoury/devpipe-mcp/issues

## Credits

- **Author**: Drew Khoury
- **devpipe**: Drew Khoury
- **MCP Protocol**: Anthropic

---

**Version**: 0.1.0  
**Status**: Ready for use  
**Last Updated**: 2024-12-05
