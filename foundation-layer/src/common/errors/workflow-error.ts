import { DomainError } from "./domain-error.js";

export class WorkflowError extends DomainError {
  public constructor(
    code: string,
    message: string,
    context?: Record<string, unknown>,
  ) {
    super(code, message, context);
    this.name = "WorkflowError";
  }
}
