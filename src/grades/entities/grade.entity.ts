import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { Course } from '../../courses/entities/course.entity';

export enum AssessmentType {
    CLASS_ASSIGNMENT = 'CLASS_ASSIGNMENT',
    CLASS_TEST = 'CLASS_TEST',
    EXAM = 'EXAM',
}

@Entity('grades')
export class Grade {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('decimal', { precision: 5, scale: 2 })
    score: number;

    @Column({
        type: 'enum',
        enum: AssessmentType,
        default: AssessmentType.CLASS_ASSIGNMENT,
    })
    assessmentType: AssessmentType;

    @Column('decimal', { precision: 5, scale: 2, default: 1.0 })
    weight: number;

    @Column()
    term: string;

    @ManyToOne(() => Student, student => student.id)
    student: Student;

    @ManyToOne(() => Course, course => course.id)
    course: Course;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
