import { YankiConnect } from "yanki-connect";

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

    const formattedCards = cardsInfo.map((card) => ({
      id: card.cardId,
      front:
        card.fields?.Front?.value ||
        card.fields?.Question?.value ||
        "No front field",
      back:
        card.fields?.Back?.value ||
        card.fields?.Answer?.value ||
        "No back field",
      deckName: card.deckName,
      modelName: card.modelName,
      due: card.due,
      interval: card.interval,
      intervalString: card.interval === 1 ? "1 day" : `every ${card.interval} days`,
      reviews: card.reps,
      lapses: card.lapses,
    }));

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

export const searchCardsHandler = async ({
  query,
  deckName,
}: {
  query: string;
  deckName?: string;
}) => ({
  content: [
    {
      type: "text" as const,
      text: JSON.stringify(
        [
          {
            id: 1,
            front: "こんにちは",
            back: "Hello",
            state: "review",
            deckName: "Japanese",
          },
          {
            id: 5,
            front: "Hello world",
            back: "A common first program",
            state: "new",
            deckName: "Computer Science",
          },
        ]
          .filter(
            (card) =>
              card.front.toLowerCase().includes(query.toLowerCase()) ||
              card.back.toLowerCase().includes(query.toLowerCase())
          )
          .filter((card) => !deckName || card.deckName === deckName)
      ),
    },
  ],
});
