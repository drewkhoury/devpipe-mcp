# devpipe-mcp Roadmap

## v0.2.2 (Current) ✅
- 28 resources (complete documentation + intelligence)
- 18 tools (full devpipe lifecycle)
- 6 prompts (common workflows)
- Intelligence features: flakiness, performance regressions, change correlation
- **NEW:** Pipeline health scoring

## v0.3.0 - Advanced Analytics

### High Priority

#### 1. `compare_runs` Tool ✅ DONE (v0.2.2)
**Purpose:** Compare two pipeline runs to identify changes

**Use case:**
```
compare_runs --run1 latest --run2 previous

Output:
- New failures: go-lint, security-scan
- Performance regressions: unit-tests (+50%)
- Fixed tasks: integration-tests
- Performance improvements: build (-20%)
```

**Implementation:** ✅ Complete
- Diff two run.json files
- Compare task results, durations, metrics
- Identify regressions and improvements
- Support "latest" and "previous" shortcuts

**Effort:** Low (2-3 hours) - COMPLETED

#### 2. `predict_impact` Tool ✅ DONE (v0.2.2)
**Purpose:** Predict which tasks will fail based on changed files

**Use case:**
```
predict_impact

Output:
- Critical risk: integration-tests (score: 85)
  - 3 changed files match watchPaths
  - High correlation with past failures
  - 40% recent failure rate
- Recommendation: Run high-risk tasks first: integration-tests,security-scan
- Suggested command: devpipe --only integration-tests,security-scan
```

**Implementation:** ✅ Complete
- Multi-factor risk scoring (watchPaths, correlation, failure rate)
- Risk levels: critical (70+), high (50+), medium (30+), low
- Actionable recommendations with suggested commands
- Uses existing intelligence data

**Effort:** Medium (4-5 hours) - COMPLETED

### Medium Priority

#### 3. Enhanced `diagnose_failure` ⭐⭐⭐
**Purpose:** Deep failure analysis with pattern matching

**Note:** LLMs already do basic diagnosis. This would add:
- Known error pattern database
- Historical fix suggestions
- Automated log parsing

**Use case:**
```
diagnose_failure --task go-build

Output:
- Error type: missing_import
- Affected file: main.go:42
- Similar past failures: 2 (both fixed by adding imports)
- Suggested fix: Add import "github.com/myproject/database"
```

**Implementation:**
- Build error pattern library
- Match current errors to patterns
- Query historical fixes

**Effort:** High (8-10 hours)

#### 4. `prioritize_tasks` Tool ⭐⭐⭐
**Purpose:** Optimize task execution order for fast feedback

**Use case:**
```
prioritize_tasks

Output:
1. go-fmt (30s, 95% failure detection)
2. go-vet (45s, 90% failure detection)
3. unit-tests (2m, 85% failure detection)
...
10. e2e-tests (10m, 60% failure detection)

Recommendation: Run tasks 1-5 first (3.5m, 92% coverage)
```

**Implementation:**
- Risk scoring algorithm
- Time vs value optimization
- Dependency-aware ordering

**Effort:** High (6-8 hours)

### Low Priority

#### 5. `get_intelligent_context` ⭐⭐
**Purpose:** Synthesize all data for debugging

**Note:** LLMs already do this naturally. Only add if we want pre-computed summaries.

**Effort:** Medium (3-4 hours)

## v0.4.0 - Devpipe Evolution Support

### When devpipe renames fields

**Planned changes:**
- `metricsFormat` → `outputType`
- `metricsPath` → `outputPath`
- `artifacts/` → `outputs/`

**MCP updates needed:**
1. Update `configure-metrics` prompt
2. Update type definitions
3. Add backward compatibility layer
4. Update all documentation

**Effort:** Low (1-2 hours)

## Future Considerations

### Machine Learning Features
- Failure prediction models
- Optimal test selection
- Anomaly detection

**Blocker:** Need more data and ML infrastructure

### Real-time Monitoring
- WebSocket support for live updates
- Streaming task output
- Progress notifications

**Blocker:** MCP protocol limitations

### Team Analytics
- Multi-user failure patterns
- Team velocity metrics
- Collaboration insights

**Blocker:** Requires team/org context

## Implementation Strategy

### Phase 1: Quick Wins (v0.3.0)
1. ✅ `get_pipeline_health` (DONE in v0.2.2)
2. `compare_runs` (2-3 hours)
3. `predict_impact` (4-5 hours)

**Total:** 1 week

### Phase 2: Advanced Features (v0.3.1)
4. Enhanced `diagnose_failure` (8-10 hours)
5. `prioritize_tasks` (6-8 hours)

**Total:** 2 weeks

### Phase 3: Maintenance (v0.4.0)
- Devpipe field rename support
- Documentation updates
- Bug fixes

**Total:** Ongoing

## Decision Criteria

**Implement if:**
- ✅ Uses existing data (no new data sources)
- ✅ Provides value LLMs can't replicate
- ✅ Solves common pain points
- ✅ Low maintenance burden

**Defer if:**
- ❌ Duplicates LLM capabilities
- ❌ Requires ML infrastructure
- ❌ Niche use case
- ❌ High complexity

## Community Input

Want a feature prioritized? Open an issue with:
- Use case description
- Expected output format
- Why LLMs can't do it already
