# Initialize Request Logging

## Overview

Added logging to capture the raw initialization payload received from Windsurf (or any MCP client) to help debug workspace detection issues.

## What Was Added

### Code Changes

In `src/index.ts`, added:

1. **Import**: Added `InitializeRequestSchema` to the imports from `@modelcontextprotocol/sdk/types.js`

2. **Initialize Handler**: Added a request handler that logs the complete initialization payload and specifically checks for workspace-related parameters:
   - `params.roots`
   - `params.workspaceFolders`
   - `params.rootUri`
   - `params.rootPath`
   - `params.processId`
   - `params.clientInfo`

### Log Output

When the MCP server initializes, it will output to stderr:

```
=== MCP Initialize Request ===
Full request: <complete JSON payload>
Request keys: <top-level keys>
Request.params keys: <parameter keys>

=== Workspace Parameter Check ===
params.roots: <value or undefined>
params.workspaceFolders: <value or undefined>
params.rootUri: <value or undefined>
params.rootPath: <value or undefined>
params.processId: <value or undefined>
params.clientInfo: <value or undefined>
================================
```

## How to Test

### Option 1: Using MCP Inspector

```bash
# Build the project
make build

# Run with MCP Inspector
make test-inspector
```

### Option 2: Using Windsurf

1. Rebuild the MCP server:
   ```bash
   make build
   ```

2. Restart Windsurf or reload the MCP server configuration

3. Check the MCP server logs in Windsurf:
   - Look for the initialization logs in the MCP output panel
   - The logs will show what parameters Windsurf sends during initialization

### Option 3: Direct Testing with Node

```bash
# Build first
make build

# Run the server directly (it will wait for MCP protocol messages on stdin)
node dist/index.js
```

## Expected Results

The logs will confirm whether any of these workspace-related parameters exist:
- ✅ If present: The parameter name will show its value
- ❌ If absent: The parameter will show `undefined`

## Next Steps

Based on the logged values:

1. **If `params.rootUri` or `params.workspaceFolders` exist**: We can use these to automatically detect the workspace directory
2. **If none exist**: We'll need to rely on the `DEVPIPE_CWD` environment variable or tool parameters
3. **If `params.clientInfo` exists**: We can identify the client (Windsurf) and potentially handle it differently

## Related Files

- `src/index.ts` - Main server file with initialization handler
- `src/utils.ts` - Utility functions including `findConfigFile()`
- `docs/TEST_WHAT_DIRECTORY.md` - Documentation about directory detection issues
