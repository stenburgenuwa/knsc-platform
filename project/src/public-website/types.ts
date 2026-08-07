export interface HomePageStats {
  totalClubs: number;
  totalPlayers: number;
  totalMatches: number;
  goalsScoredTotal: number;
  leagueLeader: { clubName: string; clubLogo: string; points: number };
  topScorer: { playerName: string; clubName: string; goals: number };
}

export interface FixtureCardData {
  id: string;
  homeClub: { name: string; logo: string };
  awayClub: { name: string; logo: string };
  venue: string;
  kickoffTime: string;
  date: string;
  competition: string;
  round: string;
  assignedReferee?: string;
  status: 'upcoming' | 'live' | 'completed';
}

export interface ResultCardData {
  id: string;
  homeClub: { name: string; logo: string };
  awayClub: { name: string; logo: string };
  homeScore: number;
  awayScore: number;
  venue: string;
  date: string;
  competition: string;
  goalscorers: Array<{ playerName: string; minute: number; clubName: string }>;
  yellowCards: number;
  redCards: number;
  hasMatchReport: boolean;
}

export interface LeagueStandingsRow {
  position: number;
  clubLogo: string;
  clubName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: string;
}

export interface ClubCardData {
  id: string;
  logo: string;
  banner: string;
  name: string;
  league: string;
  homeGround: string;
  manager: string;
  founded: number;
  colours: string;
}

export interface ClubProfileData {
  id: string;
  name: string;
  logo: string;
  banner: string;
  homeGround: string;
  manager: string;
  founded: number;
  colours: string;
  history: string;
  squad: Array<{ id: string; name: string; position: string; number: number; photo: string }>;
  fixtures: FixtureCardData[];
  results: ResultCardData[];
  statistics: { played: number; won: number; drawn: number; lost: number; goalsFor: number };
  leaguePosition: number;
  topScorer: { playerName: string; goals: number };
  gallery: Array<{ id: string; url: string; caption: string }>;
}

export interface PlayerCardData {
  id: string;
  photo: string;
  name: string;
  club: string;
  position: string;
  jerseyNumber: number;
}

export interface PlayerProfileData {
  id: string;
  photo: string;
  name: string;
  registrationNumber: string;
  club: string;
  position: string;
  height: number;
  weight: number;
  preferredFoot: 'left' | 'right' | 'both';
  age: number;
  statistics: {
    matchesPlayed: number;
    goals: number;
    yellowCards: number;
    redCards: number;
  };
}

export interface MatchReportData {
  id: string;
  fixtureId: string;
  homeClub: string;
  awayClub: string;
  homeScore: number;
  awayScore: number;
  venue: string;
  date: string;
  competition: string;
  referee: string;
  goalscorers: Array<{ playerName: string; minute: number; type: 'goal' | 'own goal'; clubName: string }>;
  yellowCards: Array<{ playerName: string; minute: number; reason: string; clubName: string }>;
  redCards: Array<{ playerName: string; minute: number; reason: string; clubName: string }>;
  substitutions: Array<{ inPlayer: string; outPlayer: string; minute: number; clubName: string }>;
  summary: string;
  comments: string;
}

export interface NewsArticleData {
  id: string;
  title: string;
  category: 'league' | 'club' | 'transfers' | 'announcements' | 'events' | 'community';
  image: string;
  author: string;
  date: string;
  content: string;
  relatedArticles: Array<{ id: string; title: string; image: string }>;
}

export interface SponsorData {
  id: string;
  logo: string;
  name: string;
  description: string;
  website: string;
  category: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  caption: string;
  category: 'match' | 'club' | 'player' | 'ceremony' | 'community' | 'training';
  date: string;
}

export interface SearchResult {
  type: 'player' | 'club' | 'fixture' | 'result' | 'news' | 'report' | 'sponsor';
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  url: string;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
