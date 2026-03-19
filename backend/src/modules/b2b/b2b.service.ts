import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LeadStatus } from '@prisma/client';

@Injectable()
export class B2bService {
  constructor(private prisma: PrismaService) {}

  // Public: submit lead form
  async createLead(data: {
    companyName: string;
    contactName: string;
    email: string;
    phone: string;
    employeeCount?: number;
    monthlyConsumption?: string;
    source?: string;
  }) {
    return this.prisma.b2bLead.create({ data });
  }

  // Admin: list leads
  async findAllLeads(status?: LeadStatus) {
    const where = status ? { status } : {};
    return this.prisma.b2bLead.findMany({
      where,
      include: { quotes: true, contracts: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Admin: update lead status
  async updateLeadStatus(id: string, status: LeadStatus, assignedTo?: string, notes?: string) {
    return this.prisma.b2bLead.update({
      where: { id },
      data: { status, assignedTo, notes },
    });
  }

  // Admin: create quote
  async createQuote(leadId: string, data: {
    packageName: string;
    monthlyKg: number;
    machineCount: number;
    contractMonths: number;
    monthlyPrice: number;
    setupFee?: number;
    notes?: string;
  }) {
    const quote = await this.prisma.b2bQuote.create({
      data: { leadId, ...data },
    });

    // Auto-update lead status
    await this.prisma.b2bLead.update({
      where: { id: leadId },
      data: { status: LeadStatus.PROPOSAL_SENT },
    });

    return quote;
  }

  // Admin: create contract (lead won)
  async createContract(leadId: string, data: {
    startDate: Date;
    endDate: Date;
    monthlyKg: number;
    monthlyPrice: number;
  }) {
    const count = await this.prisma.b2bContract.count();
    const contractNumber = `OLN-B2B-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const contract = await this.prisma.b2bContract.create({
      data: { leadId, contractNumber, ...data },
    });

    await this.prisma.b2bLead.update({
      where: { id: leadId },
      data: { status: LeadStatus.WON },
    });

    return contract;
  }

  // Admin: assign machine to contract
  async assignMachine(contractId: string, data: {
    machineModel: string;
    serialNumber?: string;
    location?: string;
  }) {
    return this.prisma.machineAssignment.create({
      data: { contractId, ...data },
    });
  }
}
