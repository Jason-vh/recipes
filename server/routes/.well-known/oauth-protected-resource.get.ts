export default defineEventHandler(() => {
  const appUrl = process.env.APP_URL || "http://localhost:3000";

  return {
    resource: appUrl,
    authorization_servers: [appUrl],
    bearer_methods_supported: ["header"],
  };
});
