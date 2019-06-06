import { Retrieval, RetrievalState, shouldAttempt } from '@mixer/retrieval';
import * as filesize from 'filesize';
import * as React from 'react';
import { IoLogoGithub, IoLogoNpm } from 'react-icons/io';
import { connect } from 'react-redux';
import { fetchBundlephobiaData } from '../redux/actions';
import { getBundlephobiaData, IAppState } from '../redux/reducer';
import { IBundlephobiaStats } from '../redux/services/bundlephobia-api';
import * as styles from './bundlephobia-stats.component.scss';
import { Errors } from './errors.component';
import { SideEffectHint, TreeShakeHint } from './hints/hints.component';
import { BasePanel } from './panels/base-panel.component';
import { BooleanPanel } from './panels/boolean-panel.component';
import { CounterPanel } from './panels/counter-panel.component';
import { Placeholder } from './placeholder.component';
import { IndefiniteProgressBar } from './progress-bar.component';
import { color } from './util';

interface IProps {
  name: string;
  stats: Retrieval<IBundlephobiaStats>;
  retrieve(name: string): void;
}

class BundlephobiaStatsComponent extends React.PureComponent<IProps> {
  public componentDidMount() {
    if (shouldAttempt(this.props.stats)) {
      this.props.retrieve(this.props.name);
    }
  }
  public componentDidUpdate(prevProps: IProps) {
    if (this.props.name !== prevProps.name && shouldAttempt(this.props.stats)) {
      this.props.retrieve(this.props.name);
    }
  }

  public render() {
    const stats = this.props.stats;

    switch (stats.state) {
      case RetrievalState.Errored:
        if (stats.error.statusCode === 404) {
          return (
            <Placeholder>
              This package does not appear to be published on the npm registry.
            </Placeholder>
          );
        }

        return <Errors errors={stats.error} />;
      case RetrievalState.Succeeded:
        return (
          <div className={styles.wrapper}>
            <p>
              The following information was retrieved from the latest version of this package. You
              may be using an older version of the package in your build--Webpack stats do not tell
              us your package version.{' '}
              <a href={`https://bundlephobia.com/result?p=${this.props.name}`} target="_blank">
                View this package on Bundlephobia
              </a>{' '}
              for more information.
            </p>

            <div className="row">
              <div className="col-xs-6">
                <BasePanel
                  value={stats.value.version}
                  color={color.blue}
                  title={'Latest Version'}
                />
              </div>
              <div className="col-xs-6">
                <CounterPanel value={stats.value.dependencyCount} title={'Dependencies'} />
              </div>
            </div>
            <div className="row">
              <div className="col-xs-6">
                <CounterPanel
                  value={stats.value.size}
                  title={'Minified Sized'}
                  formatter={filesize}
                />
              </div>
              <div className="col-xs-6">
                <CounterPanel
                  value={stats.value.gzip}
                  title={'Gzipped Sized'}
                  formatter={filesize}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-xs-6">
                <BooleanPanel
                  value={stats.value.hasJSModule || stats.value.hasJSNext}
                  title={'Tree-Shakable'}
                  hint={TreeShakeHint}
                />
              </div>
              <div className="col-xs-6">
                <BooleanPanel
                  value={!stats.value.hasSideEffects}
                  title={'Side-Effect Free'}
                  hint={SideEffectHint}
                />
              </div>
            </div>
            <div className={styles.icons}>
              {stats.value.repository && (
                <a href={stats.value.repository} target="_blank">
                  <IoLogoGithub />
                </a>
              )}
              <a href={`https://www.npmjs.com/package/${this.props.name}`} target="_blank">
                <IoLogoNpm />
              </a>
            </div>
          </div>
        );
      default:
        return <IndefiniteProgressBar />;
    }
  }
}
export const BundlephobiaStats = connect(
  (state: IAppState, { name }: { name: string }) => ({
    stats: getBundlephobiaData(state, name),
  }),
  dispatch => ({
    retrieve(name: string) {
      dispatch(fetchBundlephobiaData.request({ name }));
    },
  }),
)(BundlephobiaStatsComponent);
