import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassGroup } from './entities/class-group.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ClassGroup])],
    exports: [TypeOrmModule],
})
export class AcademicModule { }
