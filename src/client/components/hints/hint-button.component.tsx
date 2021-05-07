import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { IoIosInformationCircleOutline } from 'react-icons/io';
import { classes } from '../util';
import styles from './hint-button.component.scss';

export class HintButton extends React.PureComponent<
  { hint: React.ComponentType<{}>; className?: string },
  { open: boolean }
> {
  public state = { open: false };

  public render() {
    return (
      <>
        <button onClick={this.open} className={classes(styles.button, this.props.className)}>
          <IoIosInformationCircleOutline />
        </button>
        {this.state.open &&
          ReactDOM.createPortal(
            <div className={styles.overlay}>
              <div className={styles.backdrop} onClick={this.close} />
              <div className={styles.contents}>
                <this.props.hint />
              </div>
            </div>,
            document.body,
          )}
      </>
    );
  }

  private readonly open = () => {
    this.setState({ open: true });
  };

  private readonly close = () => {
    this.setState({ open: false });
  };
}
