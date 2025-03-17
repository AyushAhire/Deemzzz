import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const dreams = pgTable("dreams", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  email: text("email").notNull(),
  targetDate: timestamp("target_date").notNull(),
  likes: integer("likes").default(0).notNull(),
  encouragements: integer("encouragements").default(0).notNull(),
});

export const insertDreamSchema = createInsertSchema(dreams)
  .pick({
    description: true,
    email: true,
    targetDate: true,
  })
  .extend({
    email: z.string().email(),
    description: z.string().min(10).max(500),
    targetDate: z.string().transform((str) => new Date(str)),
  });

export type InsertDream = z.infer<typeof insertDreamSchema>;
export type Dream = typeof dreams.$inferSelect;

export const encouragementSchema = z.object({
  dreamId: z.number(),
  message: z.string().min(1).max(200),
});

export type Encouragement = z.infer<typeof encouragementSchema>;