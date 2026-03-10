import { readBody, createError } from "h3";
import { requireAuth } from "../../utils/auth";
import { updateRecipeSchema } from "../../utils/validate";
import { updateRecipe } from "../../services/recipes";

export default defineEventHandler(async (event) => {
  requireAuth(event);

  const id = parseInt(event.context.params!.id, 10);
  if (isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid recipe ID" });
  }

  const body = await readBody(event);
  const parsed = updateRecipeSchema.safeParse(body);

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Validation error",
      data: parsed.error.issues,
    });
  }

  const recipe = await updateRecipe(id, parsed.data);
  if (!recipe) {
    throw createError({ statusCode: 404, statusMessage: "Recipe not found" });
  }

  return recipe;
});
