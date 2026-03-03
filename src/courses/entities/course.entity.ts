import { Column, CreateDateColumn, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { ClassGroup } from '../../academic/entities/class-group.entity';
import { TeacherAssignment } from '../../iam/entities/teacher-assignment.entity';

@Entity('courses')
export class Course {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    code: string;

    @Column('int')
    credits: number;

    @ManyToMany(() => Student, student => student.courses)
    students: Student[];

    @ManyToOne(() => ClassGroup, classGroup => classGroup.courses, { nullable: true })
    classGroup: ClassGroup;

    @OneToMany(() => TeacherAssignment, assignment => assignment.course)
    teacherAssignments: TeacherAssignment[];

    @Column({ nullable: true })
    academicTerm: string;

    @Column({ nullable: true })
    academicYear: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
