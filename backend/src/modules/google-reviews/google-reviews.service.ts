import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../common/services/redis.service';

export interface GoogleReview {
  author: string;
  rating: number;
  text: string;
  time: string;
  profilePhoto?: string;
}

export interface GoogleReviewsResponse {
  reviews: GoogleReview[];
  rating: number | null;
  reviewCount: number | null;
  source: 'live' | 'cache' | 'mock';
  fetchedAt: string;
}

const CACHE_KEY = 'google_reviews:v1';
const CACHE_TTL_SECONDS = 6 * 60 * 60; // 6h

// Fallback / mock — used when API key or Place ID is not configured.
const MOCK_REVIEWS: GoogleReview[] = [
  { author: 'Mehmet Y.', rating: 5, text: 'Harika kahve! Taze kavrulmuş, aromatik ve lezzet dolu. Kesinlikle tavsiye ederim.', time: '2 hafta önce' },
  { author: 'Ayşe K.', rating: 5, text: 'Türk kahvesinin en iyisi! Köpüğü bile mükemmel. Siparişi hızlı geldi.', time: '1 ay önce' },
  { author: 'Ali R.', rating: 5, text: 'Uzun süredir en iyi kahveyi arıyordum, Pure Olentia ile buldum.', time: '1 ay önce' },
  { author: 'Fatma S.', rating: 5, text: 'Abonelik sistemi çok pratik, her ay taze kahvem kapıda.', time: '2 ay önce' },
  { author: 'Can D.', rating: 5, text: 'Ofis için toplu sipariş verdik, herkes bayıldı.', time: '2 ay önce' },
];

@Injectable()
export class GoogleReviewsService {
  private readonly logger = new Logger(GoogleReviewsService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly redis: RedisService,
  ) {}

  async getReviews(force = false): Promise<GoogleReviewsResponse> {
    if (!force) {
      const cached = await this.redis.get<GoogleReviewsResponse>(CACHE_KEY);
      if (cached) return { ...cached, source: 'cache' };
    }

    const apiKey = this.config.get<string>('GOOGLE_PLACES_API_KEY') || process.env.GOOGLE_PLACES_API_KEY;
    const placeId = this.config.get<string>('GOOGLE_PLACE_ID') || process.env.GOOGLE_PLACE_ID;

    if (!apiKey || !placeId) {
      this.logger.warn('GOOGLE_PLACES_API_KEY or GOOGLE_PLACE_ID missing — returning mock reviews');
      return {
        reviews: MOCK_REVIEWS,
        rating: 5.0,
        reviewCount: MOCK_REVIEWS.length,
        source: 'mock',
        fetchedAt: new Date().toISOString(),
      };
    }

    try {
      const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'reviews,rating,userRatingCount',
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const text = await res.text();
        this.logger.error(`Places API error ${res.status}: ${text.slice(0, 300)}`);
        return {
          reviews: MOCK_REVIEWS,
          rating: 5.0,
          reviewCount: MOCK_REVIEWS.length,
          source: 'mock',
          fetchedAt: new Date().toISOString(),
        };
      }

      const data = (await res.json()) as any;

      const reviews: GoogleReview[] = (data.reviews || []).map((r: any) => ({
        author: r.authorAttribution?.displayName || 'Google kullanıcısı',
        rating: typeof r.rating === 'number' ? r.rating : 5,
        text: r.text?.text || r.originalText?.text || '',
        time: r.relativePublishTimeDescription || '',
        profilePhoto: r.authorAttribution?.photoUri,
      }));

      const response: GoogleReviewsResponse = {
        reviews,
        rating: typeof data.rating === 'number' ? data.rating : null,
        reviewCount: typeof data.userRatingCount === 'number' ? data.userRatingCount : null,
        source: 'live',
        fetchedAt: new Date().toISOString(),
      };

      await this.redis.set(CACHE_KEY, response, CACHE_TTL_SECONDS);
      return response;
    } catch (error: any) {
      this.logger.error(`Failed to fetch Google reviews: ${error?.message || error}`);
      return {
        reviews: MOCK_REVIEWS,
        rating: 5.0,
        reviewCount: MOCK_REVIEWS.length,
        source: 'mock',
        fetchedAt: new Date().toISOString(),
      };
    }
  }

  async clearCache(): Promise<void> {
    await this.redis.set(CACHE_KEY, null as any, 1);
  }
}
