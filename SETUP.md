# Setup Guide for Devpipe MCP Server

This guide will walk you through setting up the devpipe MCP server with your AI assistant.

## Prerequisites

Before you begin, ensure you have:

1. **Node.js 18+** installed
   ```bash
   node --version  # Should be 18.0.0 or higher
   ```

2. **devpipe** installed
   ```bash
   # Install devpipe
   brew install drewkhoury/tap/devpipe
   
   # Verify installation
   devpipe --version
   ```

3. **A devpipe project** with a `config.toml` file
   - If you don't have one, devpipe will auto-generate a basic config when you first run it
   - Or see configuration guide: https://github.com/drewkhoury/devpipe#configuration

## Installation

### Step 1: Install the MCP Server

Choose one of these methods:

#### Method A: Install from npm (recommended)

```bash
npm install -g devpipe-mcp
```

#### Method B: Install from source

```bash
# Clone the repository
git clone https://github.com/drewkhoury/devpipe-mcp.git
cd devpipe-mcp

# Install dependencies and build
npm install
npm run build

# Link globally (optional, for command-line access)
npm link
```

### Step 2: Configure Your AI Assistant

#### For Windsurf/Cascade

1. **Locate your MCP settings file**
   - Usually at `~/.windsurf/mcp.json` or similar
   - Or check Windsurf settings for MCP configuration location

2. **Add the devpipe MCP server**
   
   If you installed from source:
   ```json
   {
     "mcpServers": {
       "devpipe": {
         "command": "node",
         "args": ["/path/to/devpipe-mcp/dist/index.js"],
         "env": {
           "DEVPIPE_CWD": "/path/to/your/project"
         }
       }
     }
   }
   ```
   
   If you installed globally via npm:
   ```json
   {
     "mcpServers": {
       "devpipe": {
         "command": "devpipe-mcp",
         "env": {
           "DEVPIPE_CWD": "/path/to/your/project"
         }
       }
     }
   }
   ```
   
   **Note:** The `DEVPIPE_CWD` environment variable is optional but recommended. It tells the MCP server where to look for your `config.toml` file. Without it, the server will search from its own installation directory.

3. **Restart Windsurf** to load the new MCP server

#### For Claude Desktop

1. **Locate the config file**
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - Linux: `~/.config/Claude/claude_desktop_config.json`

2. **Add the devpipe MCP server**
   
   If you installed from source:
   ```json
   {
     "mcpServers": {
       "devpipe": {
         "command": "node",
         "args": ["/path/to/devpipe-mcp/dist/index.js"],
         "env": {
           "DEVPIPE_CWD": "/path/to/your/project"
         }
       }
     }
   }
   ```
   
   If you installed globally:
   ```json
   {
     "mcpServers": {
       "devpipe": {
         "command": "devpipe-mcp",
         "env": {
           "DEVPIPE_CWD": "/path/to/your/project"
         }
       }
     }
   }
   ```
   
   **Note:** The `DEVPIPE_CWD` environment variable is optional but recommended. It tells the MCP server where to look for your `config.toml` file.

3. **Restart Claude Desktop**

#### For Other MCP Clients

The server runs on stdio, so you can connect it using:

```bash
node /path/to/devpipe-mcp/dist/index.js
```

Or if installed globally:

```bash
devpipe-mcp
```

## Verification

### Test the Installation

1. **Open your AI assistant** (Windsurf, Claude Desktop, etc.)

2. **Ask a simple question** to verify the MCP server is working:
   ```
   "Is devpipe installed on this system?"
   ```
   
   The assistant should use the `check_devpipe` tool and report the installation status.

3. **Try listing tasks** from a config file:
   ```
   "Show me the tasks in my devpipe configuration"
   ```
   
   Navigate to a directory with a `config.toml` file first.

### Troubleshooting

#### MCP Server Not Found

If the AI assistant can't find the devpipe MCP server:

1. **Check the path** in your MCP configuration
2. **Verify the build** completed successfully:
   ```bash
   ls -la /path/to/devpipe-mcp/dist/index.js
   ```
3. **Check permissions**:
   ```bash
   chmod +x /path/to/devpipe-mcp/dist/index.js
   ```
4. **Restart your AI assistant**

#### devpipe Command Not Found

If the MCP server reports "devpipe not found":

1. **Install devpipe**:
   ```bash
   brew install drewkhoury/tap/devpipe
   ```

2. **Verify it's in PATH**:
   ```bash
   which devpipe
   devpipe --version
   ```

3. **Add to PATH** if needed (add to `~/.zshrc` or `~/.bashrc`):
   ```bash
   export PATH="/usr/local/bin:$PATH"
   ```

#### Config File Not Found

If you get "No config.toml file found":

1. **Set the DEVPIPE_CWD environment variable** in your MCP configuration (recommended):
   ```json
   {
     "mcpServers": {
       "devpipe": {
         "command": "node",
         "args": ["/path/to/devpipe-mcp/dist/index.js"],
         "env": {
           "DEVPIPE_CWD": "/path/to/your/project"
         }
       }
     }
   }
   ```
   Then restart your AI assistant.

2. **Navigate to a project** with a `config.toml` file

3. **Create a config file** using examples:
   ```bash
   cp /path/to/devpipe-mcp/examples/config.example.toml ./config.toml
   ```

4. **Specify the path explicitly** in tool calls:
   ```
   "List tasks from /path/to/config.toml"
   ```

## Quick Start Example

Once everything is set up, try this workflow:

1. **Navigate to a project** with a `config.toml` file

2. **Ask your AI assistant**:
   ```
   "Analyze my devpipe configuration and suggest improvements"
   ```

3. **Run the pipeline**:
   ```
   "Run my devpipe pipeline with fast mode"
   ```

4. **Check results**:
   ```
   "Show me the results from the last run"
   ```

5. **Debug if needed**:
   ```
   "Why did the lint task fail?"
   ```

## Example Projects

To test the MCP server, you can use the example configurations:

### Node.js/TypeScript Project

```bash
# Copy example config
cp examples/config.example.toml ./config.toml

# Edit to match your project structure
# Then ask your AI assistant to analyze it
```

### Go Project

```bash
cp examples/config.go.toml ./config.toml
# Customize for your Go project
```

### Python Project

```bash
cp examples/config.python.toml ./config.toml
# Customize for your Python project
```

## Next Steps

- Read [EXAMPLES.md](./EXAMPLES.md) for detailed usage examples
- Review [README.md](./README.md) for complete documentation
- Check [CONTRIBUTING.md](./CONTRIBUTING.md) if you want to contribute

## Getting Help

If you encounter issues:

1. **Check the logs** from your AI assistant
2. **Verify devpipe works** independently:
   ```bash
   devpipe --help
   devpipe validate config.toml
   ```
3. **Open an issue** on GitHub with:
   - Your OS and Node.js version
   - Your MCP configuration
   - Error messages or logs
   - Steps to reproduce

## Advanced Configuration

### Custom Working Directory

You can specify a custom working directory in your MCP configuration:

```json
{
  "mcpServers": {
    "devpipe": {
      "command": "node",
      "args": ["/path/to/devpipe-mcp/dist/index.js"],
      "cwd": "/path/to/your/project"
    }
  }
}
```

### Environment Variables

Pass environment variables to the MCP server:

```json
{
  "mcpServers": {
    "devpipe": {
      "command": "node",
      "args": ["/path/to/devpipe-mcp/dist/index.js"],
      "env": {
        "DEVPIPE_CONFIG": "/custom/path/config.toml"
      }
    }
  }
}
```

### Multiple Configurations

You can configure multiple instances for different projects:

```json
{
  "mcpServers": {
    "devpipe-project-a": {
      "command": "node",
      "args": ["/path/to/devpipe-mcp/dist/index.js"],
      "cwd": "/path/to/project-a"
    },
    "devpipe-project-b": {
      "command": "node",
      "args": ["/path/to/devpipe-mcp/dist/index.js"],
      "cwd": "/path/to/project-b"
    }
  }
}
```

## Success!

You're now ready to use the devpipe MCP server with your AI assistant. Try asking it to help you with your development workflows!
