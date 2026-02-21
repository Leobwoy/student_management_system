import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UploadDocumentMetadataDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    department?: string;
}
