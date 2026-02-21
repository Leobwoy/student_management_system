import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateCourseDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    code: string;

    @IsInt()
    @Min(1)
    @IsNotEmpty()
    credits: number;
}
