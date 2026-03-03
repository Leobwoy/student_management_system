import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { Course } from '../../courses/entities/course.entity';
import { TeacherAssignment } from '../../iam/entities/teacher-assignment.entity';

@Entity('class_groups')
export class ClassGroup {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string; // e.g. Grade 1

    @Column()
    academicYear: string; // e.g. 2026-2027

    @Column()
    academicTerm: string; // e.g. Fall

    @OneToMany(() => Student, student => student.classGroup)
    students: Student[];

    @OneToMany(() => Course, course => course.classGroup)
    courses: Course[];

    @OneToMany(() => TeacherAssignment, assignment => assignment.classGroup)
    teacherAssignments: TeacherAssignment[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
