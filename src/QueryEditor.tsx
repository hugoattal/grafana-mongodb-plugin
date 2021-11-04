import defaults from 'lodash/defaults';

import React, { ChangeEvent, PureComponent } from 'react';
import { LegacyForms } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from './datasource';
import { defaultQuery, MyDataSourceOptions, MyQuery } from './types';

const { FormField } = LegacyForms;

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export class QueryEditor extends PureComponent<Props> {
    onQueryCollectionChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { onChange, query } = this.props;
        onChange({ ...query, collection: event.target.value });
    };
    onQueryIntervalChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { onChange, query } = this.props;
        onChange({ ...query, interval: event.target.value });
    };

  render() {
    const query = defaults(this.props.query, defaultQuery);
    const { collection, interval } = query;

    return (
      <div className="gf-form">
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
    );
  }
}
