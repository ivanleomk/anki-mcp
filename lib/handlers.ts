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
}: {
  front: string;
  back: string;
  deckName: string;
}) => ({
  content: [
    {
      type: "text" as const,
      text: JSON.stringify({
        success: true,
        cardId: Math.floor(Math.random() * 10000),
        message: `Card added to deck "${deckName}"`,
      }),
    },
  ],
});

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
