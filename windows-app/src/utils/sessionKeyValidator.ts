export class SessionKeyValidationError extends Error {
  constructor(
    message: string,
    public readonly recovery?: string,
  ) {
    super(message);
    this.name = "SessionKeyValidationError";
  }
}

interface ValidatorConfig {
  requiredPrefix: string;
  minLength: number;
  maxLength: number;
  allowedChars: RegExp;
  strictMode: boolean;
}

const DEFAULT_CONFIG: ValidatorConfig = {
  requiredPrefix: "sk-ant-",
  minLength: 20,
  maxLength: 500,
  allowedChars: /^[a-zA-Z0-9\-_]+$/,
  strictMode: true,
};

export class SessionKeyValidator {
  private config: ValidatorConfig;

  constructor(config: Partial<ValidatorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  validate(sessionKey: string): string {
    const trimmed = sessionKey.trim();

    if (!trimmed) {
      throw new SessionKeyValidationError(
        "Session key cannot be empty",
        "Please copy the complete sessionKey cookie value from your browser's DevTools",
      );
    }

    if (this.config.strictMode && /\s/.test(trimmed)) {
      throw new SessionKeyValidationError(
        "Session key cannot contain whitespace",
        "Remove any spaces or newlines from the session key",
      );
    }

    if (trimmed.length < this.config.minLength) {
      throw new SessionKeyValidationError(
        `Session key too short (minimum: ${this.config.minLength}, actual: ${trimmed.length})`,
        "Please copy the complete sessionKey cookie value from your browser's DevTools",
      );
    }

    if (trimmed.length > this.config.maxLength) {
      throw new SessionKeyValidationError(
        `Session key too long (maximum: ${this.config.maxLength}, actual: ${trimmed.length})`,
        "Please copy the complete sessionKey cookie value from your browser's DevTools",
      );
    }

    if (!trimmed.startsWith(this.config.requiredPrefix)) {
      throw new SessionKeyValidationError(
        `Session key must start with '${this.config.requiredPrefix}'`,
        "Ensure you're copying the sessionKey cookie value, which should start with 'sk-ant-'",
      );
    }

    // Security checks (strict mode)
    if (this.config.strictMode) {
      this.performSecurityChecks(trimmed);
    }

    // Character validation
    if (!this.config.allowedChars.test(trimmed)) {
      throw new SessionKeyValidationError(
        "Session key contains invalid characters",
        "The session key may be corrupted. Please copy it again from your browser",
      );
    }

    // Format validation
    const afterPrefix = trimmed.slice(this.config.requiredPrefix.length);
    if (!afterPrefix) {
      throw new SessionKeyValidationError(
        "Invalid session key format: No content after prefix",
        "Please copy the complete sessionKey cookie value",
      );
    }
    if (!afterPrefix.includes("-") && !afterPrefix.includes("_")) {
      throw new SessionKeyValidationError(
        "Invalid session key format: Missing expected separators",
        "Please copy the complete sessionKey cookie value",
      );
    }

    return trimmed;
  }

  isValid(sessionKey: string): boolean {
    try {
      this.validate(sessionKey);
      return true;
    } catch {
      return false;
    }
  }

  validationStatus(sessionKey: string): { isValid: boolean; errorMessage?: string } {
    try {
      this.validate(sessionKey);
      return { isValid: true };
    } catch (e) {
      return { isValid: false, errorMessage: e instanceof Error ? e.message : String(e) };
    }
  }

  private performSecurityChecks(key: string): void {
    if (key.includes("\0")) {
      throw new SessionKeyValidationError(
        "Session key rejected for security: Contains null bytes",
        "Please verify the session key is from a legitimate source",
      );
    }

    // eslint-disable-next-line no-control-regex
    if (/[\x00-\x1f\x7f]/.test(key)) {
      throw new SessionKeyValidationError(
        "Session key rejected for security: Contains control characters",
        "Please verify the session key is from a legitimate source",
      );
    }

    if (key.includes("..") || key.includes("//")) {
      throw new SessionKeyValidationError(
        "Session key rejected for security: Contains suspicious patterns",
        "Please verify the session key is from a legitimate source",
      );
    }

    const suspicious = ["<script", "javascript:", "data:", "vbscript:", "file:"];
    for (const pattern of suspicious) {
      if (key.toLowerCase().includes(pattern)) {
        throw new SessionKeyValidationError(
          "Session key rejected for security: Contains script injection pattern",
          "Please verify the session key is from a legitimate source",
        );
      }
    }
  }
}
