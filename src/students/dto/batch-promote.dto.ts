import { IsArray, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BatchPromoteDto {
    @ApiProperty({ type: [String], description: 'Array of Student UUIDs to be promoted' })
    @IsArray()
    @IsUUID('4', { each: true })
    @IsNotEmpty()
    studentIds: string[];

    @ApiProperty({ description: 'Target ClassGroup UUID' })
    @IsUUID()
    @IsNotEmpty()
    targetClassGroupId: string;
}
