import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade } from './entities/grade.entity';
import { Student } from '../students/entities/student.entity';
import { DocumentsService } from '../documents/documents.service';

@Injectable()
export class ReportEngineService {
    private readonly logger = new Logger(ReportEngineService.name);

    constructor(
        @InjectRepository(Grade)
        private gradesRepository: Repository<Grade>,
        @InjectRepository(Student)
        private studentsRepository: Repository<Student>,
        private documentsService: DocumentsService
    ) { }

    async generateTermReport(studentId: string, term: string): Promise<any> {
        this.logger.log(`Generating terminal report for Student ${studentId} for Term ${term}`);

        const student = await this.studentsRepository.findOne({
            where: { id: studentId },
            relations: ['classGroup']
        });

        if (!student || !student.classGroup) {
            throw new NotFoundException('Student or ClassGroup not found.');
        }

        const grades = await this.gradesRepository.find({
            where: { student: { id: studentId }, term },
            relations: ['course']
        });

        if (grades.length === 0) {
            throw new NotFoundException('No grades found for this term.');
        }

        let totalScore = 0;
        let totalWeight = 0;
        const subjectBreakdown = grades.map(g => {
            const rawScore = Number(g.score);
            const weight = Number(g.weight);
            totalScore += rawScore * weight;
            totalWeight += weight;
            return {
                course: g.course?.name || 'Unknown Course',
                assessmentType: g.assessmentType,
                score: rawScore,
                weight: weight
            };
        });

        const finalAverage = totalWeight > 0 ? (totalScore / totalWeight).toFixed(2) : 0;

        const reportData = {
            studentId: student.id,
            name: `${student.firstName} ${student.lastName}`,
            classGroup: student.classGroup.name,
            term: term,
            generationDate: new Date().toISOString(),
            finalAverage: Number(finalAverage),
            subjects: subjectBreakdown
        };

        const jsonContent = JSON.stringify(reportData, null, 2);

        const title = `Terminal Report - ${student.firstName} ${student.lastName} - ${term}`;
        await this.documentsService.createSystemReport(
            jsonContent,
            title,
            student.id,
            student.classGroup.id,
            term
        );

        return reportData;
    }
}
