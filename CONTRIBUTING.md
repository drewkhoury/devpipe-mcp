# Contributing to Devpipe MCP Server

Thank you for your interest in contributing to the devpipe MCP server! This document provides guidelines for contributing to the project.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/devpipe-mcp.git
   cd devpipe-mcp
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Build the project**:
   ```bash
   npm run build
   ```

## Development Workflow

### Making Changes

1. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** in the `src/` directory

3. **Build and test** your changes:
   ```bash
   npm run build
   ```

4. **Test manually** by running the MCP server:
   ```bash
   node dist/index.js
   ```

### Code Style

- Use TypeScript for all code
- Follow the existing code style
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions focused and small

### Commit Messages

Write clear, descriptive commit messages:
- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit first line to 72 characters
- Reference issues and pull requests when relevant

Example:
```
Add support for custom output directories

- Allow users to specify custom output paths
- Update documentation with new parameter
- Add validation for directory paths

Fixes #123
```

## Types of Contributions

### Bug Reports

When filing a bug report, please include:
- **Description**: Clear description of the bug
- **Steps to reproduce**: Detailed steps to reproduce the issue
- **Expected behavior**: What you expected to happen
- **Actual behavior**: What actually happened
- **Environment**: OS, Node.js version, devpipe version
- **Logs**: Any relevant error messages or logs

### Feature Requests

When requesting a feature:
- **Use case**: Describe the problem you're trying to solve
- **Proposed solution**: Your idea for how to solve it
- **Alternatives**: Other solutions you've considered
- **Additional context**: Any other relevant information

### Pull Requests

Before submitting a pull request:
1. **Update documentation** if needed
2. **Add examples** for new features
3. **Test thoroughly** with different scenarios
4. **Update CHANGELOG.md** with your changes

Pull request checklist:
- [ ] Code builds without errors
- [ ] Changes are tested manually
- [ ] Documentation is updated
- [ ] Examples are added/updated if needed
- [ ] Commit messages are clear and descriptive

## Project Structure

```
devpipe-mcp/
├── src/
│   ├── index.ts       # Main MCP server implementation
│   ├── types.ts       # TypeScript type definitions
│   └── utils.ts       # Utility functions
├── examples/          # Example configurations
├── dist/              # Compiled JavaScript (generated)
├── package.json       # Node.js package configuration
├── tsconfig.json      # TypeScript configuration
└── README.md          # Main documentation
```

## Adding New Tools

To add a new MCP tool:

1. **Define the tool** in `ListToolsRequestSchema` handler in `src/index.ts`
2. **Implement the handler** in `CallToolRequestSchema` handler
3. **Add utility functions** in `src/utils.ts` if needed
4. **Update types** in `src/types.ts` if needed
5. **Document the tool** in `README.md`
6. **Add examples** in `EXAMPLES.md`

Example tool structure:
```typescript
{
  name: 'tool_name',
  description: 'Clear description of what the tool does',
  inputSchema: {
    type: 'object',
    properties: {
      param1: {
        type: 'string',
        description: 'Parameter description',
      },
    },
    required: ['param1'],
  },
}
```

## Adding New Resources

To add a new MCP resource:

1. **Define the resource** in `ListResourcesRequestSchema` handler
2. **Implement the reader** in `ReadResourceRequestSchema` handler
3. **Document the resource** in `README.md`

## Adding New Prompts

To add a new MCP prompt:

1. **Define the prompt** in `ListPromptsRequestSchema` handler
2. **Implement the prompt** in `GetPromptRequestSchema` handler
3. **Document the prompt** in `README.md`
4. **Add usage examples** in `EXAMPLES.md`

## Testing

Currently, the project uses manual testing. To test:

1. **Build the project**: `npm run build`
2. **Configure an MCP client** (Windsurf, Claude Desktop, etc.)
3. **Test each tool** with various inputs
4. **Test error cases** (missing files, invalid configs, etc.)
5. **Test with real devpipe projects**

Future: We plan to add automated tests using a testing framework.

## Documentation

When adding features:
- Update `README.md` with tool/resource/prompt documentation
- Add examples to `EXAMPLES.md`
- Update example configs in `examples/` if relevant
- Add inline code comments for complex logic

## Release Process

(For maintainers)

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create a git tag: `git tag v0.x.0`
4. Push tag: `git push origin v0.x.0`
5. Publish to npm: `npm publish`

## Questions?

If you have questions:
- Open an issue on GitHub
- Check existing issues and discussions
- Review the documentation

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Assume good intentions

Thank you for contributing! 🎉
