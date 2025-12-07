# Debugging Workspace Context in MCP

## Goal

Determine if Windsurf passes any workspace/project context to the MCP server that we can use instead of DEVPIPE_CWD.

## How to Test

### 1. Enable Debug Mode

Edit your Windsurf MCP configuration to add `DEBUG_MCP=1`:

```json
{
  "mcpServers": {
    "devpipe": {
      "command": "node",
      "args": ["/Users/drew/repos/devpipe-mcp/dist/index.js"],
      "env": {
        "DEBUG_MCP": "1",
        "DEVPIPE_CWD": "/Users/drew/projects/test-project"
      }
    }
  }
}
```

### 2. Restart Windsurf

Close and reopen Windsurf to reload the MCP configuration.

### 3. Trigger an MCP Tool Call

In Windsurf, ask:
```
@devpipe check if devpipe is installed
```

### 4. Check the Logs

**On macOS/Linux:**
```bash
# Windsurf logs location (may vary)
tail -f ~/Library/Logs/Windsurf/main.log
# or
tail -f ~/.windsurf/logs/*.log
```

Look for output like:
```
=== MCP Request Debug ===
Request keys: [...]
Request.params keys: [...]
Full request: {...}
========================
```

## What We're Looking For

Any of these would solve the multi-workspace problem:

### Option 1: Workspace Root in Request
```json
{
  "params": {
    "workspace": "/Users/drew/projects/current-project",
    ...
  }
}
```

### Option 2: Client Info with Workspace
```json
{
  "clientInfo": {
    "name": "Windsurf",
    "workspaceRoot": "/Users/drew/projects/current-project"
  }
}
```

### Option 3: Environment Variables Per Request
If Windsurf sets different env vars for each workspace window's MCP instance.

### Option 4: Working Directory
If `process.cwd()` in the MCP server reflects the workspace directory (unlikely but worth checking).

## Test Script

Run this to see what the MCP server's working directory is:

```bash
DEBUG_MCP=1 node dist/index.js <<EOF
{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"check_devpipe","arguments":{}}}
EOF
```

## Expected Findings

**Most Likely:** MCP protocol doesn't include workspace context (by design for portability).

**If We Find Context:** We can use it instead of DEVPIPE_CWD!

**If No Context:** We need to push for Windsurf to add `${workspaceFolder}` variable support or per-workspace MCP config.

## Next Steps Based on Findings

### If Context Exists
1. Update `findConfigFile()` to check for workspace context
2. Remove DEVPIPE_CWD requirement
3. Update documentation

### If No Context
1. Document the limitation clearly
2. File feature request with Windsurf
3. Propose MCP protocol enhancement
4. Consider alternative approaches (git root detection, etc.)
