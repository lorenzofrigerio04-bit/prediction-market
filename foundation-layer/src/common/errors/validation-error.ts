import { DomainError } from "./domain-error.js";

export class ValidationError extends DomainError {
  public constructor(
    code: string,
    message: string,
    context?: Record<string, unknown>,
  ) {
    super(code, message, context);
    this.name = "ValidationError";
  }
}
