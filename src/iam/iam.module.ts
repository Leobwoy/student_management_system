import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeacherAssignment } from './entities/teacher-assignment.entity';
import { ResourceAccessGuard } from './guards/resource-access.guard';

@Module({
    imports: [TypeOrmModule.forFeature([TeacherAssignment])],
    providers: [ResourceAccessGuard],
    exports: [TypeOrmModule, ResourceAccessGuard],
})
export class IamModule { }
