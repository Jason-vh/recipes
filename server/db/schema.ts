import {
  pgTable,
  serial,
  text,
  varchar,
  boolean,
  timestamp,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  prepTime: integer("prep_time"),
  cookTime: integer("cook_time"),
  totalTime: integer("total_time"),
  servings: varchar("servings", { length: 50 }),
  source: varchar("source", { length: 255 }),
  sourceUrl: varchar("source_url", { length: 500 }),
  imageUrl: varchar("image_url", { length: 500 }),
  notes: text("notes"),
  isFavorite: boolean("is_favorite").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const ingredients = pgTable(
  "ingredients",
  {
    id: serial("id").primaryKey(),
    recipeId: integer("recipe_id")
      .references(() => recipes.id, { onDelete: "cascade" })
      .notNull(),
    sortOrder: integer("sort_order").notNull(),
    group: varchar("group", { length: 100 }),
    amount: varchar("amount", { length: 50 }),
    unit: varchar("unit", { length: 50 }),
    item: varchar("item", { length: 255 }).notNull(),
    notes: varchar("notes", { length: 255 }),
  },
  (table) => [index("ingredients_recipe_id_idx").on(table.recipeId)],
);

export const instructions = pgTable(
  "instructions",
  {
    id: serial("id").primaryKey(),
    recipeId: integer("recipe_id")
      .references(() => recipes.id, { onDelete: "cascade" })
      .notNull(),
    stepNumber: integer("step_number").notNull(),
    group: varchar("group", { length: 100 }),
    text: text("text").notNull(),
  },
  (table) => [index("instructions_recipe_id_idx").on(table.recipeId)],
);

// Relations
export const recipesRelations = relations(recipes, ({ many }) => ({
  ingredients: many(ingredients),
  instructions: many(instructions),
}));

export const ingredientsRelations = relations(ingredients, ({ one }) => ({
  recipe: one(recipes, {
    fields: [ingredients.recipeId],
    references: [recipes.id],
  }),
}));

export const instructionsRelations = relations(instructions, ({ one }) => ({
  recipe: one(recipes, {
    fields: [instructions.recipeId],
    references: [recipes.id],
  }),
}));
