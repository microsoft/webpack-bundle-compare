import { IError } from '@mixer/retrieval';

export class HttpError extends Error {
  constructor(public readonly url: string, public readonly retrievalError: IError) {
    super(
      `An unexpected ${retrievalError.statusCode} occurred calling ${url}: "${
        retrievalError.serviceError ? retrievalError.serviceError.errorMessage : 'unknown'
      }"`,
    );
  }
}
