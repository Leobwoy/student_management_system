import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiBearerAuth()
@ApiTags('Analytics')
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('student/:studentId')
    async getStudentAnalytics(
        @Param('studentId') studentId: string,
        @Query('term') term: string,
    ) {
        const gpa = await this.analyticsService.getStudentGpa(studentId);

        let attendancePercentage = null;
        if (term) {
            attendancePercentage = await this.analyticsService.getStudentAttendancePercentage(studentId, term);
        }

        return {
            studentId,
            averageGpaScore: gpa,
            attendancePercentageByTerm: attendancePercentage !== null ? attendancePercentage : 'Term parameter required for attendance calculation',
        };
    }

    @Get('course/:courseId')
    getCourseStats(@Param('courseId') courseId: string) {
        return this.analyticsService.getCourseStats(courseId);
    }
}
