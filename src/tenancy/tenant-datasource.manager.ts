import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SchoolTenant } from './registry/entities/school-tenant.entity';
import { tenantEntities } from './tenant-entities';

@Injectable()
export class TenantDataSourceManager {
    private readonly logger = new Logger(TenantDataSourceManager.name);
    private readonly cache = new Map<string, DataSource>();
    private readonly initPromises = new Map<string, Promise<DataSource>>();

    async getOrCreate(tenant: SchoolTenant): Promise<DataSource> {
        const key = tenant.id;
        const existing = this.cache.get(key);
        if (existing?.isInitialized) return existing;

        const inflight = this.initPromises.get(key);
        if (inflight) return inflight;

        const initPromise = this.createAndInit(tenant)
            .then(ds => {
                this.cache.set(key, ds);
                return ds;
            })
            .finally(() => {
                this.initPromises.delete(key);
            });

        this.initPromises.set(key, initPromise);
        return initPromise;
    }

    private async createAndInit(tenant: SchoolTenant): Promise<DataSource> {
        if (!tenant.dbHost || !tenant.dbPort || !tenant.dbUsername || !tenant.dbDatabase) {
            throw new Error(`Tenant ${tenant.slug} is missing DB connection fields.`);
        }

        this.logger.log(`Initializing tenant datasource: ${tenant.slug} (${tenant.dbHost}:${tenant.dbPort}/${tenant.dbDatabase})`);

        const ds = new DataSource({
            type: 'postgres',
            host: tenant.dbHost,
            port: tenant.dbPort,
            username: tenant.dbUsername,
            password: tenant.dbPassword,
            database: tenant.dbDatabase,
            entities: tenantEntities,
            synchronize: false, // migrations only (Phase 0)
        });

        await ds.initialize();
        return ds;
    }
}

