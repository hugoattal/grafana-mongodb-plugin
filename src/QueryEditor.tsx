import defaults from 'lodash/defaults';

import React, { ChangeEvent, PureComponent } from 'react';
import { LegacyForms, MultiSelect } from '@grafana/ui';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from './datasource';
import { defaultQuery, MyDataSourceOptions, MyQuery } from './types';

const { FormField, Select } = LegacyForms;

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export class QueryEditor extends PureComponent<Props> {
  onQueryCollectionChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, collection: event.target.value });
    onRunQuery();
  };
  onQueryIntervalChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, interval: event.target.value });
    onRunQuery();
  };
  onQueryTypeChange = (value: { label?: string; value?: string }) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, type: value.value || '' });
    onRunQuery();
  };
  onQueryFieldsChange = (items: Array<SelectableValue<string>>) => {
    console.log(items);
    console.log(items.map((item) => item.value || ''));
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, fields: items.map((item) => item.value || '') });
    onRunQuery();
  };

  render() {
    const query = defaults(this.props.query, defaultQuery);
    const { collection, interval, type } = query;

    const typeValues = {
      time: {
        label: 'Time series',
        value: 'time',
      },
      table: {
        label: 'Table',
        value: 'table',
      },
    } as Record<string, { label: string; value: string }>;

    return (
      <div>
        <div className="gf-form">
          <Select
            className="gf-form-input width-8"
            options={[typeValues['time'], typeValues['table']]}
            value={typeValues[type] || typeValues['time']}
            onChange={this.onQueryTypeChange}
          />
          <FormField
            labelWidth={8}
            value={collection || ''}
            onChange={this.onQueryCollectionChange}
            label="Collection"
          />
          <FormField
            labelWidth={8}
            value={interval || ''}
            onChange={this.onQueryIntervalChange}
            label="Interval"
            placeholder="1h"
          />
        </div>
        <div className="gf-form">
          <label className="gf-form-label width-8">Fields</label>
          <MultiSelect width={48} allowCustomValue onChange={this.onQueryFieldsChange} />
        </div>
      </div>
    );
  }
}
