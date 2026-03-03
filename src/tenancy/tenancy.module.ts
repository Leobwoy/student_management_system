import { MiddlewareConsumer, Module, NestModule, RequestMethod, Scope } from '@nestjs/common';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { DataSource } from 'typeorm';
import { TenantResolverMiddleware } from './tenant-resolver.middleware';
import { REGISTRY_DATA_SOURCE_NAME, TENANT_CONTEXT, TENANT_DATA_SOURCE } from './tenancy.constants';
import { SchoolTenant } from './registry/entities/school-tenant.entity';
import { SchoolBranding } from './registry/entities/school-branding.entity';
import { TenantDataSourceManager } from './tenant-datasource.manager';
import { TenantContext } from './tenancy.types';

@Module({
    imports: [
        TypeOrmModule.forFeature([SchoolTenant, SchoolBranding], REGISTRY_DATA_SOURCE_NAME),
    ],
    providers: [
        TenantDataSourceManager,
        {
            provide: TENANT_CONTEXT,
            scope: Scope.REQUEST,
            inject: [REQUEST, getDataSourceToken(REGISTRY_DATA_SOURCE_NAME)],
            useFactory: async (req: Request, registryDataSource: DataSource): Promise<TenantContext> => {
                const slug = req.tenantSlug;
                if (!slug) {
                    throw new Error('Tenant slug missing. Use a subdomain like oxford.localhost or provide x-tenant-slug header.');
                }

                const tenantRepo = registryDataSource.getRepository(SchoolTenant);
                const tenant = await tenantRepo.findOne({
                    where: { slug, isActive: true },
                    relations: ['branding'],
                });

                if (!tenant) {
                    throw new Error(`Unknown or inactive tenant: ${slug}`);
                }

                const ctx: TenantContext = { slug, tenant };
                req.tenantContext = ctx;
                return ctx;
            },
        },
        {
            provide: TENANT_DATA_SOURCE,
            scope: Scope.REQUEST,
            inject: [TENANT_CONTEXT, TenantDataSourceManager],
            useFactory: async (ctx: TenantContext, mgr: TenantDataSourceManager) => {
                return mgr.getOrCreate(ctx.tenant);
            },
        },
    ],
    exports: [TENANT_CONTEXT, TENANT_DATA_SOURCE, TenantDataSourceManager, TypeOrmModule],
})
export class TenancyModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(TenantResolverMiddleware)
            .forRoutes({ path: '*', method: RequestMethod.ALL });
    }
}

