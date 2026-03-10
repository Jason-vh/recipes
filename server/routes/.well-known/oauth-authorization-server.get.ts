export default defineEventHandler(() => {
  const appUrl = process.env.APP_URL || "http://localhost:3000";

  return {
    issuer: appUrl,
    authorization_endpoint: `${appUrl}/oauth/authorize`,
    token_endpoint: `${appUrl}/oauth/token`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code"],
    code_challenge_methods_supported: ["S256"],
    token_endpoint_auth_methods_supported: ["none"],
    registration_endpoint: `${appUrl}/oauth/register`,
  };
});
