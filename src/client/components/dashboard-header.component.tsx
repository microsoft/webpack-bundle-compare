import * as React from 'react';
import {
  IoIosCalendar,
  IoIosArrowRoundForward,
  IoIosWarning,
  IoIosCloseCircleOutline,
  IoIosArrowBack,
} from 'react-icons/io';
import { IconType } from 'react-icons';
import { Stats } from 'webpack';
import { Link } from 'react-router-dom';
import * as styles from './dashboard-header.component.scss';
import * as dayjs from 'dayjs';

const DashboardHeaderItem: React.FC<{ icon: IconType; href?: string }> = props => {
  const inner = (
    <>
      <props.icon className={styles.icon} /> {props.children}
    </>
  );
  return props.href ? (
    <Link to={props.href} className={styles.item}>
      {inner}
    </Link>
  ) : (
    <span className={styles.item}>{inner}</span>
  );
};

export const DashboardBuildDate: React.FC<{
  first: Stats.ToJsonOutput;
  last: Stats.ToJsonOutput;
}> = ({ first, last }) => {
  const from = first.builtAt;
  const to = last.builtAt;
  if (!from || !to) {
    return null;
  }

  let fromFmt = dayjs(from).format('YYYY-MM-DD');
  let toFmt = dayjs(to).format('YYYY-MM-DD');
  if (fromFmt === toFmt) {
    fromFmt = dayjs(from).format('YYYY-MM-DD HH:mm');
    toFmt = dayjs(to).format('HH:mm');
  }
  return (
    <DashboardHeaderItem icon={IoIosCalendar}>
      Built {fromFmt} <IoIosArrowRoundForward /> {toFmt}
    </DashboardHeaderItem>
  );
};

export const DashboardWarningCount: React.FC<{ last: Stats.ToJsonOutput }> = ({ last }) => (
  <DashboardHeaderItem
    icon={IoIosWarning}
    href={last.warnings.length ? '/dashboard/output' : undefined}
  >
    {last.warnings.length} Warnings
  </DashboardHeaderItem>
);

export const DashboardErrorCount: React.FC<{ last: Stats.ToJsonOutput }> = ({ last }) => (
  <DashboardHeaderItem
    icon={IoIosCloseCircleOutline}
    href={last.errors.length ? '/dashboard/output' : undefined}
  >
    {last.errors.length} Errors
  </DashboardHeaderItem>
);

export const DashboardClose: React.FC = () => (
  <DashboardHeaderItem icon={IoIosArrowBack} href="/">
    Back to URLs
  </DashboardHeaderItem>
);
