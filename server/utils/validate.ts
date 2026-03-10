import { z } from "zod/v4";

const ingredientSchema = z.object({
  sortOrder: z.number().int().min(0),
  group: z.string().max(100).nullable().optional(),
  amount: z.string().max(50).nullable().optional(),
  unit: z.string().max(50).nullable().optional(),
  item: z.string().min(1).max(255),
  notes: z.string().max(255).nullable().optional(),
});

const instructionSchema = z.object({
  stepNumber: z.number().int().min(1),
  group: z.string().max(100).nullable().optional(),
  text: z.string().min(1),
});

export const createRecipeSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().nullable().optional(),
  prepTime: z.number().int().min(0).nullable().optional(),
  cookTime: z.number().int().min(0).nullable().optional(),
  totalTime: z.number().int().min(0).nullable().optional(),
  servings: z.string().max(50).nullable().optional(),
  source: z.string().max(255).nullable().optional(),
  sourceUrl: z.string().url().max(500).nullable().optional(),
  imageUrl: z.string().url().max(500).nullable().optional(),
  notes: z.string().nullable().optional(),
  isFavorite: z.boolean().optional(),
  ingredients: z.array(ingredientSchema).optional(),
  instructions: z.array(instructionSchema).optional(),
  tags: z.array(z.string().min(1).max(100)).optional(),
});

export const updateRecipeSchema = createRecipeSchema.partial();

export type CreateRecipeInput = z.infer<typeof createRecipeSchema>;
export type UpdateRecipeInput = z.infer<typeof updateRecipeSchema>;
