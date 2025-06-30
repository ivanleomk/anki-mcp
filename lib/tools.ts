import { z } from "zod";
import {
  listAnkiDecks,
  getCardsInDeckHandler,
  addBasicCardHandler,
  searchCardsHandler,
} from "./handlers";

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
description: "Create new flashcards with front/back content, optional audio files, tags, and notes",
inputSchema: {
front: z.string(),
back: z.string(), 
deckName: z.string(),
  audioFront: z.string().optional().describe("Path or URL to audio file for front of card"),
    audioBack: z.string().optional().describe("Path or URL to audio file for back of card"),
    tags: z.array(z.string()).optional().describe("Tags to associate with the card"),
      note: z.string().optional().describe("Additional notes for the card"),
      cardType: z.enum(["basic", "cloze", "reverse"]).optional().default("basic").describe("Type of card to create"),
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

export const listAnkiDecksTool = {
  name: "list_anki_decks",
  config: {
    title: "List Anki Decks",
    description: "List all available Anki deck names",
    inputSchema: {},
  },
  handler: listAnkiDecks,
};

export const tools = [
  getCardsInDeckTool,
  addCardTool,
  searchCardsTool,
  listAnkiDecksTool,
];
