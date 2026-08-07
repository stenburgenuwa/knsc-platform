# OPERATIONS MANUAL
# KNSCL Platform - Production Operations

## System Architecture

```
Internet
   ↓
Nginx (Reverse Proxy, SSL, Compression)
   ↓
Node.js Application (Express)
   ↓
PostgreSQL Database + Redis Cache
```

## Daily Operations

### Morning Checklist (8:00 AM)
```bash
# Check application status
docker-compose ps

# Check error logs
tail -f /var/logs/knscl.log | grep ERROR

# Check database health
psql -U knscl_user -d knscl_prod -c "SELECT NOW();"

# Verify backup from previous night
ls -lh /var/backups/knscl_*.sql | tail -1
```

### During Business Hours
- Monitor error rates
- Check API response times
- Monitor database queries
- Track SMS delivery

### Evening Checklist (6:00 PM)
- Review error logs
- Verify all systems operational
- Confirm backup scheduled for night

## Weekly Tasks

### Monday 9:00 AM
```bash
# Review performance metrics
# Check disk usage: df -h
# Review error trends
# Verify backup integrity
```

### Wednesday (Mid-week)
- Security updates check
- Dependency updates review
- Database optimization

### Friday (Pre-weekend)
- Final backup verification
- Documentation updates
- Incident review

## Monthly Tasks

- Full backup restoration test
- Performance optimization review
- Security audit
- Capacity planning

## Monitoring & Alerting

### Key Metrics to Monitor

| Metric | Threshold | Action |
|--------|-----------|--------|
| CPU Usage | > 80% | Investigate processes |
| Memory Usage | > 90% | Restart services |
| Disk Usage | > 85% | Clean logs, archive data |
| API Response | > 2s | Optimize queries |
| Error Rate | > 1% | Review logs |
| DB Connections | > 80 | Check for leaks |

### Alert Configuration

Slack Webhooks:
- Critical: #knscl-critical
- Warning: #knscl-alerts
- Info: #knscl-notifications

## Database Management

### Regular Maintenance
```bash
# Weekly: Vacuum and analyze
psql -U knscl_user -d knscl_prod -c "VACUUM ANALYZE;"

# Monthly: Index rebuild
psql -U knscl_user -d knscl_prod -c "REINDEX DATABASE knscl_prod;"

# Quarterly: Full backup & restore test
```

### Performance Tuning
```bash
# Check slow queries
SELECT query, calls, mean_time FROM pg_stat_statements 
ORDER BY mean_time DESC LIMIT 10;

# Check missing indexes
SELECT schemaname, tablename, attname 
FROM pg_stat_user_tables t 
JOIN pg_attribute a ON a.attrelid = t.relid 
WHERE seq_scan > idx_scan;
```

## Backup & Recovery

### Automated Daily Backup (3:00 AM UTC)
```bash
pg_dump -U knscl_user -d knscl_prod | gzip > /var/backups/knscl_$(date +%Y%m%d).sql.gz
```

### Manual Backup
```bash
pg_dump -U knscl_user -d knscl_prod -Fc > /var/backups/knscl_manual_$(date +%Y%m%d_%H%M%S).dump
```

### Restore from Backup
```bash
# Stop application
docker-compose stop app

# Restore database
pg_restore -U knscl_user -d knscl_prod -c /var/backups/knscl_20240101.dump

# Start application
docker-compose start app

# Verify
curl -f https://knscl.ke/health
```

## Log Management

### Log Locations
- Application: `/var/logs/knscl.log`
- Docker: `docker logs knscl-app`
- Nginx: `/var/log/nginx/knscl_*.log`
- PostgreSQL: `docker logs knscl-postgres`

### Log Rotation
```bash
# Daily rotation configured in /etc/logrotate.d/knscl
/var/logs/knscl.log {
  daily
  rotate 30
  compress
  delaycompress
  missingok
  notifempty
}
```

### Viewing Logs
```bash
# Real-time logs
tail -f /var/logs/knscl.log

# Search logs
grep "ERROR" /var/logs/knscl.log

# Last hour
journalctl --since "1 hour ago" -u knscl
```

## Performance Optimization

### Database Query Optimization
```sql
-- Index critical columns
CREATE INDEX idx_fixtures_league_date ON fixtures(league_id, kickoff_time);
CREATE INDEX idx_matchreports_fixture ON matchreports(fixture_id);
CREATE INDEX idx_players_club ON players(club_id);

-- Analyze table
ANALYZE fixtures;
```

### Application Performance
```bash
# Monitor Node.js memory
watch 'ps aux | grep node'

# Check event loop lag
npm install --save-dev clinic
clinic doctor -- node dist/index.js
```

### Cache Management
```bash
# Clear Redis cache if needed
redis-cli FLUSHDB

# Monitor Redis
redis-cli INFO stats
```

## Security Operations

### Regular Security Checks

Daily:
- Review failed login attempts
- Monitor for unusual API activity
- Check for SQL injection attempts

Weekly:
- Review user access logs
- Check permission changes
- Verify SSL certificate validity

Monthly:
- Security audit
- Vulnerability scanning
- Penetration testing (quarterly)

### SSL Certificate Renewal
```bash
# Automatic renewal configured (Let's Encrypt)
# Manual renewal if needed:
certbot renew --force-renewal
systemctl reload nginx
```

## Incident Response

### Critical Issue Response
1. Alert team (Slack #critical)
2. Assess impact
3. Implement immediate fix or rollback
4. Restore service
5. Document incident
6. Post-mortem review

### Rollback Procedure
```bash
# Identify previous version
docker images knscl

# Stop current
docker-compose down

# Run previous version
docker run -d knscl:previous_version

# Restore database if needed
# Verify service
curl -f https://knscl.ke/health
```

## User Management

### Add New Administrator
```bash
docker exec knscl-app node dist/scripts/create-admin.js \
  --email=admin@knscl.ke \
  --password=secure_password
```

### Reset User Password
```bash
docker exec knscl-app node dist/scripts/reset-password.js \
  --user-id=UUID
```

### Audit User Access
```sql
SELECT * FROM audit_logs 
WHERE entity = 'user' 
ORDER BY created_at DESC 
LIMIT 100;
```

## Communication

### Deployment Notification
- Slack: #deployments
- Email: ops@knscl.ke

### Incident Notification
- Critical: All channels + SMS
- Warning: Slack channels
- Info: Slack channel only

## Escalation Procedure

Level 1 (< 1 hour downtime): Team lead
Level 2 (1-4 hours): Platform Owner
Level 3 (> 4 hours): Executive team

---

**Last Updated:** August 2026
**Maintained By:** Platform Operations Team
