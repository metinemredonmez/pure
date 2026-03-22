import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { B2bService } from './b2b.service';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, LeadStatus } from '@prisma/client';
import {
  CreateLeadDto,
  UpdateLeadDto,
  CreateQuoteDto,
  CreateContractDto,
  AssignMachineDto,
} from './dto/b2b.dto';

@ApiTags('B2B')
@Controller()
export class B2bController {
  constructor(private readonly b2bService: B2bService) {}

  @Public()
  @Post('b2b/leads')
  @ApiOperation({ summary: 'Submit B2B lead form (public)' })
  createLead(@Body() dto: CreateLeadDto) {
    return this.b2bService.createLead({ ...dto, source: 'website' });
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  @Get('admin/b2b/leads')
  @ApiOperation({ summary: 'List B2B leads (admin/sales)' })
  findAllLeads(
    @Query('status') status?: LeadStatus,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.b2bService.findAllLeads(status, page, limit);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  @Patch('admin/b2b/leads/:id')
  @ApiOperation({ summary: 'Update lead status (admin/sales)' })
  updateLead(@Param('id') id: string, @Body() dto: UpdateLeadDto) {
    return this.b2bService.updateLeadStatus(
      id,
      dto.status,
      dto.assignedTo,
      dto.notes,
    );
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Delete('admin/b2b/leads/:id')
  @ApiOperation({ summary: 'Delete lead (admin)' })
  deleteLead(@Param('id') id: string) {
    return this.b2bService.deleteLead(id);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  @Post('admin/b2b/quotes')
  @ApiOperation({ summary: 'Create B2B quote (admin/sales)' })
  createQuote(@Body() dto: CreateQuoteDto) {
    const { leadId, ...data } = dto;
    return this.b2bService.createQuote(leadId, data);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Post('admin/b2b/contracts')
  @ApiOperation({ summary: 'Create B2B contract (admin)' })
  createContract(@Body() dto: CreateContractDto) {
    const { leadId, ...rest } = dto;
    return this.b2bService.createContract(leadId, {
      ...rest,
      startDate: new Date(rest.startDate),
      endDate: new Date(rest.endDate),
    });
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Post('admin/b2b/contracts/:id/assign-machine')
  @ApiOperation({ summary: 'Assign machine to contract (admin)' })
  assignMachine(
    @Param('id') contractId: string,
    @Body() dto: AssignMachineDto,
  ) {
    return this.b2bService.assignMachine(contractId, dto);
  }
}
