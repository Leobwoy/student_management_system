import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradesService } from './grades.service';
import { GradesController } from './grades.controller';
import { Grade } from './entities/grade.entity';
import { Student } from '../students/entities/student.entity';
import { Course } from '../courses/entities/course.entity';
import { IamModule } from '../iam/iam.module';
import { AcademicModule } from '../academic/academic.module';
import { DocumentsModule } from '../documents/documents.module';
import { ReportEngineService } from './report-engine.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Grade, Student, Course]),
    IamModule,
    AcademicModule,
    DocumentsModule
  ],
  controllers: [GradesController],
  providers: [GradesService, ReportEngineService],
  exports: [GradesService, ReportEngineService],
})
export class GradesModule { }
