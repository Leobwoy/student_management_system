import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './src/users/entities/user.entity';
import { Role } from './src/users/enums/role.enum';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
    console.log("Starting Oxford Preparatory Database Seeder...");
    const app = await NestFactory.createApplicationContext(AppModule);
    const userRepository = app.get(getRepositoryToken(User));

    const email = 'developer@oxford.edu';
    const existingAdmin = await userRepository.findOne({ where: { email } });

    if (existingAdmin) {
        console.log(`[INFO] Admin user already exists: ${email}`);
    } else {
        console.log("[WAIT] Generating secure BCrypt hash...");
        const passwordHash = await bcrypt.hash('oxford2026', 10);

        console.log("[WAIT] Saving Admin entity to PostgreSQL...");
        const admin = userRepository.create({
            email,
            passwordHash,
            role: Role.ADMIN,
        });

        await userRepository.save(admin);
        console.log(`\n================================`);
        console.log(`[SUCCESS] Admin User Seeded!`);
        console.log(`Email:    ${email}`);
        console.log(`Password: oxford2026`);
        console.log(`Role:     ADMIN`);
        console.log(`================================\n`);
    }

    await app.close();
}
bootstrap();
