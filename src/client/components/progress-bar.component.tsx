import * as React from 'react';
import styles from './progress-bar.component.scss';
import { classes } from './util';

interface IProps {
  progress: number;
}

export const ProgressBar: React.FC<IProps> = props => (
  <div
    className={styles.progressbar}
    role="progressbar"
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={Math.round(props.progress * 100)}
  >
    <div style={{ width: `${props.progress * 100}%` }} />
  </div>
);

export const IndefiniteProgressBar: React.FC = () => (
  <div className={classes(styles.progressbar, styles.indefinite)}>
    <div />
  </div>
);
