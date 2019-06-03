import * as styles from './util.component.scss';
import * as filesize from 'filesize';

export const classes = (...classes: (string | null | undefined)[]) => {
  let str = '';
  for (const cls of classes) {
    if (cls) {
      str += ' ' + cls;
    }
  }

  return str;
};

export const color = {
  dark: styles.colorDark,
  medium: styles.colorMedium,
  pink: styles.colorPink,
  yellow: styles.colorYellow,
  blue: styles.colorBlue,
};

export const defaultFormatter = new Intl.NumberFormat();
export const percentageFormatter = new Intl.NumberFormat(undefined, {
  maximumSignificantDigits: 3,
});

/**
 * Formats the difference between two numeric values.
 */
export const formatNumberDifference = (a: number, b: number) => {
  const delta = b - a;
  const str = defaultFormatter.format(Math.abs(delta));
  return `${delta < 0 ? '-' : '+'}${str}`;
};

/**
 * Formats the difference between two file sizes.
 */
export const formatFileSizeDifference = (a: number, b: number) => {
  const delta = b - a;
  const str = filesize(Math.abs(delta));
  return `${delta < 0 ? '-' : '+'}${str}`;
};

/**
 * Formats the difference between two file sizes.
 */
export const formatPercentageDifference = (a: number, b: number) => {
  const delta = (b / a - 1) * 100;
  return `${delta < 0 ? '-' : '+'}${percentageFormatter.format(Math.abs(delta))}%`;
};
