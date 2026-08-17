import { Global, Module } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import { PRISMA_CLIENT } from './tokens.js';

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL belum diset. Salin apps/api/.env.example ke .env');
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

@Global()
@Module({
  providers: [{ provide: PRISMA_CLIENT, useFactory: createPrismaClient }],
  exports: [PRISMA_CLIENT],
})
export class PrismaModule {}