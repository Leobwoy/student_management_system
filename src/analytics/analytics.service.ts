import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade } from '../grades/entities/grade.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { Course } from '../courses/entities/course.entity';
import { AttendanceStatus } from '../attendance/enums/attendance-status.enum';

@Injectable()
export class AnalyticsService {
    constructor(
        @InjectRepository(Grade)
        private gradeRepository: Repository<Grade>,
        @InjectRepository(Attendance)
        private attendanceRepository: Repository<Attendance>,
        @InjectRepository(Course)
        private courseRepository: Repository<Course>,
    ) { }

    private readonly logger = new Logger(AnalyticsService.name);

    async getStudentGpa(studentId: string): Promise<number> {
        const { avg } = await this.gradeRepository
            .createQueryBuilder('grade')
            .select('AVG(grade.score)', 'avg')
            .where('grade.studentId = :studentId', { studentId })
            .getRawOne();

        return avg ? parseFloat(Number(avg).toFixed(2)) : 0;
    }

    async getStudentAttendancePercentage(studentId: string, term: string): Promise<number> {
        const totalRecords = await this.attendanceRepository.count({
            where: { student: { id: studentId }, term },
        });

        if (totalRecords === 0) return 0;

        const presentRecords = await this.attendanceRepository.count({
            where: [
                { student: { id: studentId }, term, status: AttendanceStatus.PRESENT },
                { student: { id: studentId }, term, status: AttendanceStatus.LATE },
            ],
        });

        return parseFloat(((presentRecords / totalRecords) * 100).toFixed(2));
    }

    async getCourseStats(courseId: string): Promise<any> {
        const course = await this.courseRepository.findOne({
            where: { id: courseId },
            relations: ['students'],
        });

        if (!course) throw new NotFoundException('Course not found');

        const enrollmentsCount = course.students.length;

        const { avgGrade } = await this.gradeRepository
            .createQueryBuilder('grade')
            .select('AVG(grade.score)', 'avgGrade')
            .where('grade.courseId = :courseId', { courseId })
            .getRawOne();

        const totalAttendance = await this.attendanceRepository.count({
            where: { course: { id: courseId } },
        });

        const presentAttendance = await this.attendanceRepository.count({
            where: [
                { course: { id: courseId }, status: AttendanceStatus.PRESENT },
                { course: { id: courseId }, status: AttendanceStatus.LATE },
            ],
        });

        const attendanceRate = totalAttendance > 0
            ? parseFloat(((presentAttendance / totalAttendance) * 100).toFixed(2))
            : 0;

        return {
            courseId,
            name: course.name,
            totalStudentsEnrolled: enrollmentsCount,
            averageGrade: avgGrade ? parseFloat(Number(avgGrade).toFixed(2)) : 0,
            overallAttendanceRate: attendanceRate,
        };
    }
}
