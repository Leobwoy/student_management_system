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
    Request,
    Res
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { UploadDocumentMetadataDto } from './dto/upload-document-metadata.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiBearerAuth()
@ApiTags('Documents')
@UseGuards(JwtAuthGuard, RolesGuard)
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
    search(@Query('title') title?: string, @Query('department') department?: string, @Request() req?: any) {
        return this.documentsService.search({ title, department }, req.user);
    }

    @Roles(Role.ADMIN, Role.SUPERUSER, Role.CLASS_TEACHER)
    @Get('batch-download/:classGroupId')
    async batchDownload(
        @Param('classGroupId') classGroupId: string,
        @Query('term') term: string,
        @Res() res: Response
    ) {
        return this.documentsService.batchDownload(classGroupId, term, res);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.documentsService.findOne(id);
    }
}
