import { SchoolTenant } from './registry/entities/school-tenant.entity';

export type TenantSlug = string;

export interface TenantContext {
    slug: TenantSlug;
    tenant: SchoolTenant;
}

declare module 'express-serve-static-core' {
    interface Request {
        tenantSlug?: string;
        tenantContext?: TenantContext;
    }
}

