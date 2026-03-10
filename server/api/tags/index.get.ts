import { listTags } from "../../services/recipes";

export default defineEventHandler(async () => {
  return listTags();
});
