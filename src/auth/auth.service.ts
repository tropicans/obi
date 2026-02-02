import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async validateUser(password: string): Promise<any> {
        const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');
        if (!adminPassword) {
            throw new Error('ADMIN_PASSWORD is not defined in environment variables');
        }
        if (password === adminPassword) {
            return { username: 'admin', role: 'admin' };
        }
        return null;
    }

    async login(user: any) {
        const payload = { username: user.username, sub: user.userId };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
