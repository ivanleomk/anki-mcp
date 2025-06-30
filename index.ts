import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

// Define Anki tools as Zod schemas with metadata
export const GetCardsTool = {
  name: "get_cards" as const,
  description: "Get cards from Anki with optional filtering",
  inputSchema: z.object({
    deck: z.string().optional().describe("Deck name to filter by"),
    query: z.string().optional().describe("Search query"),
    limit: z.number().optional().default(100).describe("Maximum number of cards to return"),
  }),
} as const;

export const CreateCardTool = {
  name: "create_card" as const,
  description: "Create a new Anki card",
  inputSchema: z.object({
    deckName: z.string().min(1, "Deck name is required"),
    modelName: z.string().min(1, "Model name is required"),
    fields: z.record(z.string()).describe("Fields as key-value pairs"),
    tags: z.array(z.string()).optional().default([]).describe("Tags for the card"),
  }),
} as const;

export const SearchCardsTool = {
  name: "search_cards" as const,
  description: "Search for cards in Anki using AnkiConnect query syntax",
  inputSchema: z.object({
    query: z.string().min(1, "Search query is required"),
    limit: z.number().optional().default(100).describe("Maximum number of results"),
  }),
} as const;

export const GetDecksTool = {
  name: "get_decks" as const,
  description: "Get all available decks from Anki",
  inputSchema: z.object({}),
} as const;

// Create union of all tools
export const AnkiTools = [GetCardsTool, CreateCardTool, SearchCardsTool, GetDecksTool] as const;

// Helper to convert tool to MCP format
export function toolToMcp(tool: typeof AnkiTools[number]) {
  return {
    name: tool.name,
    description: tool.description,
    inputSchema: zodToJsonSchema(tool.inputSchema, { target: "jsonSchema7" }),
  };
}

// Type-safe tool name union
export type ToolName = typeof AnkiTools[number]["name"];

// Get tool by name with type safety
export function getToolByName<T extends ToolName>(name: T) {
  return AnkiTools.find(tool => tool.name === name) as Extract<typeof AnkiTools[number], { name: T }>;
}

// Inferred input types
export type GetCardsInput = z.infer<typeof GetCardsTool.inputSchema>;
export type CreateCardInput = z.infer<typeof CreateCardTool.inputSchema>;
export type SearchCardsInput = z.infer<typeof SearchCardsTool.inputSchema>;
export type GetDecksInput = z.infer<typeof GetDecksTool.inputSchema>;

// Create an MCP server
const server = new McpServer({
  name: "anki-mcp-server",
  version: "1.0.0",
});

// Register Anki tools
server.registerTool(
  "get_cards",
  {
    title: "Get Cards",
    description: "Get cards from Anki with optional filtering",
    inputSchema: zodToJsonSchema(GetCardsTool.inputSchema, { target: "jsonSchema7" }),
  },
  async ({ deck, query, limit }) => ({
    content: [{ type: "text", text: `Getting cards: deck=${deck}, query=${query}, limit=${limit}` }],
  })
);

server.registerTool(
  "create_card",
  {
    title: "Create Card",
    description: "Create a new Anki card",
    inputSchema: zodToJsonSchema(CreateCardTool.inputSchema, { target: "jsonSchema7" }),
  },
  async ({ deckName, modelName, fields, tags }) => ({
    content: [{ type: "text", text: `Creating card in deck: ${deckName}, model: ${modelName}` }],
  })
);

server.registerTool(
  "search_cards",
  {
    title: "Search Cards",
    description: "Search for cards in Anki using AnkiConnect query syntax",
    inputSchema: zodToJsonSchema(SearchCardsTool.inputSchema, { target: "jsonSchema7" }),
  },
  async ({ query, limit }) => ({
    content: [{ type: "text", text: `Searching cards: query=${query}, limit=${limit}` }],
  })
);

server.registerTool(
  "get_decks",
  {
    title: "Get Decks",
    description: "Get all available decks from Anki",
    inputSchema: zodToJsonSchema(GetDecksTool.inputSchema, { target: "jsonSchema7" }),
  },
  async ({}) => ({
    content: [{ type: "text", text: "Getting all decks from Anki" }],
  })
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
