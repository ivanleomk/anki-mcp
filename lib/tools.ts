import { z } from "zod";
import { 
  getDeckNamesHandler, 
  getCardsInDeckHandler, 
  addBasicCardHandler, 
  searchCardsHandler 
} from "./handlers";

export const getDeckNamesTool = {
  name: "getDeckNames",
  config: {
    title: "Get Deck Names",
    description: "List all available Anki decks with basic stats",
    inputSchema: {},
  },
  handler: getDeckNamesHandler,
};

export const getCardsInDeckTool = {
  name: "getCardsInDeck", 
  config: {
    title: "Get Cards in Deck",
    description: "Get cards from a specific deck with pagination support",
    inputSchema: { 
      deckName: z.string().optional(),
      limit: z.number().optional().default(10),
      offset: z.number().optional().default(0),
    },
  },
  handler: getCardsInDeckHandler,
};

export const addCardTool = {
  name: "addCard",
  config: {
    title: "Add Card", 
    description: "Create new flashcards with front/back content",
    inputSchema: {
      front: z.string(),
      back: z.string(), 
      deckName: z.string(),
    },
  },
  handler: addBasicCardHandler,
};

export const searchCardsTool = {
  name: "searchCards",
  config: {
    title: "Search Cards",
    description: "Search for cards by content in front or back fields",
    inputSchema: {
      query: z.string(),
      deckName: z.string().optional(),
    },
  },
  handler: searchCardsHandler,
};

export const tools = [getDeckNamesTool, getCardsInDeckTool, addCardTool, searchCardsTool];
