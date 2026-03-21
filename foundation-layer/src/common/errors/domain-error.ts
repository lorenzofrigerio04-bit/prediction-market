export class DomainError extends Error {
  public readonly code: string;
  public readonly context: Record<string, unknown> | undefined;

  public constructor(
    code: string,
    message: string,
    context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "DomainError";
    this.code = code;
    this.context = context;
  }
}
