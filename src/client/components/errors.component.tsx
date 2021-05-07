import { IError, IRetrievalError } from '@mixer/retrieval';
import * as React from 'react';
import styles from './errors.component.scss';
import { classes } from './util';

interface IProps {
  errors: IRetrievalError | IError | string | ReadonlyArray<IRetrievalError | IError | string>;
  className?: string;
}

const mapError = (error: IRetrievalError | IError | string) => {
  if (typeof error === 'string') {
    return error;
  }

  if ('state' in error) {
    error = error.error;
  }

  if (error.serviceError) {
    return `Error #${error.serviceError.errorCode}: ${error.serviceError.errorMessage}`;
  }

  return `Unexpected status code ${error.statusCode} encountered`;
};

export const Errors: React.FC<IProps> = props => {
  const contents = Array.isArray(props.errors)
    ? props.errors.map(mapError).join('\n\n')
    : mapError(props.errors as string);

  return (
    <pre className={classes(styles.error, props.className)}>
      <code>{contents}</code>
    </pre>
  );
};
