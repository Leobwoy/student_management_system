import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ClassGroup } from '../../academic/entities/class-group.entity';
import { Course } from '../../courses/entities/course.entity';

@Entity('teacher_assignments')
export class TeacherAssignment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, user => user.teacherAssignments, { onDelete: 'CASCADE' })
    teacher: User;

    @ManyToOne(() => ClassGroup, classGroup => classGroup.teacherAssignments, { onDelete: 'CASCADE' })
    classGroup: ClassGroup;

    @ManyToOne(() => Course, course => course.teacherAssignments, { nullable: true, onDelete: 'CASCADE' })
    course: Course;

    @Column({ default: false })
    isClassTeacher: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
