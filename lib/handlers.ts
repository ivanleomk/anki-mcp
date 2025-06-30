export const getDeckNamesHandler = async () => ({
  content: [{ type: "text" as const, text: JSON.stringify([
    { name: "Japanese", cardCount: 450, newCards: 12, reviewCards: 38 },
    { name: "Spanish", cardCount: 230, newCards: 5, reviewCards: 15 },
    { name: "Computer Science", cardCount: 180, newCards: 8, reviewCards: 22 }
  ]) }],
});

export const getCardsInDeckHandler = async ({ deckName, limit = 10, offset = 0 }: { deckName: string; limit?: number; offset?: number }) => ({
  content: [{ type: "text" as const, text: JSON.stringify([
    { id: 1, front: "こんにちは", back: "Hello", state: "review", deckName },
    { id: 2, front: "ありがとう", back: "Thank you", state: "new", deckName },
    { id: 3, front: "さようなら", back: "Goodbye", state: "learning", deckName }
  ].slice(offset, offset + limit)) }],
});

export const addBasicCardHandler = async ({ front, back, deckName }: { front: string; back: string; deckName: string }) => ({
  content: [{ type: "text" as const, text: JSON.stringify({
    success: true,
    cardId: Math.floor(Math.random() * 10000),
    message: `Card added to deck "${deckName}"`
  }) }],
});

export const searchCardsHandler = async ({ query, deckName }: { query: string; deckName?: string }) => ({
  content: [{ type: "text" as const, text: JSON.stringify([
    { id: 1, front: "こんにちは", back: "Hello", state: "review", deckName: "Japanese" },
    { id: 5, front: "Hello world", back: "A common first program", state: "new", deckName: "Computer Science" }
  ].filter(card => 
    card.front.toLowerCase().includes(query.toLowerCase()) || 
    card.back.toLowerCase().includes(query.toLowerCase())
  ).filter(card => !deckName || card.deckName === deckName)) }],
});
