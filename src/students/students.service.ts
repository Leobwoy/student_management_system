import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
    constructor(
        @InjectRepository(Student)
        private readonly studentsRepository: Repository<Student>,
    ) { }

    private readonly logger = new Logger(StudentsService.name);

    async create(createStudentDto: CreateStudentDto): Promise<Student> {
        this.logger.log(`Creating new student profile: ${createStudentDto.firstName} ${createStudentDto.lastName}`);
        const newStudent = this.studentsRepository.create(createStudentDto);
        return this.studentsRepository.save(newStudent);
    }

    async findAll(): Promise<Student[]> {
        return this.studentsRepository.find({ relations: ['courses'] });
    }

    async findOne(id: string): Promise<Student> {
        const student = await this.studentsRepository.findOne({
            where: { id },
            relations: ['courses']
        });
        if (!student) {
            throw new NotFoundException(`Student with ID ${id} not found`);
        }
        return student;
    }

    async update(id: string, updateStudentDto: UpdateStudentDto): Promise<Student> {
        const student = await this.findOne(id); // Ensure it exists
        Object.assign(student, updateStudentDto);
        return this.studentsRepository.save(student);
    }

    async remove(id: string): Promise<void> {
        const student = await this.findOne(id);
        await this.studentsRepository.remove(student);
    }
}
