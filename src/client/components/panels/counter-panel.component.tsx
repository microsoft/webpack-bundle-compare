import * as React from 'react';
import { color, formatValue } from '../util';
import { BasePanel } from './base-panel.component';
import styles from './panels.component.scss';
import { StatDelta } from './stat-delta.component';

interface IProps {
  title: React.ReactNode;
  value: number;
  hint?: React.ComponentType<{}>;
  color?: string;
  oldValue?: number;
  moreIsBetter?: boolean;
  formatter?: (value: number) => string;
}

export const CounterPanel: React.FC<IProps> = ({
  value,
  oldValue,
  title,
  formatter,
  hint,
  color: explicitColor,
  moreIsBetter,
}) => (
  <BasePanel
    title={title}
    color={explicitColor || getColor(value, oldValue, moreIsBetter)}
    hint={hint}
    footer={
      <StatDelta
        newValue={value}
        oldValue={oldValue}
        className={styles.delta}
        formatter={formatter}
      />
    }
    value={formatValue(value, formatter)}
  />
);

const getColor = (newValue: number, oldValue?: number, moreIsBetter?: boolean) => {
  if (oldValue === undefined) {
    return color.blue;
  }

  if (moreIsBetter) {
    [oldValue, newValue] = [newValue, oldValue];
  }

  if (newValue <= oldValue) {
    return color.blue;
  }

  if (newValue / oldValue < 1.02) {
    return color.yellow;
  }

  return color.pink;
};
