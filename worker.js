export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Serve index.html for the root path
    if (url.pathname === "/") {
      return env.ASSETS.fetch(new Request(new URL("/index.html", request.url)));
    }
    
    // Serve portfolio for /portfolio
    if (url.pathname === "/portfolio") {
      return env.ASSETS.fetch(new Request(new URL("/portfolio.html", request.url)));
    }

    // Default: try to fetch the asset (css, images, etc.)
    return env.ASSETS.fetch(request);
  }
};