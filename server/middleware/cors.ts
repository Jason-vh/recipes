import { setResponseHeaders, getRequestURL, isMethod } from "h3";

export default defineEventHandler((event) => {
  const url = getRequestURL(event);
  const path = url.pathname;

  // Apply CORS to API and OAuth routes
  if (path.startsWith("/api/") || path.startsWith("/oauth/") || path.startsWith("/.well-known/")) {
    setResponseHeaders(event, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    });

    // Handle preflight
    if (isMethod(event, "OPTIONS")) {
      event.node.res.statusCode = 204;
      event.node.res.end();
      return;
    }
  }
});
