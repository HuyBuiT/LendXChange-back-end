import { forEach } from 'lodash';
import { SortDirection } from 'src/common/common.enum';
import { SelectQueryBuilder } from 'typeorm';

export const buildOrderBy = (
  query: SelectQueryBuilder<any>,
  sorts: { [k: string]: SortDirection },
): SelectQueryBuilder<any> => {
  forEach(sorts, (value: SortDirection, key) => {
    query.addOrderBy(key, value);
  });
  return query;
};
