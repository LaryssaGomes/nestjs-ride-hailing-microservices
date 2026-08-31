import { Controller } from '@nestjs/common';
import { AuthenticationsService } from './authentications.service';
import { MessagePattern } from '@nestjs/microservices';
import { LoginDto, RegisterDto } from '@app/auth-contracts';

@Controller()
export class AuthenticationsController {
  constructor(
    private readonly authenticationsService: AuthenticationsService,
  ) {}

  @MessagePattern({ cmd: 'login' })
  async login(data: LoginDto) {
    return await this.authenticationsService.login(data);
  }

  @MessagePattern({ cmd: 'register' })
  async register(data: RegisterDto) {
    return await this.authenticationsService.register(data);
  }

  @MessagePattern({ cmd: 'validate-token' })
  validateToken(data: { token: string }) {
    return this.authenticationsService.validateToken(data.token);
  }

  @MessagePattern({ cmd: 'get-profile' })
  async getProfile(data: { userId: string }) {
    // Implement your logic to retrieve the user profile based on the userId
    // For example, you can use the PrismaService to fetch the user from the database
    const user = await this.authenticationsService.getProfile(data.userId);
    return user;
  }
}
