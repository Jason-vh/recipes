import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { registerRecipeTools } from "./tools";

export default defineEventHandler(async (event) => {
  const server = new McpServer({
    name: "recipes",
    version: "1.0.0",
  });

  registerRecipeTools(server);

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless mode
  });

  await server.connect(transport);
  await transport.handleRequest(event.node.req, event.node.res);

  // Transport writes directly to res — don't return anything
  if (!event.node.res.writableEnded) {
    event.node.res.end();
  }
});
