import { IsNotEmpty, IsNumber, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateGradeDto {
    @IsUUID()
    @IsNotEmpty()
    studentId: string;

    @IsUUID()
    @IsNotEmpty()
    courseId: string;

    @IsNumber()
    @Min(0)
    @Max(100)
    score: number;

    @IsString()
    @IsNotEmpty()
    term: string;
}
