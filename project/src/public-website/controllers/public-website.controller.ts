import {
  FixtureService,
  ResultService,
  StandingsService,
  ClubService,
  PlayerService,
  NewsService,
  ContentService,
} from '../services';
import { CACHE_TTL } from '../constants';
import { cacheManager } from '../utils/helpers';

export class PublicWebsiteController {
  // HOME PAGE
  static async getHomePage() {
    const cacheKey = 'homepage_data';
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;

    try {
      const [stats, upcomingFixtures, latestResults, topScorers, latestNews] = await Promise.all([
        ContentService.getHomePageStats(),
        FixtureService.getTodayFixtures(),
        ResultService.getLatestResults(3),
        PlayerService.getTopScorers(5),
        NewsService.getLatestNews(4),
      ]);

      const data = {
        stats,
        upcomingFixtures,
        latestResults,
        topScorers,
        latestNews,
        timestamp: new Date().toISOString(),
      };

      cacheManager.set(cacheKey, data, CACHE_TTL.STANDINGS);
      return data;
    } catch (error) {
      console.error('Home page error:', error);
      throw error;
    }
  }

  // FIXTURES PAGE
  static async getFixturesPage(
    page: number = 1,
    filters?: { competition?: string; round?: string; club?: string; venue?: string }
  ) {
    try {
      const { fixtures, pagination } = await FixtureService.getUpcomingFixtures(page, 12, filters);
      return { fixtures, pagination };
    } catch (error) {
      console.error('Fixtures page error:', error);
      throw error;
    }
  }

  static async getFixtureDetail(fixtureId: string) {
    try {
      const fixture = await FixtureService.getFixtureDetail(fixtureId);
      return fixture;
    } catch (error) {
      console.error('Fixture detail error:', error);
      throw error;
    }
  }

  // RESULTS PAGE
  static async getResultsPage(
    page: number = 1,
    filters?: { date?: string; competition?: string; club?: string }
  ) {
    try {
      const { results, pagination } = await ResultService.getResults(page, 12, filters);
      return { results, pagination };
    } catch (error) {
      console.error('Results page error:', error);
      throw error;
    }
  }

  static async getResultDetail(fixtureId: string) {
    try {
      const result = await ResultService.getResultDetail(fixtureId);
      return result;
    } catch (error) {
      console.error('Result detail error:', error);
      throw error;
    }
  }

  // MATCH REPORT PAGE
  static async getMatchReport(fixtureId: string) {
    try {
      const report = await ResultService.getMatchReport(fixtureId);
      return report;
    } catch (error) {
      console.error('Match report error:', error);
      throw error;
    }
  }

  // LEAGUE TABLE PAGE
  static async getLeagueTablePage() {
    const cacheKey = 'league_standings';
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;

    try {
      const standings = await StandingsService.getLeagueStandings();
      const topScorers = await StandingsService.getTopScorers(10);

      const data = { standings, topScorers };
      cacheManager.set(cacheKey, data, CACHE_TTL.STANDINGS);
      return data;
    } catch (error) {
      console.error('League table error:', error);
      throw error;
    }
  }

  // CLUBS PAGE
  static async getClubsPage(page: number = 1) {
    try {
      const { clubs, pagination } = await ClubService.getClubs(page, 12);
      return { clubs, pagination };
    } catch (error) {
      console.error('Clubs page error:', error);
      throw error;
    }
  }

  static async getClubDetail(clubId: string) {
    try {
      const club = await ClubService.getClubDetail(clubId);
      return club;
    } catch (error) {
      console.error('Club detail error:', error);
      throw error;
    }
  }

  // PLAYERS PAGE
  static async getPlayersPage(
    page: number = 1,
    filters?: { club?: string; position?: string }
  ) {
    try {
      const { players, pagination } = await PlayerService.getPlayers(page, 16, filters);
      return { players, pagination };
    } catch (error) {
      console.error('Players page error:', error);
      throw error;
    }
  }

  static async getPlayerDetail(playerId: string) {
    try {
      const player = await PlayerService.getPlayerDetail(playerId);
      return player;
    } catch (error) {
      console.error('Player detail error:', error);
      throw error;
    }
  }

  // NEWS PAGE
  static async getNewsPage(page: number = 1, category?: string) {
    try {
      const { news, pagination } = await NewsService.getNews(page, 10, category);
      return { news, pagination };
    } catch (error) {
      console.error('News page error:', error);
      throw error;
    }
  }

  static async getNewsDetail(newsId: string) {
    try {
      const article = await NewsService.getNewsDetail(newsId);
      return article;
    } catch (error) {
      console.error('News detail error:', error);
      throw error;
    }
  }

  // GALLERY PAGE
  static async getGalleryPage(category?: string, page: number = 1) {
    try {
      const { items, total } = await ContentService.getGallery(category, page, 12);
      return { items, total, page, limit: 12 };
    } catch (error) {
      console.error('Gallery page error:', error);
      throw error;
    }
  }

  // SPONSORS PAGE
  static async getSponsorsPage() {
    const cacheKey = 'sponsors_data';
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;

    try {
      const sponsors = await ContentService.getSponsors();
      cacheManager.set(cacheKey, { sponsors }, CACHE_TTL.CLUBS);
      return { sponsors };
    } catch (error) {
      console.error('Sponsors page error:', error);
      throw error;
    }
  }

  // DOWNLOADS PAGE
  static async getDownloadsPage() {
    const cacheKey = 'downloads_data';
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;

    try {
      const downloads = await ContentService.getDownloads();
      cacheManager.set(cacheKey, { downloads }, CACHE_TTL.CLUBS);
      return { downloads };
    } catch (error) {
      console.error('Downloads page error:', error);
      throw error;
    }
  }

  // CONTACT PAGE
  static async submitContact(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) {
    try {
      const result = await ContentService.submitContactForm(data);
      return result;
    } catch (error) {
      console.error('Contact form error:', error);
      throw error;
    }
  }

  // SEARCH
  static async search(query: string) {
    if (!query || query.trim().length === 0) {
      return { results: [] };
    }

    try {
      const results = await ContentService.search(query.trim(), 20);
      return { results };
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  // ABOUT PAGE
  static getAboutPage() {
    return {
      history: 'The Kenya National Sub County League was established to promote football at the county level.',
      vision: 'To be the premier football competition showcasing talent from Kenya\'s counties.',
      mission: 'To develop and promote competitive football while providing pathways to national teams.',
      objectives: [
        'Identify and develop football talent',
        'Promote fair competition',
        'Engage communities in football',
        'Support clubs and players',
      ],
      leadership: [],
      structure: 'Single league with multiple clubs competing for championship',
      partners: [],
    };
  }

  // 404 PAGE
  static getNotFoundPage() {
    return {
      title: '404 - Page Not Found',
      message: 'The page you are looking for does not exist.',
      suggestion: 'Please check the URL or navigate back to the home page.',
    };
  }

  // 500 PAGE
  static getServerErrorPage() {
    return {
      title: '500 - Server Error',
      message: 'An unexpected error occurred.',
      suggestion: 'Please try again later or contact support.',
    };
  }
}
