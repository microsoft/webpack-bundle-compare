import * as filesize from 'filesize';
import * as React from 'react';
import { IoIosLeaf, IoIosSad } from 'react-icons/io';
import { RouteComponentProps, withRouter } from 'react-router';
import { ImportType, INodeModule, INodeModuleComparisonOutput } from '../../stat-reducers';
import { classes, color, linkToNodeModule } from '../util';
import { BasePanel } from './base-panel.component';
import styles from './panels.component.scss';
import { StatDelta } from './stat-delta.component';

interface IProps {
  comparison: INodeModuleComparisonOutput;
  inChunk?: number;
}

const getSizeInChunk = (nodeModule?: INodeModule, chunk?: number) => {
  if (!nodeModule) {
    return 0;
  }

  if (chunk === undefined) {
    return nodeModule.totalSize;
  }

  let sum = 0;
  for (const m of nodeModule.modules) {
    if (m.chunks?.includes(chunk)) {
      sum += m.size || 0;
    }
  }

  return sum;
};

export const NodeModulePanel = withRouter(
  ({ comparison, inChunk, history }: IProps & RouteComponentProps<{}>) => {
    const oldSize = getSizeInChunk(comparison.old, inChunk);
    const newSize = getSizeInChunk(comparison.new, inChunk);

    if (oldSize === 0 && newSize === 0) {
      return null;
    }

    return (
      <BasePanel
        title={comparison.name}
        value={filesize(newSize)}
        color={newSize > oldSize ? color.yellow : color.blue}
        onClick={() => history.push(linkToNodeModule(comparison.name))}
        footer={
          <span className={styles.delta}>
            {!comparison.old ? (
              'New (+100%)'
            ) : !comparison.new ? (
              `Deleted (-${filesize(oldSize)}`
            ) : (
              <StatDelta oldValue={oldSize} newValue={newSize} formatter={filesize} />
            )}
            <span style={{ flex: 1 }} />
            {comparison.new && <ModuleTypeBadge type={comparison.new.importType} />}
          </span>
        }
      />
    );
  },
);

export const ModuleTypeBadge: React.FC<{ type: number }> = ({ type }) => {
  if (type & ImportType.CommonJs && type & ImportType.EsModule) {
    return <span className={classes(styles.moduleType, styles.mixed)}>Mixed Tree-Shaking</span>;
  }

  if (type & ImportType.EsModule) {
    return (
      <span className={classes(styles.moduleType, styles.shake)}>
        <IoIosLeaf />
        Tree-Shaken
      </span>
    );
  }

  if (type & ImportType.CommonJs) {
    return (
      <span className={classes(styles.moduleType, styles.cjs)}>
        <IoIosSad />
        Not Tree-Shaken
      </span>
    );
  }

  return null;
};
