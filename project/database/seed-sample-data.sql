-- Create sample data for KNSCL Platform
-- Run this after: npx prisma migrate dev

-- Insert Leagues
INSERT INTO "League" (id, name, description, "startDate", "endDate", status) VALUES
('league-1', 'Kenya National Sub County League 2026', 'Official league', '2026-01-01', '2026-12-31', 'ACTIVE');

-- Insert Clubs
INSERT INTO "Club" (id, name, "leagueId", "homeGround", manager, founded, colours, status) VALUES
('club-1', 'AFC Leopards', 'league-1', 'Kasarani Stadium', 'Patrick Aussems', 1964, 'Yellow and Blue', 'ACTIVE'),
('club-2', 'Gor Mahia', 'league-1', 'Moi International Sports Centre', 'Mark Harrison', 1968, 'Green and White', 'ACTIVE'),
('club-3', 'Kaizer Chiefs', 'league-1', 'FKF Arena', 'Arthur Zwane', 1970, 'Gold and Black', 'ACTIVE'),
('club-4', 'Orlando Pirates', 'league-1', 'Orlando Stadium', 'Jose Riveiro', 1937, 'Black and White', 'ACTIVE'),
('club-5', 'Tusker FC', 'league-1', 'Moi Stadium', 'John Kamau', 1975, 'Red and White', 'ACTIVE'),
('club-6', 'Kariobangi Sharks', 'league-1', 'Ruaraka Grounds', 'William Muluya', 2011, 'Blue and White', 'ACTIVE'),
('club-7', 'Kenya Police', 'league-1', 'Ruaraka Grounds', 'David Ouma', 1987, 'Green and White', 'ACTIVE'),
('club-8', 'Nzoia Sugar', 'league-1', 'Sudi Stadium', 'Francis Kimanzi', 2006, 'Purple and White', 'ACTIVE');

-- Insert Players
INSERT INTO "Player" (id, name, "clubId", position, "jerseyNumber", "dateOfBirth", approved, goals, "yellowCards", "redCards") VALUES
('player-1', 'Harambee Stars', 'club-1', 'FORWARD', 10, '1995-05-15', true, 12, 2, 0),
('player-2', 'Collins Shivachi', 'club-1', 'MIDFIELDER', 7, '1998-03-22', true, 8, 1, 0),
('player-3', 'Jackson Macharia', 'club-1', 'DEFENDER', 4, '2000-01-10', true, 1, 3, 0),
('player-4', 'Samuel Opiyo', 'club-2', 'FORWARD', 9, '1996-07-12', true, 11, 2, 0),
('player-5', 'Vincent Oburu', 'club-2', 'MIDFIELDER', 8, '1999-02-28', true, 5, 0, 0),
('player-6', 'Wanyama Kipchoge', 'club-2', 'DEFENDER', 3, '2001-06-05', true, 0, 4, 1),
('player-7', 'Themba Zwane', 'club-3', 'FORWARD', 11, '1994-09-20', true, 14, 1, 0),
('player-8', 'Khama Billiat', 'club-3', 'MIDFIELDER', 16, '1990-04-18', true, 7, 2, 0),
('player-9', 'Happy Jele', 'club-3', 'DEFENDER', 5, '1992-11-30', true, 2, 5, 1),
('player-10', 'Innocent Maela', 'club-4', 'DEFENDER', 20, '1993-08-14', true, 0, 6, 0),
('player-11', 'Thabiso Monyane', 'club-4', 'MIDFIELDER', 15, '1997-12-25', true, 4, 1, 0),
('player-12', 'Evidence Makgopa', 'club-4', 'FORWARD', 19, '1995-10-08', true, 10, 3, 0);

-- Insert Referees
INSERT INTO "Referee" (id, name, "leagueId", "licenseNumber", status, "yearsExperience") VALUES
('ref-1', 'John Kariuki', 'league-1', 'KEN-REF-001', 'ACTIVE', 15),
('ref-2', 'Michael Ng''eno', 'league-1', 'KEN-REF-002', 'ACTIVE', 12),
('ref-3', 'Samuel Kipchoge', 'league-1', 'KEN-REF-003', 'ACTIVE', 10),
('ref-4', 'Rose Teyie', 'league-1', 'KEN-REF-004', 'ACTIVE', 8);

-- Insert Fixtures
INSERT INTO "Fixture" (id, "leagueId", "homeClubId", "awayClubId", venue, "kickoffTime", "round", competition, status) VALUES
('fixture-1', 'league-1', 'club-1', 'club-2', 'Kasarani Stadium', '2026-08-10 15:00:00', 1, 'LEAGUE', 'UPCOMING'),
('fixture-2', 'league-1', 'club-3', 'club-4', 'FKF Arena', '2026-08-11 16:00:00', 1, 'LEAGUE', 'UPCOMING'),
('fixture-3', 'league-1', 'club-5', 'club-6', 'Moi Stadium', '2026-08-12 14:00:00', 1, 'LEAGUE', 'UPCOMING'),
('fixture-4', 'league-1', 'club-7', 'club-8', 'Ruaraka Grounds', '2026-08-13 15:30:00', 1, 'LEAGUE', 'UPCOMING'),
('fixture-5', 'league-1', 'club-1', 'club-3', 'Kasarani Stadium', '2026-08-05 15:00:00', 1, 'LEAGUE', 'COMPLETED'),
('fixture-6', 'league-1', 'club-2', 'club-4', 'Moi Centre', '2026-08-04 16:00:00', 1, 'LEAGUE', 'COMPLETED'),
('fixture-7', 'league-1', 'club-5', 'club-1', 'Moi Stadium', '2026-08-03 14:00:00', 1, 'LEAGUE', 'COMPLETED');

-- Insert Match Reports
INSERT INTO "MatchReport" (id, "fixtureId", summary, "homeGoals", "awayGoals", status) VALUES
('report-1', 'fixture-5', 'Exciting match with Leopards dominating', 2, 1, 'SUBMITTED'),
('report-2', 'fixture-6', 'Gor Mahia held Kaizer Chiefs', 1, 1, 'SUBMITTED'),
('report-3', 'fixture-7', 'Tusker FC won against Leopards', 3, 0, 'SUBMITTED');

-- Insert Announcements
INSERT INTO "Announcement" (id, "leagueId", title, content, category, "createdAt", status) VALUES
('announce-1', 'league-1', 'Season Starts', 'The 2026 KNSCL season kicks off this weekend', 'LEAGUE', NOW(), 'PUBLISHED'),
('announce-2', 'league-1', 'Fixture Update', 'All fixtures for Round 2 confirmed', 'FIXTURES', NOW(), 'PUBLISHED'),
('announce-3', 'league-1', 'Referee Appointments', 'Official referees appointed for all matches', 'REFEREE', NOW(), 'PUBLISHED');

-- Insert Sponsors
INSERT INTO "Sponsor" (id, "leagueId", name, logo, category, status) VALUES
('sponsor-1', 'league-1', 'KCB Bank', 'https://example.com/kcb.png', 'BANKING', 'ACTIVE'),
('sponsor-2', 'league-1', 'Safaricom', 'https://example.com/safaricom.png', 'TELECOM', 'ACTIVE'),
('sponsor-3', 'league-1', 'SportPesa', 'https://example.com/sportpesa.png', 'GAMING', 'ACTIVE');
