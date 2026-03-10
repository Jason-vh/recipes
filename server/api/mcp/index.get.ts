import { createError } from "h3";

export default defineEventHandler(() => {
  throw createError({
    statusCode: 405,
    statusMessage: "Method Not Allowed. Use POST for MCP requests.",
  });
});
