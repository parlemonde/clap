import type { MySqlJsonBuilder } from 'drizzle-orm/mysql-core';
import { json as mysqlJson } from 'drizzle-orm/mysql-core';

export type CustomMySqlJsonBuilderInitial<TName extends string, DataType = unknown> = MySqlJsonBuilder<{
    name: TName;
    dataType: 'json';
    columnType: 'MySqlJson';
    data: DataType;
    driverParam: string;
    enumValues: undefined;
}>;

export const json = mysqlJson as <TName extends string, DataType = unknown>(name: TName) => CustomMySqlJsonBuilderInitial<TName, DataType>;
