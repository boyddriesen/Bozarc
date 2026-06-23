function unauthorized() {
  return new Response("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Bozarc Research Hub"' },
  });
}

export default {
  async fetch(request, env) {
    const password = env.SITE_PASSWORD;
    if (!password) {
      return new Response("Site password not configured (missing SITE_PASSWORD).", { status: 500 });
    }

    const auth = request.headers.get("Authorization") || "";
    const [scheme, encoded] = auth.split(" ");
    if (scheme === "Basic" && encoded) {
      let decoded = "";
      try {
        decoded = atob(encoded);
      } catch {
        return unauthorized();
      }
      const suppliedPassword = decoded.slice(decoded.indexOf(":") + 1);
      if (suppliedPassword === password) {
        return env.ASSETS.fetch(request);
      }
    }
    return unauthorized();
  },
};
