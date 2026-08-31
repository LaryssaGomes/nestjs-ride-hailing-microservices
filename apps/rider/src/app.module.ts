import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RiderModule } from './rider.module';
import { HealthController } from './health.controller';

const databaseUrl = process.env.RIDER_DATABASE_URL;

@Module({
  imports: [
    RiderModule,
    TypeOrmModule.forRoot(
      databaseUrl
        ? {
            type: 'postgres',
            url: databaseUrl,
            ssl:
              process.env.RIDER_DB_SSL === 'true'
                ? { rejectUnauthorized: false }
                : false,
            autoLoadEntities: true,
            synchronize: true,
            logging: true,
          }
        : {
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'root',
            password: 'root',
            database: 'riders_db',
            autoLoadEntities: true,
            synchronize: true,
            logging: true,
          },
    ),
  ],
  controllers: [HealthController],
})
export class AppModule {}
