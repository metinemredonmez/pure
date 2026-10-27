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
  source: 'live' | 'cache' | 'none';
  fetchedAt: string;
}

const CACHE_KEY = 'google_reviews:v1';
const CACHE_TTL_SECONDS = 6 * 60 * 60; // 6h

// Google'dan veri alınamazsa boş liste döner — uydurma (mock) yorum gösterilmez.
// Önceden 5 sahte yorum "Google yorumu" gibi sitede yayınlanıyordu.
const noReviews = (): GoogleReviewsResponse => ({
  reviews: [],
  rating: null,
  reviewCount: null,
  source: 'none',
  fetchedAt: new Date().toISOString(),
});

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
      this.logger.warn('GOOGLE_PLACES_API_KEY or GOOGLE_PLACE_ID missing — no Google reviews');
      return noReviews();
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
        return noReviews();
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
      return noReviews();
    }
  }

  async clearCache(): Promise<void> {
    await this.redis.set(CACHE_KEY, null as any, 1);
  }
}
