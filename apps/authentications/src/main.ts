import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AuthenticationsModule } from './authentications.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AuthenticationsModule);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL ?? 'amqp://user:password@localhost:5673'],
      queue: 'auth_queue',
      queueOptions: {
        durable: false,
      },
    },
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  // Bind the HTTP port before the broker connects so /health responds even
  // if RabbitMQ is briefly unreachable (RMQ connects with infinite retries).
  await app.listen(process.env.PORT ?? 3011, '0.0.0.0');
  await app.startAllMicroservices();
}
bootstrap();
