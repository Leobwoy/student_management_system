import { Controller, Post, Body, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { RecordAttendanceDto } from './dto/record-attendance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';

@ApiBearerAuth()
@ApiTags('Attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) { }

    @Roles(Role.ADMIN, Role.TEACHER)
    @Post()
    recordBatch(@Body() recordAttendanceDto: RecordAttendanceDto) {
        return this.attendanceService.recordBatch(recordAttendanceDto);
    }

    @Roles(Role.ADMIN, Role.TEACHER)
    @Get('course/:courseId')
    findByCourseAndDate(
        @Param('courseId') courseId: string,
        @Query('date') date: string,
    ) {
        return this.attendanceService.findByCourseAndDate(courseId, date);
    }
}
