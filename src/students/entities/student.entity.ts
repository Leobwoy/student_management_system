import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Course } from '../../courses/entities/course.entity';
import { ClassGroup } from '../../academic/entities/class-group.entity';
import { Grade } from '../../grades/entities/grade.entity';
import { Document } from '../../documents/entities/document.entity';

@Entity('students')
export class Student {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ type: 'date' })
    dateOfBirth: Date;

    @ManyToMany(() => Course, course => course.students)
    @JoinTable({
        name: 'student_courses',
        joinColumn: { name: 'student_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'course_id', referencedColumnName: 'id' },
    })
    courses: Course[];

    @ManyToOne(() => ClassGroup, classGroup => classGroup.students, { nullable: true })
    classGroup: ClassGroup;

    @OneToMany(() => Grade, grade => grade.student)
    grades: Grade[];

    @OneToMany(() => Document, document => document.student)
    documents: Document[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
