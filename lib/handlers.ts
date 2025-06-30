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
  deckName: string;
  limit?: number;
  offset?: number;
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
            deckName,
          },
          {
            id: 2,
            front: "ありがとう",
            back: "Thank you",
            state: "new",
            deckName,
          },
          {
            id: 3,
            front: "さようなら",
            back: "Goodbye",
            state: "learning",
            deckName,
          },
        ].slice(offset, offset + limit)
      ),
    },
  ],
});

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
}) => ({
  content: [
    {
      type: "text" as const,
      text: JSON.stringify({
        success: true,
        cardId: Math.floor(Math.random() * 10000),
        message: `${cardType} card added to deck "${deckName}"`,
        card: {
          front,
          back,
          deckName,
          media: media || [],
          tags: tags || [],
          note,
          cardType,
        },
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
