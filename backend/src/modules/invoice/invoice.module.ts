import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InvoiceService } from './invoice.service';
import { AdminInvoiceController } from './invoice.controller';

@Module({
  imports: [ConfigModule],
  controllers: [AdminInvoiceController],
  providers: [InvoiceService],
  exports: [InvoiceService],
})
export class InvoiceModule {}
