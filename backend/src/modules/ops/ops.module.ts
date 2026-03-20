import { Module } from '@nestjs/common';
import { IntegrationSettingsService } from './integration-settings.service';
import { IntegrationSettingsController } from './integration-settings.controller';
import { CommonModule } from '../../common/common.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { IdentityModule } from '../identity/identity.module';

@Module({
  imports: [CommonModule, PrismaModule, IdentityModule],
  controllers: [IntegrationSettingsController],
  providers: [IntegrationSettingsService],
  exports: [IntegrationSettingsService],
})
export class OpsModule {}
