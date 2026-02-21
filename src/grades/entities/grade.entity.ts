import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { Course } from '../../courses/entities/course.entity';

@Entity('grades')
export class Grade {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('decimal', { precision: 5, scale: 2 })
    score: number;

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
