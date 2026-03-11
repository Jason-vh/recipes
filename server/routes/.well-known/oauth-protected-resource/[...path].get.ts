export default defineEventHandler(() => {
  const appUrl = process.env.APP_URL || "http://localhost:3000";

  return {
    resource: `${appUrl}/api/mcp`,
    authorization_servers: [appUrl],
    bearer_methods_supported: ["header"],
  };
});
