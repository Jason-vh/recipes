import { readBody } from "h3";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { registerRecipeTools } from "./tools";

export default defineEventHandler(async (event) => {
  // Read body before the transport tries to — Nitro consumes the stream
  const body = await readBody(event);

  const server = new McpServer({
    name: "recipes",
    version: "1.0.0",
  });

  registerRecipeTools(server);

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless mode
  });

  await server.connect(transport);
  await transport.handleRequest(event.node.req, event.node.res, body);

  // Transport writes directly to res — don't return anything
  if (!event.node.res.writableEnded) {
    event.node.res.end();
  }
});
