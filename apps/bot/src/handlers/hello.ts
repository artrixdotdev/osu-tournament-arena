import { Command } from "discord-hono";

import { factory } from "@/factory";

export const hello = factory.command(
   new Command("hello", "response world"),

   (c) => c.res("world"),
);
