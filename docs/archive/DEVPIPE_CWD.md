# DEVPIPE_CWD Environment Variable

## Overview

The `DEVPIPE_CWD` environment variable tells the devpipe MCP server where to look for your project's `config.toml` file.

## ⚠️ Known Limitation

**DEVPIPE_CWD is a global setting** - it applies to all Windsurf windows. If you work with multiple projects simultaneously in different windows, this approach has limitations:

- All windows share the same DEVPIPE_CWD value
- The MCP server can't distinguish between different workspace contexts
- You'll need to use explicit config paths when working across multiple projects

**Better solutions** (require Windsurf/MCP protocol changes):
- Per-workspace MCP configuration
- Dynamic variable substitution like `${workspaceFolder}`
- MCP protocol enhancement to pass workspace context

See "Multiple Projects" section below for current workarounds.

## Why is this needed?

When an MCP server runs, it operates from its own installation directory, not your project directory. Without `DEVPIPE_CWD`, the server would search for `config.toml` starting from where it's installed (e.g., `/Users/you/repos/devpipe-mcp`), which is usually not where your project files are located.

## How to set it

### In Windsurf/Cascade

Edit your MCP configuration file (usually `~/.windsurf/mcp.json`):

```json
{
  "mcpServers": {
    "devpipe": {
      "command": "devpipe-mcp",
      "env": {
        "DEVPIPE_CWD": "/Users/you/projects/my-go-app"
      }
    }
  }
}
```

### In Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "devpipe": {
      "command": "devpipe-mcp",
      "env": {
        "DEVPIPE_CWD": "/Users/you/projects/my-go-app"
      }
    }
  }
}
```

### From Command Line

If running the MCP server directly:

```bash
DEVPIPE_CWD=/path/to/your/project devpipe-mcp
```

## Behavior

1. **With DEVPIPE_CWD set:** The server searches for `config.toml` starting from the specified directory and walks up parent directories until it finds one.

2. **Without DEVPIPE_CWD:** The server searches starting from its own installation directory (`process.cwd()`).

3. **With explicit config path in tool calls:** You can always override by specifying the config path directly in tool parameters (e.g., `config: "/path/to/config.toml"`).

## Examples

### Single Project Setup

If you work on one project at a time:

```json
{
  "mcpServers": {
    "devpipe": {
      "command": "devpipe-mcp",
      "env": {
        "DEVPIPE_CWD": "/Users/you/projects/my-app"
      }
    }
  }
}
```

### Multiple Projects (⚠️ Limitations Apply)

**The Problem:** DEVPIPE_CWD is global and can't be different per window/workspace.

**Current Workarounds:**

**Option 1: Set to your primary project**
```json
{
  "env": {
    "DEVPIPE_CWD": "/Users/you/projects/main-project"
  }
}
```
Use explicit paths for other projects: `"List tasks from /Users/you/projects/other-project/config.toml"`

**Option 2: Set to common parent directory**
```json
{
  "env": {
    "DEVPIPE_CWD": "/Users/you/projects"
  }
}
```
Always specify which project: `"Run devpipe in /Users/you/projects/my-app"`

**Option 3: Change DEVPIPE_CWD as you switch focus**
- Edit MCP config to point to current project
- Restart Windsurf
- Not practical for frequent switching

**What We Really Need:** Per-workspace MCP configuration or `${workspaceFolder}` variable support in Windsurf.

### Monorepo Setup

For monorepos with multiple `config.toml` files:

```json
{
  "env": {
    "DEVPIPE_CWD": "/Users/you/monorepo"
  }
}
```

Then specify the exact config when needed:
- "List tasks from /Users/you/monorepo/services/api/config.toml"
- "Run pipeline with config /Users/you/monorepo/services/web/config.toml"

## Troubleshooting

### Error: "No config.toml file found"

This means the server couldn't find a config file. Check:

1. **Is DEVPIPE_CWD set correctly?**
   - The path should point to your project directory or a parent directory
   - Use absolute paths, not relative paths
   - Ensure the directory exists

2. **Does config.toml exist?**
   ```bash
   ls -la /path/to/your/project/config.toml
   ```

3. **Did you restart your AI assistant?**
   - Changes to MCP configuration require a restart

### Verifying the Setting

Ask your AI assistant:
```
"What directory is the devpipe MCP server searching from?"
```

The error message will show the search directory if no config is found.

## Best Practices

1. **Use absolute paths** - Always use full paths like `/Users/you/projects/my-app`, not relative paths like `~/projects/my-app`

2. **Set to project root** - Point to the directory containing your `config.toml`, not to the config file itself

3. **Restart after changes** - Always restart your AI assistant after modifying MCP configuration

4. **One project at a time** - If you frequently switch projects, consider setting DEVPIPE_CWD to the project you're currently working on

5. **Use explicit paths for multi-project work** - When working with multiple projects simultaneously, use the `config` parameter in tool calls to specify which config to use
