import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { StudentsService } from '../students/students.service';

@Injectable()
export class CoursesService {
    constructor(
        @InjectRepository(Course)
        private readonly coursesRepository: Repository<Course>,
        private readonly studentsService: StudentsService,
    ) { }

    private readonly logger = new Logger(CoursesService.name);

    async create(createCourseDto: CreateCourseDto): Promise<Course> {
        const newCourse = this.coursesRepository.create(createCourseDto);
        return this.coursesRepository.save(newCourse);
    }

    async findAll(): Promise<Course[]> {
        return this.coursesRepository.find({ relations: ['students'] });
    }

    async findOne(id: string): Promise<Course> {
        const course = await this.coursesRepository.findOne({
            where: { id },
            relations: ['students']
        });
        if (!course) {
            throw new NotFoundException(`Course with ID ${id} not found`);
        }
        return course;
    }

    async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
        const course = await this.findOne(id);
        Object.assign(course, updateCourseDto);
        return this.coursesRepository.save(course);
    }

    async remove(id: string): Promise<void> {
        const course = await this.findOne(id);
        await this.coursesRepository.remove(course);
    }

    async enrollStudent(courseId: string, studentId: string): Promise<Course> {
        const course = await this.findOne(courseId);
        const student = await this.studentsService.findOne(studentId);

        // Check if already enrolled to avoid duplicates
        const isEnrolled = course.students.some(s => s.id === student.id);
        if (!isEnrolled) {
            course.students.push(student);
            await this.coursesRepository.save(course);
        }

        return course;
    }
}
