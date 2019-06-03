import * as React from 'react';
import * as styles from './button.component.scss';
import { classes } from './util';

type Props = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & { variant?: string; size?: 'small' | 'large' | 'normal' };

export const Button: React.FC<Props> = props => {
  const { variant = 'pink', size = 'normal', ...nested } = props;
  return (
    <button
      {...nested}
      className={classes(props.className, styles.button)}
      data-variant={`${variant} ${size}`}
    >
      {props.children}
    </button>
  );
};
