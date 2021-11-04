import React, { ChangeEvent, PureComponent } from 'react';
import { LegacyForms } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { MyDataSourceOptions } from './types';

const { FormField } = LegacyForms;

interface Props extends DataSourcePluginOptionsEditorProps<MyDataSourceOptions> {}

interface State {}

export class ConfigEditor extends PureComponent<Props, State> {
    onUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { onOptionsChange, options } = this.props;
        const jsonData = {
            ...options.jsonData,
            serverUrl: event.target.value,
        };
        onOptionsChange({ ...options, jsonData });
    };
    onApiChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { onOptionsChange, options } = this.props;
        const jsonData = {
            ...options.jsonData,
            apiKey: event.target.value,
        };
        onOptionsChange({ ...options, jsonData });
    };
    onDatabaseChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { onOptionsChange, options } = this.props;
        const jsonData = {
            ...options.jsonData,
            database: event.target.value,
        };
        onOptionsChange({ ...options, jsonData });
    };

  render() {
    const { options } = this.props;
    const { jsonData } = options;

    return (
      <div className="gf-form-group">
          <div className="gf-form">
              <FormField
                  label="Server URL"
                  labelWidth={6}
                  inputWidth={20}
                  onChange={this.onUrlChange}
                  value={jsonData.serverUrl || ''}
                  placeholder="http://localhost:3900"
              />
          </div>
          <div className="gf-form">
              <FormField
                  label="API Key"
                  labelWidth={6}
                  inputWidth={20}
                  onChange={this.onApiChange}
                  value={jsonData.apiKey || ''}
                  placeholder=""
              />
          </div>
          <div className="gf-form">
              <FormField
                  label="Database"
                  labelWidth={6}
                  inputWidth={20}
                  onChange={this.onDatabaseChange}
                  value={jsonData.database || ''}
                  placeholder=""
              />
          </div>
      </div>
    );
  }
}
