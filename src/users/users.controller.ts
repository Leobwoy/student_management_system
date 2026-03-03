import { Body, Controller, Get, Patch, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as bcrypt from 'bcrypt';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('me')
    async getProfile(@Request() req: any) {
        // req.user.userId comes from JwtStrategy
        const userId = req.user.userId || req.user.sub;
        const user = await this.usersService.findOneById(userId);
        if (user) {
            const { passwordHash, ...result } = user;
            return result;
        }
        return null;
    }

    @Patch('me')
    async updateProfile(@Request() req: any, @Body() updateProfileDto: UpdateProfileDto) {
        const updateData: any = { ...updateProfileDto };

        // Hash new password if provided
        if (updateProfileDto.password) {
            updateData.passwordHash = await bcrypt.hash(updateProfileDto.password, 10);
            delete updateData.password;
        }

        // Strictly block role modification
        delete updateData.role;

        const userId = req.user.userId || req.user.sub;
        const user = await this.usersService.updateProfile(userId, updateData);
        if (user) {
            const { passwordHash, ...result } = user;
            return result;
        }
        return null;
    }
}
