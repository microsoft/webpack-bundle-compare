import * as React from 'react';
import styles from './panels.component.scss';

export const PanelArrangement: React.FC = props => (
  <div className={styles.arrangement}>{props.children}</div>
);
