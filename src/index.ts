import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ILauncher } from '@jupyterlab/launcher';
import { ReactWidget } from '@jupyterlab/apputils';
import { serverIcon } from '@jupyterlab/ui-components';
import React from 'react';
import App from './App';

/**
 * A Lumino Widget that wraps the React App.
 */
class AirflowGeneratorWidget extends ReactWidget {
  private app: JupyterFrontEnd;

  constructor(app: JupyterFrontEnd) {
    super();
    this.app = app;
    (this as any).addClass('jp-AirflowGeneratorWidget');
    (this as any).title.label = 'Airflow Studio';
    (this as any).title.icon = serverIcon;
    (this as any).title.closable = true;
  }

  render(): React.ReactElement {
    return React.createElement(App, { serviceManager: this.app.serviceManager });
  }
}

/**
 * Initialization data for the extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'airflow-dag-generator:plugin',
  description: 'A JupyterLab extension to generate Airflow DAGs.',
  autoStart: true,
  optional: [ILauncher],
  activate: (app: JupyterFrontEnd, launcher: ILauncher | null) => {
    console.log('JupyterLab extension airflow-dag-generator is activated!');

    const command = 'airflow:open-generator';

    app.commands.addCommand(command, {
      label: 'Airflow Studio',
      icon: serverIcon,
      execute: () => {
        const widget = new AirflowGeneratorWidget(app);
        app.shell.add(widget, 'main');
      }
    });

    if (launcher) {
      launcher.add({
        command: command,
        category: 'Other',
        rank: 0
      });
    }
  }
};

export default plugin;