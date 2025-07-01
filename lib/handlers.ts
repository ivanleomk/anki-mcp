import { YankiConnect } from "yanki-connect";
import { getStatus } from "./helper";

export const listAnkiDecks = async () => {
  const client = new YankiConnect();
  const decks = await client.deck.deckNames();

  return {
    content: [
      {
        type: "text" as const,
        text: `Available Anki decks:\n${decks
          .map((deck) => `• ${deck}`)
          .join("\n")}`,
      },
    ],
  };
};

export const getCardsInDeckHandler = async ({
  deckName,
  limit = 10,
  offset = 0,
}: {
  deckName?: string;
  limit?: number;
  offset?: number;
}) => {
  const client = new YankiConnect();

  try {
    // If no deck name provided, get all cards
    const query = deckName ? `deck:"${deckName}"` : "";
    const cardIds = await client.card.findCards({ query });

    // Apply pagination
    const paginatedIds = cardIds.slice(offset, offset + limit);

    if (paginatedIds.length === 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify([]),
          },
        ],
      };
    }

    // Get card info for each ID
    const cardsInfo = await client.card.cardsInfo({ cards: paginatedIds });

    const formattedCards = cardsInfo.map((card) => {
      return {
        id: card.cardId,
        front:
          card.fields?.Front?.value ||
          card.fields?.Question?.value ||
          "No front field",
        back:
          card.fields?.Back?.value ||
          card.fields?.Answer?.value ||
          "No back field",
        state: getStatus(card),
        deckName: card.deckName,
      };
    });

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(formattedCards),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            error: "Failed to get cards from deck",
            message: error instanceof Error ? error.message : "Unknown error",
          }),
        },
      ],
    };
  }
};

export const addBasicCardHandler = async ({
  front,
  back,
  deckName,
  media,
  tags,
  note,
  cardType = "basic",
}: {
  front: string;
  back: string;
  deckName: string;
  media?: string[];
  tags?: string[];
  note?: string;
  cardType?: "basic" | "cloze" | "reverse";
}) => {
  const client = new YankiConnect();
  
  // Store media files first and get their names
  const storedMedia: string[] = [];
  if (media && media.length > 0) {
    for (const mediaPath of media) {
      // Extract filename from path (e.g., /xx/yy/name.mp4 -> name.mp4)
      const filename = mediaPath.split('/').pop() || mediaPath;
      
      try {
        // Read file and convert to base64
        const fs = await import('fs/promises');
        const fileBuffer = await fs.readFile(mediaPath);
        const base64Data = fileBuffer.toString('base64');
        
        // Store in Anki's collection
        await client.media.storeMediaFile({
          filename,
          data: base64Data
        });
        
        storedMedia.push(filename);
      } catch (error) {
        console.error(`Failed to store media file ${mediaPath}:`, error);
      }
    }
  }
  
  // Update front/back to reference stored media files
  let updatedFront = front;
  let updatedBack = back;
  
  // Replace media references in card content
  storedMedia.forEach(filename => {
    const mediaTag = `[sound:${filename}]`;
    if (filename.match(/\.(mp3|wav|m4a|aac|flac|opus)$/i)) {
      updatedFront = updatedFront.replace(new RegExp(`\\{${filename}\\}`, 'g'), mediaTag);
      updatedBack = updatedBack.replace(new RegExp(`\\{${filename}\\}`, 'g'), mediaTag);
    } else if (filename.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      const imgTag = `<img src="${filename}">`;
      updatedFront = updatedFront.replace(new RegExp(`\\{${filename}\\}`, 'g'), imgTag);
      updatedBack = updatedBack.replace(new RegExp(`\\{${filename}\\}`, 'g'), imgTag);
    }
  });
  
  // Create the note
  const noteData = {
    note: {
      deckName,
      modelName: cardType === "basic" ? "Basic" : cardType === "cloze" ? "Cloze" : "Basic (and reversed card)",
      fields: {
        Front: updatedFront,
        Back: updatedBack,
        ...(note && { Extra: note })
      },
      tags: tags || []
    }
  };
  
  try {
    const noteId = await client.note.addNote(noteData);
    
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            success: true,
            noteId,
            storedMedia
          })
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
          })
        }
      ]
    };
  }
};

export const addBulkCardsHandler = async ({
  cards,
  deckName,
  media,
}: {
  cards: Array<{
    front: string;
    back: string;
    tags?: string[];
  }>;
  deckName: string;
  media?: string[];
}) => {
  const client = new YankiConnect();
  
  // First, validate all media files exist
  if (media && media.length > 0) {
    const fs = await import('fs/promises');
    
    // Check all files and collect non-existent ones
    const fileChecks = await Promise.allSettled(
      media.map(async (mediaPath) => {
        try {
          await fs.access(mediaPath);
          return { path: mediaPath, exists: true };
        } catch {
          return { path: mediaPath, exists: false };
        }
      })
    );
    
    const nonExistentFiles = fileChecks
      .map(result => result.status === 'fulfilled' ? result.value : null)
      .filter(result => result && !result.exists)
      .map(result => result!.path);
    
    if (nonExistentFiles.length > 0) {
      throw new Error(`Media files not found or not accessible: ${nonExistentFiles.join(', ')}`);
    }
  }
  
  // Store media files in single pass after validation
  const storedMedia: string[] = [];
  if (media && media.length > 0) {
    const fs = await import('fs/promises');
    
    for (const mediaPath of media) {
      const filename = mediaPath.split('/').pop() || mediaPath;
      
      const fileBuffer = await fs.readFile(mediaPath);
      const base64Data = fileBuffer.toString('base64');
      
      await client.media.storeMediaFile({
        filename,
        data: base64Data
      });
      
      storedMedia.push(filename);
    }
  }
  
  const results: Array<{
    success: boolean;
    noteId?: number;
    error?: string;
    cardIndex: number;
  }> = [];

  let successful = 0;
  let failed = 0;

  // Process each card
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    
    try {
      // Update front/back to reference stored media files
      let updatedFront = card.front;
      let updatedBack = card.back;
      
      storedMedia.forEach(filename => {
        const mediaTag = `[sound:${filename}]`;
        if (filename.match(/\.(mp3|wav|m4a|aac|flac|opus)$/i)) {
          updatedFront = updatedFront.replace(new RegExp(`\\{${filename}\\}`, 'g'), mediaTag);
          updatedBack = updatedBack.replace(new RegExp(`\\{${filename}\\}`, 'g'), mediaTag);
        } else if (filename.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
          const imgTag = `<img src="${filename}">`;
          updatedFront = updatedFront.replace(new RegExp(`\\{${filename}\\}`, 'g'), imgTag);
          updatedBack = updatedBack.replace(new RegExp(`\\{${filename}\\}`, 'g'), imgTag);
        }
      });
      
      // Create the note data (always basic card type)
      const noteData = {
        note: {
          deckName,
          modelName: "Basic",
          fields: {
            Front: updatedFront,
            Back: updatedBack,
          },
          tags: card.tags || []
        }
      };
      
      const noteId = await client.note.addNote(noteData);
      
      results.push({
        success: true,
        noteId: noteId || undefined,
        cardIndex: i
      });
      
      successful++;
      
    } catch (error) {
      results.push({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        cardIndex: i
      });
      
      failed++;
    }
  }

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({
          success: failed === 0,
          results,
          summary: {
            total: cards.length,
            successful,
            failed
          },
          storedMedia
        })
      }
    ]
  };
};

export const searchCardsHandler = async ({
  query,
  deckName,
}: {
  query: string;
  deckName?: string;
}) => {
  const client = new YankiConnect();

  try {
    // Build the search query
    let searchQuery = query;
    if (deckName) {
      searchQuery = `deck:"${deckName}" (${query})`;
    }

    const cardIds = await client.card.findCards({ query: searchQuery });

    if (cardIds.length === 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify([]),
          },
        ],
      };
    }

    // Get card info for each ID
    const cardsInfo = await client.card.cardsInfo({ cards: cardIds });

    const formattedCards = cardsInfo.map((card) => {
      return {
        id: card.cardId,
        front:
          card.fields?.Front?.value ||
          card.fields?.Question?.value ||
          "No front field",
        back:
          card.fields?.Back?.value ||
          card.fields?.Answer?.value ||
          "No back field",
        state: getStatus(card),
        deckName: card.deckName,
      };
    });

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(formattedCards),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            error: "Failed to search cards",
            message: error instanceof Error ? error.message : "Unknown error",
          }),
        },
      ],
    };
  }
};
