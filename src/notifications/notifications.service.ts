import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification)
        private notificationsRepository: Repository<Notification>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    private readonly logger = new Logger(NotificationsService.name);

    async createAnnouncement(dto: CreateAnnouncementDto): Promise<Notification> {
        this.logger.log(`Broadcasting announcement: ${dto.title}`);
        const announcement = this.notificationsRepository.create({
            title: dto.title,
            message: dto.message,
            type: NotificationType.ANNOUNCEMENT,
            isGlobal: true,
        });
        return this.notificationsRepository.save(announcement);
    }

    async createAlert(userId: string, message: string): Promise<Notification> {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        const alert = this.notificationsRepository.create({
            title: 'Action Required',
            message,
            type: NotificationType.ALERT,
            isGlobal: false,
            user,
        });

        return this.notificationsRepository.save(alert);
    }

    async getNotifications(): Promise<Notification[]> {
        return this.notificationsRepository.find({
            order: { createdAt: 'DESC' },
            relations: ['user']
        });
    }
}
