import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { B2bService } from './b2b.service';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, LeadStatus } from '@prisma/client';

@ApiTags('B2B')
@Controller()
export class B2bController {
  constructor(private readonly b2bService: B2bService) {}

  @Public()
  @Post('b2b/leads')
  @ApiOperation({ summary: 'Submit B2B lead form (public)' })
  createLead(@Body() data: {
    companyName: string;
    contactName: string;
    email: string;
    phone: string;
    employeeCount?: number;
    monthlyConsumption?: string;
  }) {
    return this.b2bService.createLead({ ...data, source: 'website' });
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  @Get('admin/b2b/leads')
  @ApiOperation({ summary: 'List B2B leads (admin/sales)' })
  findAllLeads(@Query('status') status?: LeadStatus) {
    return this.b2bService.findAllLeads(status);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  @Patch('admin/b2b/leads/:id')
  @ApiOperation({ summary: 'Update lead status (admin/sales)' })
  updateLead(
    @Param('id') id: string,
    @Body() body: { status: LeadStatus; assignedTo?: string; notes?: string },
  ) {
    return this.b2bService.updateLeadStatus(id, body.status, body.assignedTo, body.notes);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  @Post('admin/b2b/quotes')
  @ApiOperation({ summary: 'Create B2B quote (admin/sales)' })
  createQuote(@Body() body: {
    leadId: string;
    packageName: string;
    monthlyKg: number;
    machineCount: number;
    contractMonths: number;
    monthlyPrice: number;
    setupFee?: number;
  }) {
    const { leadId, ...data } = body;
    return this.b2bService.createQuote(leadId, data);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Post('admin/b2b/contracts')
  @ApiOperation({ summary: 'Create B2B contract (admin)' })
  createContract(@Body() body: {
    leadId: string;
    startDate: Date;
    endDate: Date;
    monthlyKg: number;
    monthlyPrice: number;
  }) {
    const { leadId, ...data } = body;
    return this.b2bService.createContract(leadId, data);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Post('admin/b2b/contracts/:id/assign-machine')
  @ApiOperation({ summary: 'Assign machine to contract (admin)' })
  assignMachine(
    @Param('id') contractId: string,
    @Body() data: { machineModel: string; serialNumber?: string; location?: string },
  ) {
    return this.b2bService.assignMachine(contractId, data);
  }
}
