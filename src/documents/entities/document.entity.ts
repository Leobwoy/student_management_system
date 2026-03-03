import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Student } from '../../students/entities/student.entity';
import { ClassGroup } from '../../academic/entities/class-group.entity';

@Entity('documents')
export class Document {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    fileName: string;

    @Column()
    filePath: string;

    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ nullable: true })
    department: string;

    @Column({ nullable: true })
    mimeType: string;

    @Column('int', { nullable: true })
    size: number;

    @Column({ default: 1 })
    version: number;

    @ManyToOne(() => User, user => user.documents)
    uploader: User;

    @ManyToOne(() => Student, student => student.documents, { nullable: true })
    student: Student;

    @ManyToOne(() => ClassGroup, { nullable: true })
    classGroup: ClassGroup;

    @Column({ nullable: true })
    documentType: string;

    @CreateDateColumn()
    uploadedAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
