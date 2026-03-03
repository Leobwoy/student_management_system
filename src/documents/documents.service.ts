import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Brackets } from 'typeorm';
import { Document } from './entities/document.entity';
import { UploadDocumentMetadataDto } from './dto/upload-document-metadata.dto';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

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

    async search(query: { title?: string; department?: string }, user?: any): Promise<Document[]> {
        const qb = this.documentsRepository.createQueryBuilder('doc')
            .leftJoinAndSelect('doc.uploader', 'uploader')
            .leftJoinAndSelect('doc.student', 'student')
            .leftJoinAndSelect('doc.classGroup', 'classGroup');

        if (query.title) {
            qb.andWhere('doc.title LIKE :title', { title: `%${query.title}%` });
        }
        if (query.department) {
            qb.andWhere('doc.department = :department', { department: query.department });
        }

        if (user && (user.role === 'CLASS_TEACHER' || user.role === 'SUBJECT_TEACHER')) {
            const userId = user.userId || user.sub;
            // Native SQL is used here for maximum efficiency rather than heavily-casted subqueries, mapping perfectly to standard Postgres column generation.
            qb.andWhere(new Brackets(b => {
                b.where('uploader.id = :userId', { userId })
                    .orWhere('doc.classGroupId IN (SELECT "classGroupId" FROM teacher_assignments WHERE "teacherId" = :userId)')
                    .orWhere('doc.studentId IN (SELECT st.id FROM students st INNER JOIN class_groups cg ON cg.id = st."classGroupId" INNER JOIN teacher_assignments ta ON ta."classGroupId" = cg.id WHERE ta."teacherId" = :userId)');
            }));
        }

        return qb.getMany();
    }

    async batchDownload(classGroupId: string, term: string, res: any): Promise<void> {
        const documents = await this.documentsRepository.find({
            where: {
                classGroup: { id: classGroupId },
                documentType: 'TERMINAL_REPORT',
                title: Like(`%${term}%`)
            },
            relations: ['student', 'classGroup']
        });

        if (!documents.length) {
            throw new NotFoundException(`No terminal reports found for this class group and term.`);
        }

        res.set({
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="Reports_${term}.zip"`,
        });

        const archiver = require('archiver');
        const archive = archiver('zip', { zlib: { level: 9 } });

        archive.on('error', (err: any) => { throw err; });
        archive.pipe(res);

        documents.forEach(doc => {
            if (fs.existsSync(doc.filePath)) {
                archive.file(doc.filePath, { name: doc.fileName });
            }
        });

        await archive.finalize();
    }

    async createSystemReport(
        content: string,
        title: string,
        studentId: string,
        classGroupId: string,
        term: string
    ): Promise<Document> {
        const fileName = `report_${uuidv4()}.json`;
        const filePath = path.join('./uploads', fileName);

        if (!fs.existsSync('./uploads')) {
            fs.mkdirSync('./uploads', { recursive: true });
        }

        fs.writeFileSync(filePath, content);

        const newVersion = 1; // System reports are unique by term, no complex versioning needed yet

        const document = this.documentsRepository.create({
            title,
            description: `Automated terminal report for term: ${term}`,
            department: 'Administration',
            fileName,
            filePath,
            mimeType: 'application/json',
            size: Buffer.byteLength(content, 'utf8'),
            version: newVersion,
            documentType: 'TERMINAL_REPORT',
            student: { id: studentId },
            classGroup: { id: classGroupId }
        });

        return this.documentsRepository.save(document);
    }
}
