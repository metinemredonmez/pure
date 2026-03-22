import { Injectable } from '@nestjs/common';
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

  // Admin: list leads (with pagination)
  async findAllLeads(status?: LeadStatus, page = 1, limit = 20) {
    const where = status ? { status } : {};
    const safeLimit = Math.min(limit, 100);

    const [data, total] = await Promise.all([
      this.prisma.b2bLead.findMany({
        where,
        include: { quotes: true, contracts: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * safeLimit,
        take: safeLimit,
      }),
      this.prisma.b2bLead.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  // Admin: update lead status
  async updateLeadStatus(
    id: string,
    status: LeadStatus,
    assignedTo?: string,
    notes?: string,
  ) {
    return this.prisma.b2bLead.update({
      where: { id },
      data: { status, assignedTo, notes },
    });
  }

  // Admin: create quote (with transaction)
  async createQuote(
    leadId: string,
    data: {
      packageName: string;
      monthlyKg: number;
      machineCount: number;
      contractMonths: number;
      monthlyPrice: number;
      setupFee?: number;
      notes?: string;
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      const quote = await tx.b2bQuote.create({
        data: { leadId, ...data },
      });

      await tx.b2bLead.update({
        where: { id: leadId },
        data: { status: LeadStatus.PROPOSAL_SENT },
      });

      return quote;
    });
  }

  // Admin: create contract (lead won) — transaction + UUID-based number
  async createContract(
    leadId: string,
    data: {
      startDate: Date;
      endDate: Date;
      monthlyKg: number;
      monthlyPrice: number;
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      // Use timestamp + random suffix to avoid race condition
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      const contractNumber = `OLN-B2B-${new Date().getFullYear()}-${timestamp}${random}`;

      const contract = await tx.b2bContract.create({
        data: { leadId, contractNumber, ...data },
      });

      await tx.b2bLead.update({
        where: { id: leadId },
        data: { status: LeadStatus.WON },
      });

      return contract;
    });
  }

  // Admin: delete lead (cascade quotes)
  async deleteLead(id: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.b2bQuote.deleteMany({ where: { leadId: id } });
      // Delete contracts + machine assignments
      const contracts = await tx.b2bContract.findMany({ where: { leadId: id }, select: { id: true } });
      for (const c of contracts) {
        await tx.machineAssignment.deleteMany({ where: { contractId: c.id } });
      }
      await tx.b2bContract.deleteMany({ where: { leadId: id } });
      return tx.b2bLead.delete({ where: { id } });
    });
  }

  // Admin: assign machine to contract
  async assignMachine(
    contractId: string,
    data: {
      machineModel: string;
      serialNumber?: string;
      location?: string;
    },
  ) {
    return this.prisma.machineAssignment.create({
      data: { contractId, ...data },
    });
  }
}
