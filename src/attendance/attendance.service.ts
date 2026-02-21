import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { RecordAttendanceDto } from './dto/record-attendance.dto';
import { Student } from '../students/entities/student.entity';
import { Course } from '../courses/entities/course.entity';

@Injectable()
export class AttendanceService {
    private readonly logger = new Logger(AttendanceService.name);

    constructor(
        @InjectRepository(Attendance)
        private attendanceRepository: Repository<Attendance>,
        @InjectRepository(Student)
        private studentsRepository: Repository<Student>,
        @InjectRepository(Course)
        private coursesRepository: Repository<Course>,
    ) { }

    async recordBatch(recordAttendanceDto: RecordAttendanceDto): Promise<Attendance[]> {
        const { courseId, date, term, records } = recordAttendanceDto;

        const recordDate = new Date(date);
        const today = new Date();
        if (recordDate > today) {
            this.logger.warn(`Attempted to record attendance for future date: ${date}`);
            throw new BadRequestException('Cannot mark attendance for a future date.');
        }

        const course = await this.coursesRepository.findOne({ where: { id: courseId } });
        if (!course) {
            throw new NotFoundException(`Course with ID ${courseId} not found`);
        }

        const attendanceRecords: Attendance[] = [];

        for (const record of records) {
            const student = await this.studentsRepository.findOne({ where: { id: record.studentId } });
            if (!student) {
                throw new NotFoundException(`Student with ID ${record.studentId} not found`);
            }

            const attendance = this.attendanceRepository.create({
                date,
                term,
                status: record.status,
                student,
                course,
            });

            attendanceRecords.push(attendance);
        }

        return this.attendanceRepository.save(attendanceRecords);
    }

    async findByCourseAndDate(courseId: string, date: string): Promise<Attendance[]> {
        return this.attendanceRepository.find({
            where: {
                course: { id: courseId },
                date,
            },
            relations: ['student'],
        });
    }
}
