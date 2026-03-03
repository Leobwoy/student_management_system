import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GradesService } from './grades.service';
import { ReportEngineService } from './report-engine.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { ResourceAccessGuard } from '../iam/guards/resource-access.guard';

@ApiBearerAuth()
@ApiTags('Grades')
@UseGuards(JwtAuthGuard, RolesGuard, ResourceAccessGuard)
@Controller('grades')
export class GradesController {
    constructor(
        private readonly gradesService: GradesService,
        private readonly reportEngineService: ReportEngineService
    ) { }

    @Roles(Role.ADMIN, Role.SUPERUSER, Role.CLASS_TEACHER, Role.SUBJECT_TEACHER)
    @Post()
    create(@Body() createGradeDto: CreateGradeDto) {
        return this.gradesService.create(createGradeDto);
    }

    @Roles(Role.ADMIN, Role.SUPERUSER, Role.CLASS_TEACHER, Role.SUBJECT_TEACHER)
    @Get('student/:studentId')
    findByStudent(@Param('studentId') studentId: string) {
        return this.gradesService.findByStudent(studentId);
    }

    @Roles(Role.ADMIN, Role.SUPERUSER, Role.CLASS_TEACHER)
    @Post('generate-term-report/:studentId')
    generateReport(@Param('studentId') studentId: string, @Body('term') term: string) {
        return this.reportEngineService.generateTermReport(studentId, term);
    }
}
