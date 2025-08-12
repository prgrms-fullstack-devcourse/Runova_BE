import { DataSource, DataSourceOptions } from "typeorm";
import { addTransactionalDataSource, getDataSourceByName } from "typeorm-transactional";

export async function typeormDataSourceFactory(options?: DataSourceOptions): Promise<DataSource> {
    if (!options) throw new Error("Invalid options provided");

    return getDataSourceByName("default")
        ?? addTransactionalDataSource(new DataSource(options));
}