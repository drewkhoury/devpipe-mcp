# How to Prompt the Devpipe MCP Server

This guide explains how to effectively use natural language to interact with the devpipe MCP server through your AI assistant.

## 🎯 The Key Principle

**Always specify which project you want to work with in your prompt.**

The MCP server doesn't automatically know which project you're working on. You need to tell it by:
1. Referring to "this project" or "this repo" (uses your current workspace)
2. Using a project name that the AI can infer
3. Providing an explicit absolute path

## ✅ Good Prompts

### Using "this project" or "this repo"
```
"Analyze this project"
"Run devpipe in this repo"
"Show me the tasks in this project"
"What technologies are in this repo?"
```

### Using Project Names
```
"Analyze the devpipe project"
"Run tests in my go-app"
"List tasks from the people project"
```

### Using Explicit Paths
```
"Analyze /Users/you/projects/my-app"
"Run devpipe in /Users/you/projects/go-service"
"Show tasks from /Users/you/projects/web-app/config.toml"
"What's in /Users/you/repos/devpipe?"
```

### Working with Multiple Projects
```
"Analyze /Users/you/projects/project-a"
"Now run devpipe in /Users/you/projects/project-b"
"Compare tasks between this project and /Users/you/projects/other-project"
```

## ❌ Vague Prompts (May Not Work)

```
"Analyze the project"  # Which project?
"Run devpipe"          # Where?
"Show me the tasks"    # From which config?
```

**Note:** These might work if the AI can infer context from your workspace or conversation history, but it's better to be explicit.

## 📋 Common Patterns

### Analyzing Projects
```
"Analyze this project"
"What technologies are in /Users/you/projects/new-app?"
"Detect technologies in this repo"
"Scan /path/to/project for devpipe tasks"
```

### Listing Tasks
```
"Show me all tasks in this project"
"List tasks from /Users/you/projects/my-app/config.toml"
"What tasks are configured in the devpipe project?"
```

### Running Pipelines
```
"Run devpipe in this project"
"Execute the pipeline for /Users/you/projects/my-app"
"Run only lint and test tasks in this repo"
"Run devpipe with --fast in /Users/you/projects/go-service"
```

### Debugging
```
"Why did the lint task fail in this project?"
"Show me logs from /Users/you/projects/my-app"
"What went wrong in the last run?"
```

### Creating Configs
```
"Create a devpipe config for this project"
"Generate a config for /Users/you/projects/new-app"
"Bootstrap devpipe in this repo"
```

### Generating Tasks
```
"Create a Go linting task"
"Generate a Python unit test task"
"Help me add a TypeScript type check"
```

## 🔧 How It Works

When you say:
> "Analyze the project at /Users/you/repos/devpipe"

The AI assistant:
1. Understands you want to analyze a project
2. Extracts the path `/Users/you/repos/devpipe`
3. Calls the MCP tool `analyze_project` with `projectPath: "/Users/you/repos/devpipe"`
4. Returns the results in a readable format

**You never need to know:**
- Tool names (`analyze_project`, `list_tasks`, etc.)
- Parameter names (`projectPath`, `config`, etc.)
- JSON syntax

Just describe what you want in plain English!

## 💡 Pro Tips

1. **Be specific about the project** - Always mention which project you're working with
2. **Use absolute paths for clarity** - `/Users/you/projects/my-app` is clearer than "my app"
3. **"This project" works great** - When working in a single workspace
4. **You can switch projects mid-conversation** - Just specify the new path
5. **No configuration needed** - No need to set `DEVPIPE_CWD` or other environment variables

## 🚫 What You Don't Need

- ❌ Setting `DEVPIPE_CWD` environment variable
- ❌ Configuring workspace-specific settings
- ❌ Restarting your IDE when switching projects
- ❌ Knowing MCP tool names or parameters
- ❌ Writing JSON or structured commands

## 📚 Examples by Use Case

### Single Project Workflow
```
"Analyze this project"
"Run devpipe"
"Show me the tasks"
"Why did the lint task fail?"
```

### Multi-Project Workflow
```
"Analyze /Users/you/projects/frontend"
"Now check /Users/you/projects/backend"
"Run tests in /Users/you/projects/api"
"Compare configs between frontend and backend projects"
```

### New Project Setup
```
"Analyze /Users/you/projects/new-service"
"What technologies did you detect?"
"Create a devpipe config for it"
"Generate a Go linting task"
```

### CI/CD Generation
```
"Generate GitHub Actions for this project"
"Create GitLab CI config for /Users/you/projects/my-app"
```

## 🎓 Learning Curve

- **Beginner:** "Run devpipe in /Users/you/projects/my-app"
- **Intermediate:** "Run only lint and test tasks in this project"
- **Advanced:** "Run devpipe with --fast and --fail-fast, skipping the security scan, in /Users/you/projects/go-service"

All levels work - the AI understands them all!
