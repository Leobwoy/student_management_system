import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { SchoolTenant } from './school-tenant.entity';

@Entity('school_branding')
export class SchoolBranding {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => SchoolTenant, tenant => tenant.branding, { onDelete: 'CASCADE' })
    @JoinColumn()
    tenant: SchoolTenant;

    @Column({ nullable: true })
    logoUrl: string; // stored URL/path; upload wiring later

    @Column({ nullable: true })
    headteacherSignatureUrl: string;

    @Column({ nullable: true })
    primaryColor: string;

    @Column({ nullable: true })
    addressLine: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    email: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

