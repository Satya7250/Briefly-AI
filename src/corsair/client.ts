import { createCorsair } from "corsair";
import { gmail } from "@corsair-dev/gmail";
import { googlecalendar } from "@corsair-dev/googlecalendar";
import { client } from "@/db";

export const corsair = createCorsair({
  multiTenancy: true,
  database: client,
  kek: process.env.CORSAIR_KEK!,
  plugins: [
    gmail(),
    googlecalendar(),
  ],
}); 
