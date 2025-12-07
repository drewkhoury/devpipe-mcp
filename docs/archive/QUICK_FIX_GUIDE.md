# Quick Fix Guide - Config Not Found Error

## The Problem

```
❌ No config.toml file found
```

## The Solution (3 Steps)

### Step 1: Add DEVPIPE_CWD to Your MCP Config

Edit your MCP configuration file and add the `env` section:

```json
{
  "mcpServers": {
    "devpipe": {
      "command": "node",
      "args": ["/Users/drew/repos/devpipe-mcp/dist/index.js"],
      "env": {
        "DEVPIPE_CWD": "/path/to/your/project"
      }
    }
  }
}
```

**Replace `/path/to/your/project`** with the actual path to your project directory.

### Step 2: Restart Your AI Assistant

Close and reopen Windsurf, Claude Desktop, or your AI assistant.

### Step 3: Test It

```
@devpipe tell me about the config
```

## Where is the MCP Config File?

- **Windsurf:** `~/.windsurf/mcp.json` (or check Windsurf settings)
- **Claude Desktop (macOS):** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Claude Desktop (Windows):** `%APPDATA%\Claude\claude_desktop_config.json`
- **Claude Desktop (Linux):** `~/.config/Claude/claude_desktop_config.json`

## What Path Should I Use?

Use the **absolute path** to the directory containing your `config.toml`:

✅ Good: `/Users/drew/projects/my-app`  
❌ Bad: `~/projects/my-app`  
❌ Bad: `./my-app`  
❌ Bad: `/Users/drew/projects/my-app/config.toml` (don't include the filename)

## Still Not Working?

1. **Check the path exists:**
   ```bash
   ls -la /path/to/your/project/config.toml
   ```

2. **Check you restarted your AI assistant**

3. **Check the error message** - it now shows where it's searching

4. **Read the full guide:** `docs/DEVPIPE_CWD.md`

## Multiple Projects?

Set DEVPIPE_CWD to a common parent:

```json
{
  "env": {
    "DEVPIPE_CWD": "/Users/drew/projects"
  }
}
```

Then navigate to the specific project before using devpipe.

---

**Need more help?** See `MCP_FIX_COMPLETE.md` or `docs/DEVPIPE_CWD.md`
