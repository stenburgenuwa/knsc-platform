// Runs before every test file. Points integration tests at a dedicated local
// test database (never the dev or production one) unless the environment
// already overrides it — e.g. in CI.
process.env.DATABASE_URL ||= 'postgresql://postgres:postgres@localhost:5432/knscl_test';
process.env.JWT_SECRET ||= 'test-only-secret-not-for-production-use-only-here';
