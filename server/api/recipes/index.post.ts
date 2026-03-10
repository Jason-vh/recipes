import { readBody, createError } from "h3";
import { requireAuth } from "../../utils/auth";
import { createRecipeSchema } from "../../utils/validate";
import { createRecipe } from "../../services/recipes";

export default defineEventHandler(async (event) => {
  requireAuth(event);

  const body = await readBody(event);
  const parsed = createRecipeSchema.safeParse(body);

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Validation error",
      data: parsed.error.issues,
    });
  }

  const recipe = await createRecipe(parsed.data);
  return recipe;
});
