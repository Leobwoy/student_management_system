import { IsNotEmpty, IsUUID } from 'class-validator';

export class EnrollStudentDto {
    @IsUUID()
    @IsNotEmpty()
    studentId: string;
}
