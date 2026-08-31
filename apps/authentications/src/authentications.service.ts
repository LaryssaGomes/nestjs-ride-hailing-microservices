import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import { PrismaService } from './prisma';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { LoginDto, RegisterDto } from '@app/auth-contracts';

@Injectable()
export class AuthenticationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    @Inject('RIDER_SERVICE') private readonly riderClient: ClientProxy,
  ) {}

  async login(userDto: LoginDto) {
    // Implement your login logic here
    const user = await this.prisma.user.findUnique({
      where: { email: userDto.email },
    });
    if (!user) {
      throw new RpcException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Invalid credentials',
      });
    }
    const isPasswordValid = await bcrypt.compare(
      userDto.password,
      user.password,
    );
    const token = this.jwtService.sign({ userId: user.id });
    if (!isPasswordValid) {
      throw new RpcException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Invalid credentials',
      });
    }
    return { message: 'Login successful', user, token };
  }

  async register(userDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(userDto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: userDto.email,
        password: hashedPassword,
      },
    });
    const rider = await firstValueFrom(
      this.riderClient.send(
        { cmd: 'create-rider' },
        {
          userId: user.id,
          firstName: userDto.firstName,
          lastName: userDto.lastName,
          email: userDto.email,
        },
      ),
    );
    return user;
  }

  validateToken(token: string): { userId: number } {
    try {
      return this.jwtService.verify<{ userId: number }>(token);
    } catch {
      throw new RpcException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Invalid or expired token',
      });
    }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });
    if (!user) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `User with ID ${userId} not found`,
      });
    }
    return user;
  }
}
