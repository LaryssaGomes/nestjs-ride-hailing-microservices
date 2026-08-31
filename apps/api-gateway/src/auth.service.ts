import { Injectable } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { LoginDto, RegisterDto } from '@app/auth-contracts';
import { handleRpcErrors } from './common/handle-rpc-errors';

@Injectable()
export class AuthService {
  private clientProxy: ClientProxy;
  constructor() {
    this.clientProxy = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [
          process.env.RABBITMQ_URL ?? 'amqp://user:password@localhost:5673',
        ],
        queue: 'auth_queue',
        queueOptions: {
          durable: false,
        },
      },
    });
  }

  login(loginDto: LoginDto) {
    return this.clientProxy
      .send({ cmd: 'login' }, loginDto)
      .pipe(handleRpcErrors);
  }

  register(registerDto: RegisterDto) {
    return this.clientProxy
      .send({ cmd: 'register' }, registerDto)
      .pipe(handleRpcErrors);
  }

  validateToken(token: string) {
    return this.clientProxy
      .send<{ userId: number }>({ cmd: 'validate-token' }, { token })
      .pipe(handleRpcErrors);
  }
  getProfile(userId: string) {
    return this.clientProxy
      .send({ cmd: 'get-profile' }, { userId })
      .pipe(handleRpcErrors);
  }
}
