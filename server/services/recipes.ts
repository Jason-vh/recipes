import { db } from "../db";
import { recipes, ingredients, instructions, tags, recipeTags } from "../db/schema";
import { eq, ilike, sql, and, desc, asc, count } from "drizzle-orm";
import type { CreateRecipeInput, UpdateRecipeInput } from "../utils/validate";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

interface ListOptions {
  q?: string;
  tag?: string;
  favorite?: boolean;
  limit?: number;
  offset?: number;
}

export async function listRecipes(opts: ListOptions = {}) {
  const { q, tag, favorite, limit = 20, offset = 0 } = opts;

  const conditions = [];

  if (q) {
    conditions.push(ilike(recipes.title, `%${q}%`));
  }
  if (favorite !== undefined) {
    conditions.push(eq(recipes.isFavorite, favorite));
  }

  let query;

  if (tag) {
    // Join through recipe_tags and tags to filter by tag slug
    query = db
      .select({
        id: recipes.id,
        title: recipes.title,
        description: recipes.description,
        prepTime: recipes.prepTime,
        cookTime: recipes.cookTime,
        totalTime: recipes.totalTime,
        servings: recipes.servings,
        imageUrl: recipes.imageUrl,
        isFavorite: recipes.isFavorite,
        createdAt: recipes.createdAt,
      })
      .from(recipes)
      .innerJoin(recipeTags, eq(recipes.id, recipeTags.recipeId))
      .innerJoin(tags, eq(recipeTags.tagId, tags.id))
      .where(and(eq(tags.slug, tag), ...conditions))
      .orderBy(desc(recipes.createdAt))
      .limit(limit)
      .offset(offset);
  } else {
    query = db
      .select({
        id: recipes.id,
        title: recipes.title,
        description: recipes.description,
        prepTime: recipes.prepTime,
        cookTime: recipes.cookTime,
        totalTime: recipes.totalTime,
        servings: recipes.servings,
        imageUrl: recipes.imageUrl,
        isFavorite: recipes.isFavorite,
        createdAt: recipes.createdAt,
      })
      .from(recipes)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(recipes.createdAt))
      .limit(limit)
      .offset(offset);
  }

  const results = await query;

  // Fetch tags for each recipe
  const recipeIds = results.map((r) => r.id);
  if (recipeIds.length === 0) return results.map((r) => ({ ...r, tags: [] }));

  const tagRows = await db
    .select({
      recipeId: recipeTags.recipeId,
      name: tags.name,
      slug: tags.slug,
    })
    .from(recipeTags)
    .innerJoin(tags, eq(recipeTags.tagId, tags.id))
    .where(sql`${recipeTags.recipeId} IN ${recipeIds}`);

  const tagsByRecipe = new Map<number, { name: string; slug: string }[]>();
  for (const row of tagRows) {
    const list = tagsByRecipe.get(row.recipeId) || [];
    list.push({ name: row.name, slug: row.slug });
    tagsByRecipe.set(row.recipeId, list);
  }

  return results.map((r) => ({
    ...r,
    tags: tagsByRecipe.get(r.id) || [],
  }));
}

export async function getRecipe(id: number) {
  const recipe = await db.select().from(recipes).where(eq(recipes.id, id)).limit(1);

  if (recipe.length === 0) return null;

  const [recipeIngredients, recipeInstructions, recipeTags_] = await Promise.all([
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
    db
      .select({ name: tags.name, slug: tags.slug })
      .from(recipeTags)
      .innerJoin(tags, eq(recipeTags.tagId, tags.id))
      .where(eq(recipeTags.recipeId, id)),
  ]);

  return {
    ...recipe[0],
    ingredients: recipeIngredients,
    instructions: recipeInstructions,
    tags: recipeTags_,
  };
}

export async function createRecipe(input: CreateRecipeInput) {
  const {
    ingredients: inputIngredients,
    instructions: inputInstructions,
    tags: tagNames,
    ...recipeData
  } = input;

  const [newRecipe] = await db
    .insert(recipes)
    .values({
      ...recipeData,
      isFavorite: recipeData.isFavorite ?? false,
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

    // Handle tags (find-or-create, then link)
    tagNames && tagNames.length > 0 ? linkTags(recipeId, tagNames) : Promise.resolve(),
  ]);

  return getRecipe(recipeId);
}

export async function updateRecipe(id: number, input: UpdateRecipeInput) {
  const {
    ingredients: inputIngredients,
    instructions: inputInstructions,
    tags: tagNames,
    ...recipeData
  } = input;

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

  if (tagNames !== undefined) {
    updates.push(
      db
        .delete(recipeTags)
        .where(eq(recipeTags.recipeId, id))
        .then(() => (tagNames.length > 0 ? linkTags(id, tagNames) : undefined)),
    );
  }

  if (updates.length > 0) await Promise.all(updates);

  return getRecipe(id);
}

export async function deleteRecipe(id: number): Promise<boolean> {
  const result = await db.delete(recipes).where(eq(recipes.id, id)).returning({ id: recipes.id });
  return result.length > 0;
}

export async function listTags() {
  const result = await db
    .select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
      recipeCount: count(recipeTags.recipeId),
    })
    .from(tags)
    .leftJoin(recipeTags, eq(tags.id, recipeTags.tagId))
    .groupBy(tags.id, tags.name, tags.slug)
    .orderBy(asc(tags.name));

  return result;
}

async function linkTags(recipeId: number, tagNames: string[]): Promise<void> {
  const tagIds: number[] = [];

  for (const name of tagNames) {
    const slug = slugify(name);
    // Find or create
    const existing = await db.select().from(tags).where(eq(tags.slug, slug)).limit(1);
    if (existing.length > 0) {
      tagIds.push(existing[0].id);
    } else {
      const [newTag] = await db.insert(tags).values({ name, slug }).returning();
      tagIds.push(newTag.id);
    }
  }

  if (tagIds.length > 0) {
    await db.insert(recipeTags).values(tagIds.map((tagId) => ({ recipeId, tagId })));
  }
}
