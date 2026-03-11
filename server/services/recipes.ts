import { db } from "../db";
import { recipes, ingredients, instructions } from "../db/schema";
import { eq, ilike, and, desc, asc } from "drizzle-orm";
import type { CreateRecipeInput, UpdateRecipeInput } from "../utils/validate";

interface ListOptions {
  q?: string;
  limit?: number;
  offset?: number;
}

export async function listRecipes(opts: ListOptions = {}) {
  const { q, limit = 20, offset = 0 } = opts;

  const conditions = [];

  if (q) {
    conditions.push(ilike(recipes.title, `%${q}%`));
  }
  const results = await db
    .select({
      id: recipes.id,
      title: recipes.title,
      description: recipes.description,
      prepTime: recipes.prepTime,
      cookTime: recipes.cookTime,
      totalTime: recipes.totalTime,
      servings: recipes.servings,
      imageUrl: recipes.imageUrl,
      createdAt: recipes.createdAt,
    })
    .from(recipes)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(recipes.createdAt))
    .limit(limit)
    .offset(offset);

  return results;
}

export async function getRecipe(id: number) {
  const recipe = await db.select().from(recipes).where(eq(recipes.id, id)).limit(1);

  if (recipe.length === 0) return null;

  const [recipeIngredients, recipeInstructions] = await Promise.all([
    db
      .select()
      .from(ingredients)
      .where(eq(ingredients.recipeId, id))
      .orderBy(asc(ingredients.sortOrder)),
    db
      .select()
      .from(instructions)
      .where(eq(instructions.recipeId, id))
      .orderBy(asc(instructions.stepNumber)),
  ]);

  return {
    ...recipe[0],
    ingredients: recipeIngredients,
    instructions: recipeInstructions,
  };
}

export async function createRecipe(input: CreateRecipeInput) {
  const { ingredients: inputIngredients, instructions: inputInstructions, ...recipeData } = input;

  const [newRecipe] = await db
    .insert(recipes)
    .values({
      ...recipeData,
    })
    .returning();

  const recipeId = newRecipe.id;

  await Promise.all([
    // Insert ingredients
    inputIngredients && inputIngredients.length > 0
      ? db.insert(ingredients).values(
          inputIngredients.map((ing) => ({
            recipeId,
            sortOrder: ing.sortOrder,
            group: ing.group ?? null,
            amount: ing.amount ?? null,
            unit: ing.unit ?? null,
            item: ing.item,
            notes: ing.notes ?? null,
          })),
        )
      : Promise.resolve(),

    // Insert instructions
    inputInstructions && inputInstructions.length > 0
      ? db.insert(instructions).values(
          inputInstructions.map((inst) => ({
            recipeId,
            stepNumber: inst.stepNumber,
            group: inst.group ?? null,
            text: inst.text,
          })),
        )
      : Promise.resolve(),
  ]);

  return getRecipe(recipeId);
}

export async function updateRecipe(id: number, input: UpdateRecipeInput) {
  const { ingredients: inputIngredients, instructions: inputInstructions, ...recipeData } = input;

  // Check recipe exists
  const existing = await db
    .select({ id: recipes.id })
    .from(recipes)
    .where(eq(recipes.id, id))
    .limit(1);
  if (existing.length === 0) return null;

  // Update recipe fields
  if (Object.keys(recipeData).length > 0) {
    await db
      .update(recipes)
      .set({ ...recipeData, updatedAt: new Date() })
      .where(eq(recipes.id, id));
  }

  // Replace strategy for nested items
  const updates: Promise<unknown>[] = [];

  if (inputIngredients !== undefined) {
    updates.push(
      db
        .delete(ingredients)
        .where(eq(ingredients.recipeId, id))
        .then(() =>
          inputIngredients.length > 0
            ? db.insert(ingredients).values(
                inputIngredients.map((ing) => ({
                  recipeId: id,
                  sortOrder: ing.sortOrder,
                  group: ing.group ?? null,
                  amount: ing.amount ?? null,
                  unit: ing.unit ?? null,
                  item: ing.item,
                  notes: ing.notes ?? null,
                })),
              )
            : undefined,
        ),
    );
  }

  if (inputInstructions !== undefined) {
    updates.push(
      db
        .delete(instructions)
        .where(eq(instructions.recipeId, id))
        .then(() =>
          inputInstructions.length > 0
            ? db.insert(instructions).values(
                inputInstructions.map((inst) => ({
                  recipeId: id,
                  stepNumber: inst.stepNumber,
                  group: inst.group ?? null,
                  text: inst.text,
                })),
              )
            : undefined,
        ),
    );
  }

  if (updates.length > 0) await Promise.all(updates);

  return getRecipe(id);
}

export async function deleteRecipe(id: number): Promise<boolean> {
  const result = await db.delete(recipes).where(eq(recipes.id, id)).returning({ id: recipes.id });
  return result.length > 0;
}
