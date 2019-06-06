import * as React from 'react';
import { HintButton } from '../hints/hint-button.component';
import { classes } from '../util';
import * as styles from './panels.component.scss';

export const enum ArrowDirection {
  Up,
  Down,
}

interface IProps {
  title: React.ReactNode;
  value: React.ReactNode;
  hint?: React.ComponentType<{}>;
  footer?: React.ReactNode;
  color: string;
  arrow?: ArrowDirection;
  onClick?(): void;
}

export const BasePanel: React.FC<IProps> = ({
  onClick,
  value,
  footer,
  arrow,
  title,
  color,
  hint,
}) => (
  <div className={classes(onClick && styles.clickable, styles.panel)} onClick={onClick}>
    <span className={styles.title}>{title}:</span>
    {hint && <HintButton hint={hint} className={styles.hint} />}
    <span className={styles.value} style={{ color }}>
      {value}
      {arrow !== undefined && (
        <div className={classes(styles.arrow, arrow === ArrowDirection.Up && styles.up)} />
      )}
    </span>
    {footer}
  </div>
);
