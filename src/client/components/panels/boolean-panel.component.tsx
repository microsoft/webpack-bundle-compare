import * as React from 'react';
import { color } from '../util';
import { BasePanel } from './base-panel.component';

interface IProps {
  title: React.ReactNode;
  value: boolean;
  hint?: React.ComponentType<{}>;
  goodValue?: boolean;
  formatter?: (value: boolean) => string;
}

const defaultFormatter = (value: boolean) => (value ? 'Yes' : 'No');

export const BooleanPanel: React.FC<IProps> = ({
  value,
  title,
  hint,
  goodValue = true,
  formatter = defaultFormatter,
}) => (
  <BasePanel
    title={title}
    hint={hint}
    color={!!value === goodValue ? color.blue : color.pink}
    value={formatter(value)}
  />
);
