import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StudentsModule } from './students/students.module';
import { CoursesModule } from './courses/courses.module';
import { DocumentsModule } from './documents/documents.module';
import { AttendanceModule } from './attendance/attendance.module';
import { GradesModule } from './grades/grades.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { NotificationsModule } from './notifications/notifications.module';
import { TasksModule } from './tasks/tasks.module';
import { HealthModule } from './health/health.module';
import { AcademicModule } from './academic/academic.module';
import { IamModule } from './iam/iam.module';
import { TenancyModule } from './tenancy/tenancy.module';
import { REGISTRY_DATA_SOURCE_NAME } from './tenancy/tenancy.constants';
import { SchoolTenant } from './tenancy/registry/entities/school-tenant.entity';
import { SchoolBranding } from './tenancy/registry/entities/school-branding.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Registry DB: stores tenants + branding/settings (multi-tenant control plane)
    TypeOrmModule.forRootAsync({
      name: REGISTRY_DATA_SOURCE_NAME,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow<string>('REGISTRY_DB_HOST'),
        port: configService.getOrThrow<number>('REGISTRY_DB_PORT'),
        username: configService.getOrThrow<string>('REGISTRY_DB_USERNAME'),
        password: configService.getOrThrow<string>('REGISTRY_DB_PASSWORD'),
        database: configService.getOrThrow<string>('REGISTRY_DB_DATABASE'),
        entities: [SchoolTenant, SchoolBranding],
        synchronize: true, // TODO (Phase 0): migrate to migrations
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow<string>('DB_HOST'),
        port: configService.getOrThrow<number>('DB_PORT'),
        username: configService.getOrThrow<string>('DB_USERNAME'),
        password: configService.getOrThrow<string>('DB_PASSWORD'),
        database: configService.getOrThrow<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: true, // Use carefully in production
      }),
    }),
    ScheduleModule.forRoot(),
    TenancyModule,
    AuthModule,
    UsersModule,
    StudentsModule,
    CoursesModule,
    DocumentsModule,
    AttendanceModule,
    GradesModule,
    AnalyticsModule,
    NotificationsModule,
    TasksModule,
    HealthModule,
    AcademicModule,
    IamModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
