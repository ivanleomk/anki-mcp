export const addHandler = async ({ a, b }: { a: number; b: number }) => ({
  content: [{ type: "text" as const, text: String(a + b) }],
});
