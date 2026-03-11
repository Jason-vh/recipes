import { getQuery } from "h3";
import { listRecipes } from "../../services/recipes";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  return listRecipes({
    q: query.q as string | undefined,
    favorite: query.favorite === "true" ? true : query.favorite === "false" ? false : undefined,
    limit: query.limit ? parseInt(query.limit as string, 10) : undefined,
    offset: query.offset ? parseInt(query.offset as string, 10) : undefined,
  });
});
