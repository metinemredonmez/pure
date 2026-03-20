import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UploadService } from '../../common/services/upload.service';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly uploadService: UploadService,
  ) {}

  // ══════════════════════════════════════════════
  // ADDRESS ENDPOINTS
  // ══════════════════════════════════════════════

  @Get('me/addresses')
  @ApiOperation({ summary: 'Get all addresses' })
  getAddresses(@CurrentUser('id') userId: string) {
    return this.userService.getAddresses(userId);
  }

  @Get('me/addresses/:id')
  @ApiOperation({ summary: 'Get address by ID' })
  getAddress(
    @CurrentUser('id') userId: string,
    @Param('id') addressId: string,
  ) {
    return this.userService.getAddress(userId, addressId);
  }

  @Post('me/addresses')
  @ApiOperation({ summary: 'Create new address' })
  createAddress(@CurrentUser('id') userId: string, @Body() data: any) {
    return this.userService.createAddress(userId, data);
  }

  @Put('me/addresses/:id')
  @ApiOperation({ summary: 'Update address' })
  updateAddress(
    @CurrentUser('id') userId: string,
    @Param('id') addressId: string,
    @Body() data: any,
  ) {
    return this.userService.updateAddress(userId, addressId, data);
  }

  @Delete('me/addresses/:id')
  @ApiOperation({ summary: 'Delete address' })
  deleteAddress(
    @CurrentUser('id') userId: string,
    @Param('id') addressId: string,
  ) {
    return this.userService.deleteAddress(userId, addressId);
  }

  @Patch('me/addresses/:id/default')
  @ApiOperation({ summary: 'Set address as default' })
  setDefaultAddress(
    @CurrentUser('id') userId: string,
    @Param('id') addressId: string,
  ) {
    return this.userService.setDefaultAddress(userId, addressId);
  }

  // ══════════════════════════════════════════════
  // WISHLIST ENDPOINTS
  // ══════════════════════════════════════════════

  @Get('me/wishlist')
  @ApiOperation({ summary: 'Get wishlist' })
  getWishlist(@CurrentUser('id') userId: string) {
    return this.userService.getWishlist(userId);
  }

  @Post('me/wishlist/:productId')
  @ApiOperation({ summary: 'Add product to wishlist' })
  addToWishlist(
    @CurrentUser('id') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.userService.addToWishlist(userId, productId);
  }

  @Delete('me/wishlist/:productId')
  @ApiOperation({ summary: 'Remove product from wishlist' })
  removeFromWishlist(
    @CurrentUser('id') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.userService.removeFromWishlist(userId, productId);
  }

  @Get('me/wishlist/:productId/check')
  @ApiOperation({ summary: 'Check if product is in wishlist' })
  async isInWishlist(
    @CurrentUser('id') userId: string,
    @Param('productId') productId: string,
  ) {
    const inWishlist = await this.userService.isInWishlist(userId, productId);
    return { inWishlist };
  }

  // ══════════════════════════════════════════════
  // PROFILE ENDPOINTS
  // ══════════════════════════════════════════════

  @Patch('me/profile')
  @ApiOperation({ summary: 'Update profile' })
  updateProfile(@CurrentUser('id') userId: string, @Body() data: any) {
    return this.userService.updateProfile(userId, data);
  }

  @Post('me/avatar')
  @ApiOperation({ summary: 'Upload avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const uploaded = await this.uploadService.uploadImage(file, {
      entityType: 'avatar',
      entityId: userId,
      uploadedBy: userId,
      maxWidth: 400,
      maxHeight: 400,
    });

    // Update user avatar
    await this.userService.updateProfile(userId, {
      avatar: uploaded.url ?? undefined,
    });

    return uploaded;
  }
}
