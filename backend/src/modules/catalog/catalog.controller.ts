import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import {
  CreateProductDto,
  UpdateProductDto,
  CreateVariantDto,
} from './dto/product.dto';
import { CreateCategoryDto, CreateCollectionDto } from './dto/catalog.dto';
import { PaginationDto } from '../../common/pipes/pagination.pipe';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Catalog')
@Controller()
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  // ── Public storefront endpoints ──

  @Public()
  @Get('products')
  @ApiOperation({ summary: 'List products (public)' })
  findAll(@Query() query: PaginationDto) {
    return this.catalogService.findAll(query);
  }

  @Public()
  @Get('products/:slug')
  @ApiOperation({ summary: 'Get product by slug (public)' })
  findBySlug(@Param('slug') slug: string) {
    return this.catalogService.findBySlug(slug);
  }

  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'List categories (public)' })
  findAllCategories() {
    return this.catalogService.findAllCategories();
  }

  @Public()
  @Get('collections')
  @ApiOperation({ summary: 'List collections (public)' })
  findAllCollections() {
    return this.catalogService.findAllCollections();
  }

  // ── Admin endpoints ──

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Get('admin/products')
  @ApiOperation({ summary: 'List products (admin)' })
  findAllAdmin(@Query() query: PaginationDto) {
    return this.catalogService.findAll(query, true);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Get('admin/products/:id')
  @ApiOperation({ summary: 'Get product by id (admin)' })
  findOneAdmin(@Param('id') id: string) {
    return this.catalogService.findById(id);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Post('admin/products')
  @ApiOperation({ summary: 'Create product (admin)' })
  create(@Body() dto: CreateProductDto) {
    return this.catalogService.create(dto);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Put('admin/products/:id')
  @ApiOperation({ summary: 'Update product (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.catalogService.update(id, dto);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Delete('admin/products/:id')
  @ApiOperation({ summary: 'Delete product (admin)' })
  delete(@Param('id') id: string) {
    return this.catalogService.delete(id);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Post('admin/products/:id/variants')
  @ApiOperation({ summary: 'Add product variant (admin)' })
  addVariant(@Param('id') id: string, @Body() dto: CreateVariantDto) {
    return this.catalogService.addVariant(id, dto);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Post('admin/categories')
  @ApiOperation({ summary: 'Create category (admin)' })
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.catalogService.createCategory(dto);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Put('admin/categories/:id')
  @ApiOperation({ summary: 'Update category (admin)' })
  updateCategory(@Param('id') id: string, @Body() dto: any) {
    return this.catalogService.updateCategory(id, dto);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Delete('admin/categories/:id')
  @ApiOperation({ summary: 'Delete category (admin)' })
  deleteCategory(@Param('id') id: string) {
    return this.catalogService.deleteCategory(id);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Post('admin/collections')
  @ApiOperation({ summary: 'Create collection (admin)' })
  createCollection(@Body() dto: CreateCollectionDto) {
    return this.catalogService.createCollection(dto);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Put('admin/collections/:id')
  @ApiOperation({ summary: 'Update collection (admin)' })
  updateCollection(@Param('id') id: string, @Body() dto: any) {
    return this.catalogService.updateCollection(id, dto);
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @Delete('admin/collections/:id')
  @ApiOperation({ summary: 'Delete collection (admin)' })
  deleteCollection(@Param('id') id: string) {
    return this.catalogService.deleteCollection(id);
  }
}
