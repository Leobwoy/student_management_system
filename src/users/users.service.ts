import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    private readonly logger = new Logger(UsersService.name);

    async findOneByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { email } });
    }

    async findOneById(id: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { id } });
    }

    async updateProfile(id: string, updateData: Partial<User>): Promise<User | null> {
        this.logger.log(`Updating profile for user: ${id}`);
        await this.usersRepository.update(id, updateData);
        return this.findOneById(id);
    }
}
