import { readBody } from "h3";
import { randomBytes } from "crypto";

// RFC 7591 Dynamic Client Registration — required by some MCP clients
export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const clientId = randomBytes(16).toString("hex");

  return {
    client_id: clientId,
    client_name: body.client_name || "MCP Client",
    redirect_uris: body.redirect_uris || [],
    grant_types: ["authorization_code"],
    response_types: ["code"],
    token_endpoint_auth_method: "none",
  };
});
