import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { SchoolBranding } from './school-branding.entity';

export enum TenantDbProvisioningMode {
    CUSTOMER_HOSTED = 'CUSTOMER_HOSTED',
    PLATFORM_HOSTED = 'PLATFORM_HOSTED',
}

@Entity('school_tenants')
export class SchoolTenant {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    slug: string; // e.g. "oxford"

    @Column()
    displayName: string;

    @Column({ default: true })
    isActive: boolean;

    // CUSTOMER_HOSTED: stored in plain text for now (upgradeable later)
    @Column({ nullable: true })
    dbHost: string;

    @Column({ type: 'int', nullable: true })
    dbPort: number;

    @Column({ nullable: true })
    dbUsername: string;

    @Column({ nullable: true })
    dbPassword: string;

    @Column({ nullable: true })
    dbDatabase: string;

    @Column({
        type: 'enum',
        enum: TenantDbProvisioningMode,
        default: TenantDbProvisioningMode.CUSTOMER_HOSTED,
    })
    dbProvisioningMode: TenantDbProvisioningMode;

    // WhatsApp Cloud API configuration (per tenant)
    @Column({ nullable: true })
    whatsappPhoneNumberId: string;

    @Column({ nullable: true })
    whatsappAccessToken: string;

    @Column({ nullable: true })
    whatsappBusinessAccountId: string;

    @OneToOne(() => SchoolBranding, branding => branding.tenant, { cascade: true, nullable: true })
    branding?: SchoolBranding;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

