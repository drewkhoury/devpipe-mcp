# Test: What Directory Is the MCP Server Actually Using?

## Enable Debug Mode

1. **Edit your Windsurf MCP config** to add `DEBUG_MCP=1`:

```json
{
  "mcpServers": {
    "devpipe": {
      "command": "node",
      "args": ["/Users/drew/repos/devpipe-mcp/dist/index.js"],
      "env": {
        "DEBUG_MCP": "1"
      }
    }
  }
}
```

2. **Restart Windsurf**

3. **Trigger an MCP call:**
```
@devpipe show me the last run
```

4. **Check Windsurf logs** (location varies):
   - Look for output like:
   ```
   === findConfigFile Debug ===
   startDir: undefined
   DEVPIPE_CWD: undefined
   process.cwd(): /Applications/Windsurf.app/...
   searchDir (chosen): /Applications/Windsurf.app/...
   ===========================
   ```

## What You'll Learn

The debug output will show:
- **`startDir`**: If the AI passed an explicit path (usually undefined)
- **`DEVPIPE_CWD`**: Your environment variable (if set)
- **`process.cwd()`**: Where the MCP server is actually running from
- **`searchDir (chosen)`**: Which one it's using

## Expected Results

### If DEVPIPE_CWD is NOT set:
```
process.cwd(): /Applications/Windsurf.app/Contents/...
searchDir (chosen): /Applications/Windsurf.app/Contents/...
```
❌ Won't find your project's config.toml

### If DEVPIPE_CWD IS set:
```
DEVPIPE_CWD: /Users/drew/projects/my-app
searchDir (chosen): /Users/drew/projects/my-app
```
✅ Will find your project's config.toml

### If AI passes explicit path:
```
startDir: /Users/drew/projects/my-app
searchDir (chosen): /Users/drew/projects/my-app
```
✅ Will find your project's config.toml

## Why It Might "Work" Without DEVPIPE_CWD

If you're getting results without setting DEVPIPE_CWD, it's probably because:

1. **The AI is passing explicit paths** (check if `startDir` is set in debug output)
2. **Lucky directory structure** (process.cwd() happens to be a parent of your project)
3. **You did set DEVPIPE_CWD** and forgot

## Disable Debug Mode

Remove `DEBUG_MCP` from your config when done testing.
