import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantResolverMiddleware implements NestMiddleware {
    use(req: Request, _res: Response, next: NextFunction) {
        const hostHeader = req.headers.host || '';
        const host = hostHeader.split(':')[0].toLowerCase(); // strip port

        // Dev: oxford.localhost -> slug = oxford
        // Prod: oxford.example.com -> slug = oxford
        const parts = host.split('.');
        let slug: string | undefined;

        if (parts.length >= 2) {
            // "localhost" special-case: treat "<slug>.localhost"
            if (parts[parts.length - 1] === 'localhost') {
                slug = parts.slice(0, -1).join('.');
            } else {
                // For real domains: slug is first label
                slug = parts[0];
            }
        }

        // Fallback: allow explicit header override for internal tools/tests
        const headerOverride = (req.headers['x-tenant-slug'] as string | undefined)?.trim();
        req.tenantSlug = headerOverride || slug;

        next();
    }
}

