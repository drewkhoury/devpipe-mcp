.PHONY: help install-inspector build test-inspector test clean

# Default target
help:
	@echo "Available targets:"
	@echo "  make install-inspector  - Install MCP Inspector globally"
	@echo "  make build             - Build the TypeScript project"
	@echo "  make test-inspector    - Run MCP Inspector to test the server"
	@echo "                           (optional: WORKDIR=/path/to/project)"
	@echo "  make test              - Build and run inspector (full test flow)"
	@echo "  make clean             - Remove build artifacts"

# Install MCP Inspector globally
install-inspector:
	npm install -g @modelcontextprotocol/inspector

# Build the TypeScript project
build:
	npm run build

# Run MCP Inspector to test the server
# Usage: make test-inspector [WORKDIR=/path/to/project]
test-inspector: build
	@if [ -n "$(WORKDIR)" ]; then \
		echo "Running inspector with working directory: $(WORKDIR)"; \
		cd $(WORKDIR) && npx @modelcontextprotocol/inspector node $(CURDIR)/dist/index.js; \
	else \
		npx @modelcontextprotocol/inspector node dist/index.js; \
	fi

# Full test flow: build and run inspector
test: build test-inspector

# Clean build artifacts
clean:
	rm -rf dist/
