import * as React from 'react';
import styles from './placeholder.component.scss';

export const Placeholder: React.FC = props => (
  <div className={styles.placeholder}>{props.children}</div>
);
