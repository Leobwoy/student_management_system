import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../users/enums/role.enum';
import { TeacherAssignment } from '../entities/teacher-assignment.entity';

@Injectable()
export class ResourceAccessGuard implements CanActivate {
    constructor(
        @InjectRepository(TeacherAssignment)
        private teacherAssignmentRepo: Repository<TeacherAssignment>,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            return false;
        }

        if (user.role === Role.ADMIN || user.role === Role.SUPERUSER) {
            return true;
        }

        const studentId = request.params.studentId || request.body.studentId;
        const courseId = request.params.courseId || request.body.courseId;

        if (!studentId && !courseId) {
            return true;
        }

        if (user.role === Role.CLASS_TEACHER || user.role === Role.SUBJECT_TEACHER) {
            let isAssigned = false;
            const userId = user.userId || user.sub;

            if (studentId) {
                const assignment = await this.teacherAssignmentRepo.createQueryBuilder('ta')
                    .innerJoin('ta.classGroup', 'cg')
                    .innerJoin('cg.students', 'st')
                    .where('ta.teacherId = :teacherId', { teacherId: userId })
                    .andWhere('st.id = :studentId', { studentId })
                    .getOne();

                if (assignment) isAssigned = true;
            }

            if (courseId) {
                const assignment = await this.teacherAssignmentRepo.createQueryBuilder('ta')
                    .where('ta.teacherId = :teacherId', { teacherId: userId })
                    .andWhere('ta.courseId = :courseId', { courseId })
                    .getOne();

                if (assignment) isAssigned = true;
            }

            if (!isAssigned) {
                throw new ForbiddenException('Resource access denied: You are not assigned to this student or course.');
            }
            return true; // Granted
        }

        return false;
    }
}
