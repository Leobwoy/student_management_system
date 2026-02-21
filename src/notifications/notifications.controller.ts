import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';

@ApiBearerAuth()
@ApiTags('Notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Roles(Role.ADMIN)
    @Post('announcement')
    createAnnouncement(@Body() createAnnouncementDto: CreateAnnouncementDto) {
        return this.notificationsService.createAnnouncement(createAnnouncementDto);
    }

    @Get()
    getNotifications() {
        return this.notificationsService.getNotifications();
    }
}
