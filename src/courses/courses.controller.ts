import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { EnrollStudentDto } from './dto/enroll-student.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';

@ApiBearerAuth()
@ApiTags('Courses')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('courses')
export class CoursesController {
    constructor(private readonly coursesService: CoursesService) { }

    @Roles(Role.ADMIN, Role.TEACHER)
    @Post()
    create(@Body() createCourseDto: CreateCourseDto) {
        return this.coursesService.create(createCourseDto);
    }

    @Get()
    findAll() {
        return this.coursesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.coursesService.findOne(id);
    }

    @Roles(Role.ADMIN, Role.TEACHER)
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
        return this.coursesService.update(id, updateCourseDto);
    }

    @Roles(Role.ADMIN, Role.TEACHER)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.coursesService.remove(id);
    }

    @Roles(Role.ADMIN, Role.TEACHER)
    @Post(':id/enroll')
    enrollStudent(@Param('id') id: string, @Body() enrollStudentDto: EnrollStudentDto) {
        return this.coursesService.enrollStudent(id, enrollStudentDto.studentId);
    }
}
