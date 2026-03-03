import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Role } from '../enums/role.enum';
import { Document } from '../../documents/entities/document.entity';
import { TeacherAssignment } from '../../iam/entities/teacher-assignment.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    firstName: string;

    @Column({ nullable: true })
    lastName: string;

    @Column()
    passwordHash: string;

    @Column({
        type: 'enum',
        enum: Role,
        default: Role.SUBJECT_TEACHER,
    })
    role: Role;

    @OneToMany(() => Document, document => document.uploader)
    documents: Document[];

    @OneToMany(() => TeacherAssignment, assignment => assignment.teacher)
    teacherAssignments: TeacherAssignment[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
