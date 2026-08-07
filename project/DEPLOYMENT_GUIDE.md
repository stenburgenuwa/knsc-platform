# DEPLOYMENT GUIDE
# KNSCL Platform - Production Deployment

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Docker & Docker Compose
- Nginx (reverse proxy)
- SSL Certificate
- Domain configured

## Pre-Deployment Checklist

- [ ] All tests passing (npm test)
- [ ] Build succeeds (npm run build)
- [ ] Environment variables configured
- [ ] Database backups verified
- [ ] SSL certificate obtained
- [ ] Domain DNS configured
- [ ] Monitoring configured
- [ ] Logging aggregation ready

## Step 1: Prepare Infrastructure

```bash
# Create deployment directories
mkdir -p /var/knscl/{uploads,logs,backups}
mkdir -p /etc/knscl

# Copy environment configuration
cp .env.production /etc/knscl/.env
# EDIT: /etc/knscl/.env with production values
```

## Step 2: Setup Database

```bash
# Create database
createdb knscl_prod

# Run migrations
DATABASE_URL=postgresql://user:pass@localhost/knscl_prod npx prisma migrate deploy

# Seed initial data
npm run seed:production
```

## Step 3: Build Docker Image

```bash
docker build -t knscl:latest .
docker tag knscl:latest knscl:1.0.0
```

## Step 4: Deploy with Docker Compose

```bash
# Start services
docker-compose -f docker-compose.yml up -d

# Verify services
docker-compose ps
docker logs knscl-app
```

## Step 5: Configure Nginx

```bash
# Copy configuration
sudo cp nginx.conf /etc/nginx/sites-available/knscl

# Enable site
sudo ln -s /etc/nginx/sites-available/knscl /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## Step 6: Verify Deployment

```bash
# Health check
curl https://knscl.ke/health

# Test API
curl -X GET https://api.knscl.ke/api/health

# Test authentication
curl -X POST https://api.knscl.ke/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

## Step 7: Enable Monitoring & Logging

```bash
# Configure Sentry for error tracking
export SENTRY_DSN=your_sentry_dsn

# Enable log aggregation
# Configure ELK, Datadog, or equivalent

# Setup application monitoring
npm run setup:monitoring
```

## Step 8: Setup Backups

```bash
# Create backup script
cp scripts/backup.sh /etc/cron.daily/knscl-backup
chmod +x /etc/cron.daily/knscl-backup
```

## Post-Deployment Verification

### Immediate (First Hour)
- [ ] Login as Platform Owner
- [ ] Login as League Manager
- [ ] Check public website
- [ ] Verify API endpoints
- [ ] Check SMS notifications

### Daily (First Week)
- [ ] Monitor error rates
- [ ] Check backup completion
- [ ] Verify database connectivity
- [ ] Monitor performance metrics

### Weekly
- [ ] Review logs
- [ ] Analyze performance
- [ ] Check backup integrity
- [ ] Update security patches

## Rollback Procedure

If critical issues occur:

```bash
# Stop current deployment
docker-compose down

# Restore previous version
docker run -d knscl:previous_version

# Restore database from backup
psql knscl_prod < /var/backups/knscl_$(date -d yesterday +%Y%m%d).sql
```

## Troubleshooting

### Application won't start
```bash
docker logs knscl-app
# Check database connectivity
# Check environment variables
```

### Database connection failed
```bash
# Verify DATABASE_URL
# Check PostgreSQL service: systemctl status postgresql
# Verify credentials
```

### SSL certificate issues
```bash
# Verify certificate path in nginx.conf
# Test SSL: openssl s_client -connect knscl.ke:443
```

## Support

For deployment issues:
1. Check logs: `docker logs knscl-app`
2. Verify configuration: `cat /etc/knscl/.env`
3. Test connectivity: `curl -v https://knscl.ke`
4. Check system resources: `df -h`, `free -h`

---

**Deployment Complete** ✅

The KNSCL Platform is now running in production.
