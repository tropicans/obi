import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    async login(@Body() body: { password: string }) {
        const user = await this.authService.validateUser(body.password);
        if (!user) {
            throw new UnauthorizedException('Invalid password');
        }
        return this.authService.login(user);
    }
}
