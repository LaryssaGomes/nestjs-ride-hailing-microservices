import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(process.cwd(), 'apps/authentications/.env') });

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
