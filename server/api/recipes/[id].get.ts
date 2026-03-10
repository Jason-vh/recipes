import { createError } from "h3";
import { getRecipe } from "../../services/recipes";

export default defineEventHandler(async (event) => {
  const id = parseInt(event.context.params!.id, 10);
  if (isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid recipe ID" });
  }

  const recipe = await getRecipe(id);
  if (!recipe) {
    throw createError({ statusCode: 404, statusMessage: "Recipe not found" });
  }

  return recipe;
});
