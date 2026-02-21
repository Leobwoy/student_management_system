import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade } from './entities/grade.entity';
import { CreateGradeDto } from './dto/create-grade.dto';
import { Student } from '../students/entities/student.entity';
import { Course } from '../courses/entities/course.entity';

@Injectable()
export class GradesService {
    constructor(
        @InjectRepository(Grade)
        private gradeRepository: Repository<Grade>,
        @InjectRepository(Student)
        private studentsRepository: Repository<Student>,
        @InjectRepository(Course)
        private coursesRepository: Repository<Course>,
    ) { }

    private readonly logger = new Logger(GradesService.name);

    async create(createGradeDto: CreateGradeDto): Promise<Grade> {
        const { studentId, courseId, score, term } = createGradeDto;
        this.logger.log(`Registering grade ${score} for student ${studentId} in course ${courseId}`);

        const student = await this.studentsRepository.findOne({ where: { id: studentId } });
        if (!student) throw new NotFoundException('Student not found');

        const course = await this.coursesRepository.findOne({ where: { id: courseId } });
        if (!course) throw new NotFoundException('Course not found');

        const grade = this.gradeRepository.create({
            student,
            course,
            score,
            term,
        });

        return this.gradeRepository.save(grade);
    }

    async findByStudent(studentId: string): Promise<Grade[]> {
        return this.gradeRepository.find({
            where: { student: { id: studentId } },
            relations: ['course'],
        });
    }
}
