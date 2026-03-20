import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { LoyaltyService } from './loyalty.service';
import {
  LoyaltyController,
  AdminLoyaltyController,
} from './loyalty.controller';

@Module({
  imports: [PrismaModule],
  controllers: [LoyaltyController, AdminLoyaltyController],
  providers: [LoyaltyService],
  exports: [LoyaltyService],
})
export class LoyaltyModule {}
