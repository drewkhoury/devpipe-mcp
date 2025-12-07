# MCP Server Config Path Fix - Summary

## Problem

The devpipe MCP server was unable to find `config.toml` files when users tried to access resources like `@devpipe`. The error was:

```
Failure reading resource mcp://devpipe with error
failed to read resource mcp://devpipe for server devpipe: 
Failed to read resource: No config.toml file found
```

### Root Cause

The MCP server was searching for `config.toml` starting from its own installation directory (`process.cwd()` of the MCP server process), not from the user's actual project directory. This is because MCP servers run as separate processes and don't automatically inherit the user's working directory context.

## Solution

Implemented a three-part fix:

### 1. Environment Variable Support (`DEVPIPE_CWD`)

**File:** `src/utils.ts`

Added support for a `DEVPIPE_CWD` environment variable that tells the MCP server where to look for config files:

```typescript
export async function findConfigFile(startDir?: string): Promise<string | null> {
  // Use DEVPIPE_CWD if set, otherwise use provided startDir or process.cwd()
  const searchDir = startDir || process.env.DEVPIPE_CWD || process.cwd();
  let currentDir = searchDir;
  // ... rest of search logic
}
```

**Priority order:**
1. Explicit `startDir` parameter (from tool calls)
2. `DEVPIPE_CWD` environment variable
3. `process.cwd()` (fallback)

### 2. Improved Error Messages

**File:** `src/index.ts`

Updated the resource handler to provide actionable error messages:

```typescript
if (!configPath) {
  const searchDir = process.env.DEVPIPE_CWD || process.cwd();
  throw new Error(
    `No config.toml file found in ${searchDir} or parent directories.\n` +
    `Tip: Set DEVPIPE_CWD environment variable to your project directory, ` +
    `or use tool parameters to specify config path.`
  );
}
```

Now users see:
- Where the server is searching
- How to fix the issue (set DEVPIPE_CWD)
- Alternative solution (use explicit config paths)

### 3. Updated Documentation

**Files Updated:**
- `README.md` - Added DEVPIPE_CWD to all configuration examples
- `SETUP.md` - Added DEVPIPE_CWD setup instructions and troubleshooting
- `docs/DEVPIPE_CWD.md` - New comprehensive guide

**Configuration Example:**

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

## Usage

### For Single Project

Set `DEVPIPE_CWD` to your project directory:

```json
{
  "env": {
    "DEVPIPE_CWD": "/Users/you/projects/my-app"
  }
}
```

### For Multiple Projects

**Option 1:** Set to common parent and navigate to specific projects

**Option 2:** Always specify config path in tool calls:
```
"List tasks from /path/to/project/config.toml"
```

### For Monorepos

Set to monorepo root and specify config paths:
```
"Run pipeline with config /monorepo/services/api/config.toml"
```

## Testing

To test the fix:

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Update your MCP configuration** with DEVPIPE_CWD

3. **Restart your AI assistant** (Windsurf, Claude, etc.)

4. **Test resource access:**
   ```
   @devpipe tell me about the config
   ```

5. **Verify it works:**
   - Should now successfully read the config
   - Should show config contents or task list
   - No more "config.toml file not found" errors

## Benefits

1. **Works out of the box** - Set once in MCP config, works for all sessions
2. **Flexible** - Supports single project, multi-project, and monorepo workflows
3. **Clear errors** - Users know exactly what's wrong and how to fix it
4. **Backward compatible** - Existing explicit config paths still work
5. **No breaking changes** - Falls back to original behavior if DEVPIPE_CWD not set

## Files Changed

- `src/utils.ts` - Added DEVPIPE_CWD support to `findConfigFile()`
- `src/index.ts` - Improved error messages in resource handler
- `README.md` - Added DEVPIPE_CWD to configuration examples
- `SETUP.md` - Added DEVPIPE_CWD setup and troubleshooting
- `docs/DEVPIPE_CWD.md` - New comprehensive guide (created)
- `docs/FIX_SUMMARY.md` - This file (created)

## Next Steps

1. **Update version** - Consider bumping to v0.2.2 for this fix
2. **Test thoroughly** - Verify with different project structures
3. **Update CHANGELOG** - Document this fix
4. **Consider publishing** - Push to npm if this is a public package
