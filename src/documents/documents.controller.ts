import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    Query,
    Request
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { UploadDocumentMetadataDto } from './dto/upload-document-metadata.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiBearerAuth()
@ApiTags('Documents')
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
        limits: { fileSize: 10 * 1024 * 1024 }
    }))
    uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body() metadataDto: UploadDocumentMetadataDto,
        @Request() req: any,
    ) {
        const uploaderId = req.user.id; // Extracted from JWT payload
        return this.documentsService.uploadFile(file, metadataDto, uploaderId);
    }

    @Get('search')
    search(@Query('title') title?: string, @Query('department') department?: string) {
        return this.documentsService.search({ title, department });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.documentsService.findOne(id);
    }
}
