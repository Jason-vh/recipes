export function useAuth() {
  const token = useCookie("auth_token");

  function authHeaders(): Record<string, string> {
    if (!token.value) return {};
    return { Authorization: `Bearer ${token.value}` };
  }

  return { token, authHeaders };
}
