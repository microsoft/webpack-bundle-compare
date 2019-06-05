import * as React from 'react';
import { color } from '../util';
import { BasePanel } from './base-panel.component';

interface IProps {
  title: React.ReactNode;
  value: boolean;
  goodValue?: boolean;
  formatter?: (value: boolean) => string;
}

const defaultFormatter = (value: boolean) => (value ? 'Yes' : 'No');

export const BooleanPanel: React.FC<IProps> = ({
  value,
  title,
  goodValue = true,
  formatter = defaultFormatter,
}) => (
  <BasePanel
    title={title}
    color={!!value === goodValue ? color.blue : color.pink}
    value={formatter(value)}
  />
);
