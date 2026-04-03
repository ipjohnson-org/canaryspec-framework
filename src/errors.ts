/**
 * Thrown by expect/assert matchers on assertion failure.
 * The check runner uses instanceof to classify failed vs errored status.
 */
export class AssertError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AssertError';
  }
}
