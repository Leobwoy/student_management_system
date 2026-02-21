import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Document } from './entities/document.entity';
import { UploadDocumentMetadataDto } from './dto/upload-document-metadata.dto';

@Injectable()
export class DocumentsService {
    constructor(
        @InjectRepository(Document)
        private readonly documentsRepository: Repository<Document>,
    ) { }

    private readonly logger = new Logger(DocumentsService.name);

    async uploadFile(
        file: Express.Multer.File,
        metadataDto: UploadDocumentMetadataDto,
        uploaderId: string,
    ): Promise<Document> {
        this.logger.log(`Uploading file: ${file.originalname} for uploader: ${uploaderId}`);
        const { title, description, department } = metadataDto;

        // Check for existing document by same user and same title
        const existingVersion = await this.documentsRepository.findOne({
            where: { title, uploader: { id: uploaderId } },
            order: { version: 'DESC' },
        });

        const newVersion = existingVersion ? existingVersion.version + 1 : 1;

        const document = this.documentsRepository.create({
            title,
            description,
            department,
            fileName: file.originalname,
            filePath: file.path,
            mimeType: file.mimetype,
            size: file.size,
            version: newVersion,
            uploader: { id: uploaderId }, // Works for relations if entity expects it
        });

        return this.documentsRepository.save(document);
    }

    async findOne(id: string): Promise<Document> {
        const document = await this.documentsRepository.findOne({ where: { id }, relations: ['uploader'] });
        if (!document) {
            throw new NotFoundException(`Document with ID ${id} not found`);
        }
        return document;
    }

    async search(query: { title?: string; department?: string }): Promise<Document[]> {
        const where: any = {};
        if (query.title) {
            where.title = Like(`%${query.title}%`);
        }
        if (query.department) {
            where.department = query.department;
        }

        return this.documentsRepository.find({ where, relations: ['uploader'] });
    }
}
