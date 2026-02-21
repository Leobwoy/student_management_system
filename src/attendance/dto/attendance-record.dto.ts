import { IsDateString, IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { AttendanceStatus } from '../enums/attendance-status.enum';

export class AttendanceRecordDto {
    @IsUUID()
    @IsNotEmpty()
    studentId: string;

    @IsEnum(AttendanceStatus)
    @IsNotEmpty()
    status: AttendanceStatus;
}
