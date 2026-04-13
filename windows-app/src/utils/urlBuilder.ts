export class URLBuilderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "URLBuilderError";
  }
}

export class URLBuilder {
  private url: URL;
  private searchParams: URLSearchParams;

  constructor(baseURL: string) {
    try {
      this.url = new URL(baseURL);
    } catch {
      throw new URLBuilderError(`Invalid base URL: ${baseURL}`);
    }
    if (!this.url.protocol || !this.url.host) {
      throw new URLBuilderError("Missing scheme or host");
    }
    this.searchParams = new URLSearchParams(this.url.search);
  }

  appendPath(path: string): URLBuilder {
    const clean = path.trim();
    if (clean.includes("..")) {
      throw new URLBuilderError(`Path contains '..': ${clean}`);
    }
    const trimmed = clean.replace(/^\/+|\/+$/g, "");
    const current = this.url.pathname.replace(/\/+$/, "");
    this.url.pathname = current + "/" + trimmed;
    return this;
  }

  addQueryParam(name: string, value: string): URLBuilder {
    if (!name) {
      throw new URLBuilderError("Empty parameter name");
    }
    this.searchParams.set(name, value);
    return this;
  }

  build(): string {
    const scheme = this.url.protocol.replace(":", "");
    if (!["http", "https"].includes(scheme)) {
      throw new URLBuilderError(`Invalid URL scheme: ${scheme}`);
    }
    this.url.search = this.searchParams.toString();
    return this.url.toString();
  }

  // ─── Convenience factories ──────────────────────────────────────────────

  static claudeAPI(endpoint = ""): URLBuilder {
    const builder = new URLBuilder("https://claude.ai/api");
    return endpoint ? builder.appendPath(endpoint) : builder;
  }

  static consoleAPI(endpoint = ""): URLBuilder {
    const builder = new URLBuilder("https://console.anthropic.com/api");
    return endpoint ? builder.appendPath(endpoint) : builder;
  }

  static claudeStatus(endpoint = ""): URLBuilder {
    const builder = new URLBuilder("https://status.claude.com/api/v2");
    return endpoint ? builder.appendPath(endpoint) : builder;
  }
}
