import { IsArray, IsDateString, IsNotEmpty, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceRecordDto } from './attendance-record.dto';

export class RecordAttendanceDto {
    @IsUUID()
    @IsNotEmpty()
    courseId: string;

    @IsDateString()
    @IsNotEmpty()
    date: string;

    @IsString()
    @IsNotEmpty()
    term: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AttendanceRecordDto)
    records: AttendanceRecordDto[];
}
