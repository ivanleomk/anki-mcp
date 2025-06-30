#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { tools } from "./lib/tools.js";

// Create an MCP server
const server = new McpServer({
  name: "demo-server",
  version: "1.0.0",
});

tools.forEach((tool) => {
  server.registerTool(tool.name, tool.config, tool.handler);
});
// Register tools

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
