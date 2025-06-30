import { z } from "zod";
import { addHandler } from "./handlers";

export const addTool = {
  name: "add",
  config: {
    title: "Addition Tool",
    description: "Add two numbers",
    inputSchema: { a: z.number(), b: z.number() },
  },
  handler: addHandler,
};

export const tools = [addTool];
