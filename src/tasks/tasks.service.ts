import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name);

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    handleDatabaseBackup() {
        this.logger.log('Automated Database Backup Initiated');
        // In a real scenario, executing pg_dump or calling a cloud backup service would happen here.
    }
}
