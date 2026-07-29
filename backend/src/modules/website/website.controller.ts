import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WebsiteService } from './website.service';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import {
  CreateFranchiseApplicationDto,
  UpdateFranchiseStatusDto,
  CreateBannerDto,
  UpdateBannerDto,
  ReorderDto,
  CreateMachineDto,
  UpdateMachineDto,
  CreateReferenceDto,
  UpdateReferenceDto,
  CreatePageDto,
  UpdatePageDto,
  UpdateSiteSettingsDto,
  CreateContactMessageDto,
  SubscribeNewsletterDto,
} from './dto/website.dto';

@ApiTags('Website')
@Controller()
export class WebsiteController {
  constructor(private readonly websiteService: WebsiteService) {}

  // ══════════════════════════════════════
  // PUBLIC ENDPOINTS
  // ══════════════════════════════════════

  @Public()
  @Get('public/banners')
  @ApiOperation({ summary: 'Get active banners' })
  getActiveBanners() {
    return this.websiteService.findActiveBanners();
  }

  @Public()
  @Get('public/machines')
  @ApiOperation({ summary: 'Get active machines' })
  getActiveMachines() {
    return this.websiteService.findActiveMachines();
  }

  @Public()
  @Get('public/machines/compare')
  @ApiOperation({ summary: 'Compare machines by slugs' })
  compareMachines(@Query('slugs') slugs: string) {
    return this.websiteService.compareMachines(slugs.split(','));
  }

  @Public()
  @Get('public/machines/:slug')
  @ApiOperation({ summary: 'Get machine by slug' })
  getMachineBySlug(@Param('slug') slug: string) {
    return this.websiteService.findMachineBySlug(slug);
  }

  // public/brands kaldırıldı — Brand modeli silindi (orphan).

  @Public()
  @Get('public/references')
  @ApiOperation({ summary: 'Get active references' })
  getActiveReferences() {
    return this.websiteService.findActiveReferences();
  }

  @Public()
  @Get('public/pages/:slug')
  @ApiOperation({ summary: 'Get published page by slug' })
  getPublishedPage(@Param('slug') slug: string) {
    return this.websiteService.findPublishedPage(slug);
  }

  @Public()
  @Get('public/site-settings')
  @ApiOperation({ summary: 'Get public site settings' })
  getPublicSettings() {
    return this.websiteService.getPublicSettings();
  }

  @Public()
  @Post('public/franchise-application')
  @ApiOperation({ summary: 'Submit franchise application form' })
  submitFranchiseApplication(@Body() dto: CreateFranchiseApplicationDto) {
    return this.websiteService.createFranchiseApplication(dto);
  }

  @Public()
  @Post('public/contact-message')
  @ApiOperation({ summary: 'Submit contact form message' })
  submitContactMessage(@Body() dto: CreateContactMessageDto) {
    return this.websiteService.submitContactMessage(dto);
  }

  // ── Newsletter (Bülten) ──

  @Public()
  @Post('public/newsletter')
  @ApiOperation({ summary: 'Subscribe to newsletter (public)' })
  subscribeNewsletter(@Body() dto: SubscribeNewsletterDto) {
    return this.websiteService.subscribeNewsletter(dto);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Get('admin/newsletter')
  @ApiOperation({ summary: 'List newsletter subscribers (admin)' })
  getNewsletterSubscribers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.websiteService.findNewsletterSubscribers({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      status,
    });
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Get('admin/newsletter/export')
  @ApiOperation({ summary: 'Export newsletter subscribers as CSV (admin)' })
  exportNewsletterSubscribers() {
    return this.websiteService.exportNewsletterSubscribers();
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Post('admin/newsletter')
  @ApiOperation({ summary: 'Add newsletter subscriber manually (admin)' })
  addNewsletterSubscriber(@Body() dto: SubscribeNewsletterDto) {
    return this.websiteService.addNewsletterSubscriber(dto);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Delete('admin/newsletter/:id')
  @ApiOperation({ summary: 'Delete newsletter subscriber (admin)' })
  deleteNewsletterSubscriber(@Param('id') id: string) {
    return this.websiteService.deleteNewsletterSubscriber(id);
  }

  // ══════════════════════════════════════
  // ADMIN ENDPOINTS
  // ══════════════════════════════════════

  // ── Banners ──

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Get('admin/banners')
  @ApiOperation({ summary: 'List all banners (admin)' })
  getAllBanners() {
    return this.websiteService.findAllBanners();
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Post('admin/banners')
  @ApiOperation({ summary: 'Create banner (admin)' })
  createBanner(@Body() dto: CreateBannerDto) {
    return this.websiteService.createBanner(dto);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Put('admin/banners/:id')
  @ApiOperation({ summary: 'Update banner (admin)' })
  updateBanner(@Param('id') id: string, @Body() dto: UpdateBannerDto) {
    return this.websiteService.updateBanner(id, dto);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Delete('admin/banners/:id')
  @ApiOperation({ summary: 'Delete banner (admin)' })
  deleteBanner(@Param('id') id: string) {
    return this.websiteService.deleteBanner(id);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Patch('admin/banners/reorder')
  @ApiOperation({ summary: 'Reorder banners (admin)' })
  reorderBanners(@Body() dto: ReorderDto) {
    return this.websiteService.reorderBanners(dto.items);
  }

  // ── Machines ──

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Get('admin/machines')
  @ApiOperation({ summary: 'List all machines (admin)' })
  getAllMachines() {
    return this.websiteService.findAllMachines();
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Post('admin/machines')
  @ApiOperation({ summary: 'Create machine (admin)' })
  createMachine(@Body() dto: CreateMachineDto) {
    return this.websiteService.createMachine(dto);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Put('admin/machines/:id')
  @ApiOperation({ summary: 'Update machine (admin)' })
  updateMachine(@Param('id') id: string, @Body() dto: UpdateMachineDto) {
    return this.websiteService.updateMachine(id, dto);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Delete('admin/machines/:id')
  @ApiOperation({ summary: 'Delete machine (admin)' })
  deleteMachine(@Param('id') id: string) {
    return this.websiteService.deleteMachine(id);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Patch('admin/machines/reorder')
  @ApiOperation({ summary: 'Reorder machines (admin)' })
  reorderMachines(@Body() dto: ReorderDto) {
    return this.websiteService.reorderMachines(dto.items);
  }

  // ── Brands kaldırıldı (orphan, web'de kullanılmıyordu) ──

  // ── References ──

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Get('admin/references')
  @ApiOperation({ summary: 'List all references (admin)' })
  getAllReferences() {
    return this.websiteService.findAllReferences();
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Post('admin/references')
  @ApiOperation({ summary: 'Create reference (admin)' })
  createReference(@Body() dto: CreateReferenceDto) {
    return this.websiteService.createReference(dto);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Put('admin/references/:id')
  @ApiOperation({ summary: 'Update reference (admin)' })
  updateReference(@Param('id') id: string, @Body() dto: UpdateReferenceDto) {
    return this.websiteService.updateReference(id, dto);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Delete('admin/references/:id')
  @ApiOperation({ summary: 'Delete reference (admin)' })
  deleteReference(@Param('id') id: string) {
    return this.websiteService.deleteReference(id);
  }

  // ── Pages ──

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Get('admin/pages')
  @ApiOperation({ summary: 'List all pages (admin)' })
  getAllPages() {
    return this.websiteService.findAllPages();
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Post('admin/pages')
  @ApiOperation({ summary: 'Create page (admin)' })
  createPage(@Body() dto: CreatePageDto) {
    return this.websiteService.createPage(dto);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Put('admin/pages/:id')
  @ApiOperation({ summary: 'Update page (admin)' })
  updatePage(@Param('id') id: string, @Body() dto: UpdatePageDto) {
    return this.websiteService.updatePage(id, dto);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Delete('admin/pages/:id')
  @ApiOperation({ summary: 'Delete page (admin)' })
  deletePage(@Param('id') id: string) {
    return this.websiteService.deletePage(id);
  }

  // ── Site Settings ──

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Get('admin/site-settings')
  @ApiOperation({ summary: 'Get all site settings (admin)' })
  getAllSettings() {
    return this.websiteService.getAllSettings();
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Put('admin/site-settings')
  @ApiOperation({ summary: 'Update site settings (admin)' })
  updateSettings(@Body() dto: UpdateSiteSettingsDto) {
    return this.websiteService.upsertSetting(dto.key, dto.value);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Put('admin/site-settings/bulk')
  @ApiOperation({ summary: 'Update multiple site settings (admin)' })
  updateMultipleSettings(@Body() dto: { settings: { key: string; value: any }[] }) {
    return this.websiteService.upsertMultipleSettings(dto.settings);
  }

  // ── Franchise Applications ──

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  @Get('admin/franchise-applications')
  @ApiOperation({ summary: 'List franchise applications (admin)' })
  getAllFranchiseApplications(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.websiteService.findAllFranchiseApplications({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      status,
    });
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  @Get('admin/franchise-applications/stats')
  @ApiOperation({ summary: 'Franchise application stats (admin)' })
  getFranchiseStats() {
    return this.websiteService.getFranchiseStats();
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  @Get('admin/franchise-applications/:id')
  @ApiOperation({ summary: 'Get franchise application detail (admin)' })
  getFranchiseApplication(@Param('id') id: string) {
    return this.websiteService.findFranchiseApplication(id);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Patch('admin/franchise-applications/:id/status')
  @ApiOperation({ summary: 'Update franchise application status (admin)' })
  updateFranchiseStatus(@Param('id') id: string, @Body() dto: UpdateFranchiseStatusDto) {
    return this.websiteService.updateFranchiseStatus(id, dto);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Delete('admin/franchise-applications/:id')
  @ApiOperation({ summary: 'Delete franchise application (admin)' })
  deleteFranchiseApplication(@Param('id') id: string) {
    return this.websiteService.deleteFranchiseApplication(id);
  }

  // ── Contact Messages (Admin) ──

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  @Get('admin/contact-messages')
  @ApiOperation({ summary: 'List contact messages (admin)' })
  getAllContactMessages(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.websiteService.findAllContactMessages({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Get('admin/contact-messages/:id')
  @ApiOperation({ summary: 'Get contact message detail (admin)' })
  getContactMessage(@Param('id') id: string) {
    return this.websiteService.findContactMessage(id);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Delete('admin/contact-messages/:id')
  @ApiOperation({ summary: 'Delete contact message (admin)' })
  deleteContactMessage(@Param('id') id: string) {
    return this.websiteService.deleteContactMessage(id);
  }
}
