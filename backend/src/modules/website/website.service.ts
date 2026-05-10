import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class WebsiteService {
  constructor(
    private prisma: PrismaService,
    private notification: NotificationService,
    private config: ConfigService,
  ) {}

  // ── Contact Message ──

  async submitContactMessage(data: {
    name: string;
    email: string;
    message: string;
    phone?: string;
    subject?: string;
  }) {
    const adminEmail =
      this.config.get<string>('CONTACT_INBOX_EMAIL') ||
      this.config.get<string>('smtp.from') ||
      'hello@pureolentia.com';

    const subject = data.subject
      ? `[Pure Olentia İletişim] ${data.subject}`
      : `[Pure Olentia İletişim] ${data.name} mesaj gönderdi`;

    const html = `
      <h2>Yeni İletişim Mesajı</h2>
      <p><strong>Ad Soyad:</strong> ${data.name}</p>
      <p><strong>E-posta:</strong> ${data.email}</p>
      ${data.phone ? `<p><strong>Telefon:</strong> ${data.phone}</p>` : ''}
      ${data.subject ? `<p><strong>Konu:</strong> ${data.subject}</p>` : ''}
      <p><strong>Mesaj:</strong></p>
      <p>${(data.message || '').replace(/\n/g, '<br/>')}</p>
      <hr/>
      <small>Bu mesaj pureolentia.com iletişim formundan gönderilmiştir.</small>
    `;

    try {
      await this.notification.sendEmail(adminEmail, subject, html);
    } catch (e) {
      // log only — do not fail the request if SMTP is misconfigured
    }

    // Save to DB
    try {
      await this.prisma.contactMessage.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          subject: data.subject,
          message: data.message,
        },
      });
    } catch {}

    return { success: true, message: 'Mesajınız iletildi.' };
  }

  async findAllContactMessages(params?: { page?: number; limit?: number }) {
    const take = params?.limit || 20;
    const skip = params?.page ? (params.page - 1) * take : 0;

    const [data, total] = await Promise.all([
      this.prisma.contactMessage.findMany({
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      this.prisma.contactMessage.count(),
    ]);

    return { data, total, page: params?.page || 1, limit: take };
  }

  async findContactMessage(id: string) {
    const msg = await this.prisma.contactMessage.findUnique({ where: { id } });
    if (!msg) throw new NotFoundException('Mesaj bulunamadı');
    // Mark as read
    if (!msg.isRead) {
      await this.prisma.contactMessage.update({ where: { id }, data: { isRead: true } });
    }
    return msg;
  }

  async deleteContactMessage(id: string) {
    await this.prisma.contactMessage.delete({ where: { id } });
    return { success: true };
  }

  // ── Hero Banners ──

  async findActiveBanners() {
    const now = new Date();
    return this.prisma.heroBanner.findMany({
      where: {
        isActive: true,
        OR: [
          { startDate: null, endDate: null },
          { startDate: { lte: now }, endDate: null },
          { startDate: null, endDate: { gte: now } },
          { startDate: { lte: now }, endDate: { gte: now } },
        ],
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findAllBanners() {
    return this.prisma.heroBanner.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async createBanner(data: any) {
    return this.prisma.heroBanner.create({ data });
  }

  async updateBanner(id: string, data: any) {
    return this.prisma.heroBanner.update({ where: { id }, data });
  }

  async deleteBanner(id: string) {
    await this.prisma.heroBanner.delete({ where: { id } });
    return { message: 'Banner deleted' };
  }

  async reorderBanners(items: { id: string; sortOrder: number }[]) {
    await Promise.all(
      items.map((item) =>
        this.prisma.heroBanner.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );
    return { message: 'Banners reordered' };
  }

  // ── Machines ──

  async findActiveMachines() {
    return this.prisma.machine.findMany({
      where: { isActive: true },
      include: { modules: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findMachineBySlug(slug: string) {
    const machine = await this.prisma.machine.findUnique({
      where: { slug },
      include: { modules: true },
    });
    if (!machine) throw new NotFoundException('Machine not found');
    return machine;
  }

  async compareMachines(slugs: string[]) {
    return this.prisma.machine.findMany({
      where: { slug: { in: slugs }, isActive: true },
      include: { modules: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findAllMachines() {
    return this.prisma.machine.findMany({
      include: { modules: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createMachine(data: any) {
    const { modules, ...machineData } = data;
    return this.prisma.machine.create({
      data: {
        ...machineData,
        modules: modules?.length
          ? { create: modules }
          : undefined,
      },
      include: { modules: true },
    });
  }

  async updateMachine(id: string, data: any) {
    const { modules, ...machineData } = data;
    if (modules) {
      await this.prisma.machineModule.deleteMany({ where: { machineId: id } });
      await this.prisma.machineModule.createMany({
        data: modules.map((m: any) => ({ ...m, machineId: id })),
      });
    }
    return this.prisma.machine.update({
      where: { id },
      data: machineData,
      include: { modules: true },
    });
  }

  async deleteMachine(id: string) {
    await this.prisma.machine.delete({ where: { id } });
    return { message: 'Machine deleted' };
  }

  async reorderMachines(items: { id: string; sortOrder: number }[]) {
    await Promise.all(
      items.map((item) =>
        this.prisma.machine.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );
    return { message: 'Machines reordered' };
  }

  // ── Brands kaldırıldı: web'de hiçbir yerde kullanılmıyordu (orphan). ──
  // Brand modeli ve /admin/website/brands sayfası temizlendi.

  // ── References ──

  async findActiveReferences() {
    return this.prisma.reference.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findAllReferences() {
    return this.prisma.reference.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async createReference(data: any) {
    return this.prisma.reference.create({ data });
  }

  async updateReference(id: string, data: any) {
    return this.prisma.reference.update({ where: { id }, data });
  }

  async deleteReference(id: string) {
    await this.prisma.reference.delete({ where: { id } });
    return { message: 'Reference deleted' };
  }

  // ── Pages ──

  async findPublishedPage(slug: string) {
    const page = await this.prisma.page.findUnique({ where: { slug } });
    if (!page || !page.isPublished)
      throw new NotFoundException('Page not found');
    return page;
  }

  async findAllPages() {
    return this.prisma.page.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  async createPage(data: any) {
    return this.prisma.page.create({ data });
  }

  async updatePage(id: string, data: any) {
    return this.prisma.page.update({ where: { id }, data });
  }

  async deletePage(id: string) {
    await this.prisma.page.delete({ where: { id } });
    return { message: 'Page deleted' };
  }

  // ── Site Settings ──

  async getPublicSettings() {
    const settings = await this.prisma.siteSettings.findMany();
    return settings.reduce(
      (acc, s) => ({ ...acc, [s.key]: s.value }),
      {} as Record<string, any>,
    );
  }

  async getAllSettings() {
    const settings = await this.prisma.siteSettings.findMany();
    return settings.reduce(
      (acc, s) => ({ ...acc, [s.key]: s.value }),
      {} as Record<string, any>,
    );
  }

  async upsertSetting(key: string, value: any) {
    return this.prisma.siteSettings.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }

  async upsertMultipleSettings(settings: { key: string; value: any }[]) {
    await Promise.all(
      settings.map((s) =>
        this.prisma.siteSettings.upsert({
          where: { key: s.key },
          create: { key: s.key, value: s.value },
          update: { value: s.value },
        }),
      ),
    );
    return { message: 'Settings updated' };
  }

  // ── Franchise Applications ──

  async createFranchiseApplication(data: any) {
    return this.prisma.franchiseApplication.create({ data });
  }

  async findAllFranchiseApplications(params?: { page?: number; limit?: number; status?: string }) {
    const page = params?.page || 1;
    const limit = params?.limit || 25;
    const where: any = {};
    if (params?.status) where.status = params.status;

    const [data, total] = await Promise.all([
      this.prisma.franchiseApplication.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.franchiseApplication.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findFranchiseApplication(id: string) {
    const app = await this.prisma.franchiseApplication.findUnique({ where: { id } });
    if (!app) throw new NotFoundException('Application not found');
    return app;
  }

  async updateFranchiseStatus(id: string, data: { status: string; adminNotes?: string }) {
    return this.prisma.franchiseApplication.update({
      where: { id },
      data,
    });
  }

  async deleteFranchiseApplication(id: string) {
    await this.prisma.franchiseApplication.delete({ where: { id } });
    return { message: 'Application deleted' };
  }

  async getFranchiseStats() {
    const [total, byStatus] = await Promise.all([
      this.prisma.franchiseApplication.count(),
      this.prisma.franchiseApplication.groupBy({
        by: ['status'],
        _count: true,
      }),
    ]);
    return {
      total,
      byStatus: byStatus.reduce((acc, s) => ({ ...acc, [s.status]: s._count }), {}),
    };
  }
}
