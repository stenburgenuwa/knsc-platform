// Main module exports
export { FixtureService } from './services/fixture.service';
export { ResultService } from './services/result.service';
export { StandingsService } from './services/standings.service';
export { ClubService } from './services/club.service';
export { PlayerService } from './services/player.service';
export { NewsService } from './services/news.service';
export { ContentService } from './services/content.service';

// Types
export * from './types';

// Constants
export * from './constants';

// Utils
export { ImageOptimizer, SEOUtils, PerformanceMonitor, ErrorHandler, ValidationUtils, DateUtils } from './utils/helpers';
export { ApiClient, type ApiResponse } from './utils/api-client';

// Cache manager
export { cacheManager } from './utils/helpers';
