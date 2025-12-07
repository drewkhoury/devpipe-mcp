# Workspace Context Findings

## Summary

**The MCP server does NOT receive workspace context from the IDE.** This is a known limitation across all MCP implementations (VS Code, Windsurf, Cline, etc.).

## What We Discovered

### 1. The Problem is Universal

From GitHub discussions and issues:

- **Cline/VSCode**: [Discussion #2635](https://github.com/cline/cline/discussions/2635) - Same problem
- **VS Code**: [Issue #251263](https://github.com/microsoft/vscode/issues/251263) - Feature request for `${workspaceFolder}`
- **Multiple developers** reporting the same issue across different IDEs

### 2. Current State

**MCP servers receive:**
- Tool call parameters
- Resource URIs
- Prompt arguments

**MCP servers do NOT receive:**
- Workspace root directory
- Active file path
- Project context
- Working directory

### 3. Why This Happens

**By Design:**
- MCP protocol is IDE-agnostic
- Servers run as separate processes
- Communication is via stdio only
- No shared memory or direct IDE API access

**Security:**
- Sandboxed for safety
- Can't access arbitrary file system locations
- Explicit configuration required

## Attempted Solutions by Others

### Solution 1: Environment Variables (What We Did)

```json
{
  "env": {
    "DEVPIPE_CWD": "/path/to/project"
  }
}
```

**Problem:** Global setting, doesn't work per-window

### Solution 2: Pass as Tool Parameter

Some MCP servers [add workspace path as a tool parameter](https://github.com/srigi/mcp-google-images-search/blob/1a756a02223558d103c4876f32b3e515c859b586/src/tools/persist_image/index.ts):

```typescript
{
  name: "save_file",
  parameters: {
    workspacePath: string,  // AI must provide this
    filename: string,
    content: string
  }
}
```

**Problem:** 
- Burdens the AI to know the workspace path
- Adds complexity to every tool call
- Not elegant

### Solution 3: Check Environment Variables

Some IDEs set environment variables:
- VS Code: `VSCODE_CWD` (sometimes)
- Cline: `WORKSPACE_FOLDER_PATHS` (proposed, not implemented)

**Problem:** Not standardized, unreliable

## What's Needed

### Short-term: Variable Substitution in IDE

IDEs should support `${workspaceFolder}` in MCP configuration:

```json
{
  "mcpServers": {
    "devpipe": {
      "command": "devpipe-mcp",
      "env": {
        "DEVPIPE_CWD": "${workspaceFolder}"
      }
    }
  }
}
```

**Status:**
- VS Code: [Feature requested](https://github.com/microsoft/vscode/issues/251263)
- Windsurf: Not yet requested
- Cline: [Under discussion](https://github.com/cline/cline/discussions/2635)

### Long-term: MCP Protocol Enhancement

Add workspace context to MCP protocol:

```typescript
interface MCPRequest {
  method: string;
  params: any;
  context?: {  // NEW
    workspaceRoot: string;
    activeFile?: string;
    projectName?: string;
  }
}
```

**Status:** Would require MCP spec change

## Our Options

### Option 1: Accept Current Limitation ✅ (Recommended)

**What we've done:**
- Implemented `DEVPIPE_CWD` support
- Documented the limitation clearly
- Provided workarounds

**For users:**
- Set `DEVPIPE_CWD` to primary project
- Use explicit config paths for other projects
- Accept it's not perfect for multi-window workflows

### Option 2: File Feature Requests

**Windsurf:**
- Request `${workspaceFolder}` variable support
- Request per-workspace MCP configuration

**MCP Protocol:**
- Propose workspace context in protocol spec

### Option 3: Smart Heuristics (Fragile)

Try to detect workspace automatically:
- Git root detection
- Search common project locations
- Use `process.cwd()` and hope

**Problem:** Unreliable, could find wrong config

### Option 4: Tool Parameter Approach (Burdensome)

Add `workspacePath` parameter to every tool:

```typescript
mcp1_list_tasks({
  workspacePath: "/Users/drew/project",
  config: "config.toml"
})
```

**Problem:** AI must know the path (circular problem)

## Recommendation

**For Now:**
1. ✅ Keep `DEVPIPE_CWD` implementation
2. ✅ Document limitations clearly
3. ✅ Provide workarounds for multi-project use
4. ⏭️ File feature request with Windsurf for `${workspaceFolder}`
5. ⏭️ Wait for IDE/protocol improvements

**Future:**
- Monitor VS Code issue #251263
- If VS Code implements it, Windsurf likely will too
- Update our docs when better solutions become available

## What to Tell Users

**Single Project:** Works great with `DEVPIPE_CWD`

**Multiple Projects:** 
- Set `DEVPIPE_CWD` to primary project
- Use explicit paths for others: `"List tasks from /path/to/other/project/config.toml"`
- This is a limitation of MCP, not our server

**Best Case Scenario (Future):**
```json
{
  "env": {
    "DEVPIPE_CWD": "${workspaceFolder}"  // When supported
  }
}
```

Each window would automatically get its own workspace path.

## Related Links

- [Cline Discussion #2635](https://github.com/cline/cline/discussions/2635)
- [VS Code Issue #251263](https://github.com/microsoft/vscode/issues/251263)
- [VS Code Issue #245905](https://github.com/microsoft/vscode/issues/245905)
