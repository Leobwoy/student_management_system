import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
    ALERT = 'ALERT',
    ANNOUNCEMENT = 'ANNOUNCEMENT',
}

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column('text')
    message: string;

    @Column({
        type: 'enum',
        enum: NotificationType,
        default: NotificationType.ALERT,
    })
    type: NotificationType;

    @Column({ default: false })
    isGlobal: boolean;

    @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
    user: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
