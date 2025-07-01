import { z } from "zod";
import {
  listAnkiDecks,
  getCardsInDeckHandler,
  addBasicCardHandler,
  addBulkCardsHandler,
  searchCardsHandler,
} from "./handlers";

export const getCardsInDeckTool = {
  name: "getCardsInDeck",
  config: {
    title: "Get Cards in Deck",
    description: "Retrieve cards from a specific Anki deck with pagination support. Returns card information including front/back content, state, and deck name.",
    inputSchema: {
      deckName: z.string().describe("Name of the Anki deck to retrieve cards from. Use list_anki_decks to see available deck names."),
      limit: z.number().optional().default(10).describe("Maximum number of cards to return (default: 10)"),
      offset: z.number().optional().default(0).describe("Number of cards to skip for pagination (default: 0)"),
    },
  },
  handler: getCardsInDeckHandler,
};

export const addCardTool = {
  name: "addCard",
  config: {
    title: "Add Card", 
    description: "Create new flashcards with front/back content and optional media files. Media files are automatically stored in Anki's collection and can be referenced in card content using {filename} syntax.",
    inputSchema: {
      front: z.string().describe("Front side content of the flashcard. Can include HTML, text, and media references like {audio.mp3} or {image.jpg}"),
      back: z.string().describe("Back side content of the flashcard. Can include HTML, text, and media references like {audio.mp3} or {image.jpg}"), 
      deckName: z.string().describe("Name of the Anki deck where the card should be added. Must be an existing deck name."),
      media: z.array(z.string()).optional().describe("Array of file paths to media files (images, audio, video) that will be stored in Anki's collection. Files can then be referenced in front/back content using {filename} syntax (e.g., {recording.mp3})"),
      tags: z.array(z.string()).optional().describe("Tags to associate with the card for organization and filtering"),
      note: z.string().optional().describe("Additional notes or context information for the card"),
      cardType: z.enum(["basic", "cloze", "reverse"]).optional().default("basic").describe("Type of card template: 'basic' for front->back, 'cloze' for fill-in-the-blank, 'reverse' for bidirectional cards"),
    },
  },
  handler: addBasicCardHandler,
};

export const searchCardsTool = {
  name: "searchCards",
  config: {
    title: "Search Cards",
    description: "Search for existing flashcards by matching text content in their front or back fields. Returns matching cards with their content and metadata.",
    inputSchema: {
      query: z.string().describe("Search term to look for in card front/back content. Case-insensitive partial matching."),
      deckName: z.string().optional().describe("Optional deck name to limit search to specific deck. If not provided, searches all decks."),
    },
  },
  handler: searchCardsHandler,
};

export const listAnkiDecksTool = {
  name: "list_anki_decks",
  config: {
    title: "List Anki Decks",
    description: "Retrieve a list of all available Anki deck names. Use this to see what decks exist before adding cards or searching within specific decks.",
    inputSchema: {},
  },
  handler: listAnkiDecks,
};

export const addBulkCardsTool = {
  name: "addBulkCards",
  config: {
    title: "Add Bulk Cards",
    description: "Create multiple flashcards in one operation with front/back content and optional media files. Media files are automatically stored in Anki's collection and can be referenced in card content using {filename} syntax.",
    inputSchema: {
      cards: z.array(z.object({
        front: z.string().describe("Front side content of the flashcard. Can include HTML, text, and media references like {audio.mp3} or {image.jpg}"),
        back: z.string().describe("Back side content of the flashcard. Can include HTML, text, and media references like {audio.mp3} or {image.jpg}"),
        deckName: z.string().describe("Name of the Anki deck where the card should be added. Must be an existing deck name."),
        media: z.array(z.string()).optional().describe("Array of file paths to media files (images, audio, video) that will be stored in Anki's collection. Files can then be referenced in front/back content using {filename} syntax (e.g., {recording.mp3})"),
        tags: z.array(z.string()).optional().describe("Tags to associate with the card for organization and filtering"),
        note: z.string().optional().describe("Additional notes or context information for the card"),
        cardType: z.enum(["basic", "cloze", "reverse"]).optional().default("basic").describe("Type of card template: 'basic' for front->back, 'cloze' for fill-in-the-blank, 'reverse' for bidirectional cards"),
      })).describe("Array of card objects to create"),
      options: z.object({
        allowDuplicates: z.boolean().optional().describe("Whether to allow duplicate cards to be created")
      }).optional().describe("Additional options for bulk card creation")
    },
  },
  handler: addBulkCardsHandler,
};

export const tools = [
  getCardsInDeckTool,
  addCardTool,
  addBulkCardsTool,
  searchCardsTool,
  listAnkiDecksTool,
];
