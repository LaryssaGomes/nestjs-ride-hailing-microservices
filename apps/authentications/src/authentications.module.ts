import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthenticationsController } from './authentications.controller';
import { AuthenticationsService } from './authentications.service';
import { HealthController } from './health.controller';
import { PrismaService } from './prisma';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'your-secret-key',
      signOptions: { expiresIn: '1h' },
    }),
    ClientsModule.register([
      {
        name: 'RIDER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.RABBITMQ_URL ?? 'amqp://user:password@localhost:5673',
          ],
          queue: 'rider_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [AuthenticationsController, HealthController],
  providers: [AuthenticationsService, PrismaService],
})
export class AuthenticationsModule {}
