import { createError } from "h3";
import { requireAuth } from "../../utils/auth";
import { deleteRecipe } from "../../services/recipes";

export default defineEventHandler(async (event) => {
  requireAuth(event);

  const id = parseInt(event.context.params!.id, 10);
  if (isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid recipe ID" });
  }

  const deleted = await deleteRecipe(id);
  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: "Recipe not found" });
  }

  return { success: true };
});
