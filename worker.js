export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Simple routing logic
    if (url.pathname === "/" || url.pathname === "/index") {
      return env.ASSETS.fetch(new Request(new URL("/index.html", request.url)));
    }
    
    if (url.pathname === "/portfolio") {
      return env.ASSETS.fetch(new Request(new URL("/portfolio.html", request.url)));
    }

    if (url.pathname === "/advanced") {
      return env.ASSETS.fetch(new Request(new URL("/advanced.html", request.url)));
    }

    // Fallback to try and find the asset directly (for CSS/Images)
    return env.ASSETS.fetch(request);
  }
};