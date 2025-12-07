# devpipe v0.0.8 Compatibility Updates

## Summary

Updated devpipe-mcp to v0.2.1 with full compatibility for devpipe v0.0.8, including corrected default values and phase header behavior.

## Key Changes in devpipe v0.0.8

### 1. Default Value Changes
| Setting | Old Value | New Value (v0.0.8) | Impact |
|---------|-----------|-------------------|--------|
| `fastThreshold` | 5000ms | **300 seconds** | Much more reasonable threshold! |
| `animationRefreshMs` | 100ms | **500ms** | Smoother dashboard updates |
| `defaults.git.ref` | "main" | **"HEAD"** | Better default for git comparisons |

### 2. Task Defaults
- Added `workdir = "."` to task_defaults
- `fixType` has no default value (commented out in generated configs)

### 3. Phase Headers
- Confirmed: **NO required fields** for phase headers
- Both `name` and `desc` are optional
- Phase headers are purely organizational markers

### 4. Documentation Improvements
- v0.0.8 includes improved documentation and schema generation
- Better examples and configuration reference
- Note: devpipe has always auto-generated config.toml when missing (not new to v0.0.8)

## MCP Updates (v0.2.1)

### Changed Files

1. **`src/utils.ts`**
   - Updated `createConfig()` defaults:
     - `fastThreshold: 300` (seconds, not 5000ms!)
     - `animationRefreshMs: 500`
     - Added `workdir: "."`
     - Commented out `fixType` default
     - Changed git ref from "main" to "HEAD"
   - Updated `generatePhaseHeader()` to reflect optional fields

2. **`README.md`**
   - Added version requirement: devpipe v0.0.8+
   - Updated all default value examples
   - Added notes about v0.0.8 compatibility
   - Updated `create_config` documentation

3. **`CHANGELOG.md`**
   - Added v0.2.1 entry with all changes
   - Added v0.2.0 entry (was missing)

4. **`package.json` & `src/index.ts`**
   - Bumped version to 0.2.1

## Testing

### Build Status
✅ TypeScript compilation successful
✅ No errors or warnings

### Generated Config Test
```bash
node -e "
const { createConfig } = require('./dist/utils.js');
createConfig('/Users/drew/repos/devpipe').then(config => {
  console.log(config);
});
"
```

**Output shows correct defaults:**
```toml
[defaults]
outputRoot = ".devpipe"
fastThreshold = 300  # Tasks over 300s are skipped with --fast
uiMode = "basic"     # Options: basic, full
animationRefreshMs = 500
animatedGroupBy = "phase"  # Options: phase, type

[defaults.git]
mode = "staged_unstaged"  # Options: staged, staged_unstaged, ref
# ref = "HEAD"  # Uncomment to compare against a specific ref

[task_defaults]
enabled = true
workdir = "."
# fixType = "helper"  # Options: auto, helper, none
```

## Breaking Changes

**None** - All changes are backward compatible. The MCP now generates configs that match devpipe v0.0.8 defaults, but still works with older devpipe versions.

## Migration Guide

### For Users

1. **Update devpipe:**
   ```bash
   brew upgrade drewkhoury/tap/devpipe
   ```

2. **Rebuild MCP:**
   ```bash
   cd /Users/drew/repos/devpipe-mcp
   make build
   ```

3. **Reload Windsurf MCP** (if using Windsurf)

### For Existing Configs

No changes needed! Your existing config.toml files will continue to work. The updates only affect newly generated configs.

## What's Different in Generated Configs

### Before (v0.2.0)
```toml
fastThreshold = 5000  # Tasks over 5s are skipped with --fast
animationRefreshMs = 100
# ref = "main"

[task_defaults]
enabled = true
fixType = "helper"
```

### After (v0.2.1)
```toml
fastThreshold = 300  # Tasks over 300s are skipped with --fast
animationRefreshMs = 500
# ref = "HEAD"

[task_defaults]
enabled = true
workdir = "."
# fixType = "helper"  # Options: auto, helper, none
```

## Documentation Updates

- ✅ README.md - Added v0.0.8 requirement and notes
- ✅ CHANGELOG.md - Added v0.2.1 and v0.2.0 entries
- ✅ Tool descriptions - Updated to reflect v0.0.8 compatibility
- ✅ Examples - All use v0.0.8 defaults

## Next Steps

1. ✅ Build and test - **Complete**
2. ⏳ Reload Windsurf MCP
3. ⏳ Test with real projects
4. ⏳ Consider adding `autoGenerateConfig` as an MCP tool

## References

- [devpipe v0.0.8 README](https://raw.githubusercontent.com/drewkhoury/devpipe/refs/heads/main/README.md)
- [devpipe configuration docs](https://raw.githubusercontent.com/drewkhoury/devpipe/refs/heads/main/docs/configuration.md)
- [devpipe config.example.toml](https://raw.githubusercontent.com/drewkhoury/devpipe/refs/heads/main/config.example.toml)
- [devpipe config.schema.json](https://raw.githubusercontent.com/drewkhoury/devpipe/refs/heads/main/config.schema.json)

---

**Status:** ✅ Complete and Ready for Use
**Version:** 0.2.1
**Date:** December 7, 2024
**Compatibility:** devpipe v0.0.8+
