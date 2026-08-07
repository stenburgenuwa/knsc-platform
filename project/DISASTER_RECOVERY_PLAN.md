# DISASTER RECOVERY PLAN
# KNSCL Platform

## Recovery Objectives

- **RTO (Recovery Time Objective):** < 2 hours
- **RPO (Recovery Point Objective):** < 24 hours
- **Service Level Target:** 99.5% uptime

## Disaster Scenarios

### Scenario 1: Database Failure

**Impact:** Complete data loss, application unusable

**Detection:**
- Application logs show "Connection refused"
- Health check fails
- Users report can't login

**Recovery Steps:**

1. **Identify Latest Backup**
   ```bash
   ls -lh /var/backups/knscl_*.sql.gz | tail -5
   ```

2. **Stop Application**
   ```bash
   docker-compose stop app
   ```

3. **Restore Database**
   ```bash
   gunzip < /var/backups/knscl_20240101.sql.gz | \
   psql -U knscl_user -d knscl_prod
   ```

4. **Verify Database**
   ```bash
   psql -U knscl_user -d knscl_prod -c "SELECT COUNT(*) FROM users;"
   ```

5. **Start Application**
   ```bash
   docker-compose start app
   ```

6. **Health Check**
   ```bash
   curl -f https://knscl.ke/health
   ```

**Time Estimate:** 15-30 minutes

---

### Scenario 2: Server Failure

**Impact:** Complete application unavailable

**Detection:**
- DNS resolves but no response
- SSH connection refused
- Monitoring alerts

**Recovery Steps:**

1. **Assess Hardware**
   - Check physical hardware
   - Check network connectivity
   - Contact hosting provider if cloud

2. **Provision New Server**
   - Request replacement instance
   - Restore from machine backup
   - Or: Manual deployment on new server

3. **Restore Application**
   ```bash
   git clone https://github.com/knscl/platform.git
   cd platform
   docker-compose up -d
   ```

4. **Restore Database**
   ```bash
   # Restore from backup
   gunzip < /var/backups/knscl_20240101.sql.gz | \
   psql -U knscl_user -d knscl_prod
   ```

5. **Restore Files**
   ```bash
   # Restore uploads
   rsync -av /var/backups/uploads/ /var/knscl/uploads/
   ```

6. **DNS Update**
   - Point domain to new IP
   - Wait for propagation (< 10 minutes)

**Time Estimate:** 1-2 hours

---

### Scenario 3: Ransomware/Data Breach

**Impact:** Data encrypted or compromised

**Detection:**
- Unusual file encryption
- Security alert from monitoring
- Ransom note

**Immediate Actions:**

1. **Isolate System**
   ```bash
   # Disconnect from network
   # Stop all services
   docker-compose down
   ```

2. **Alert Team**
   - Notify security team
   - Alert management
   - Do NOT pay ransom

3. **Preserve Evidence**
   ```bash
   # Create forensic image
   dd if=/dev/sda of=/external/forensic.img
   ```

4. **Restore from Backup**
   - Boot from clean backup
   - Restore database from offline backup
   - Restore files from secure backup

5. **Verify Clean State**
   ```bash
   # Run antivirus scan
   # Verify file integrity
   # Check system logs
   ```

6. **Communicate**
   - Affected users notification
   - Regulatory compliance (if required)
   - Public statement

**Time Estimate:** 2-4 hours + Investigation

---

### Scenario 4: Application Crash

**Impact:** Service unavailable, data integrity maintained

**Detection:**
- Health check fails
- Docker container exits
- Error logs show crash

**Recovery Steps:**

1. **Check Logs**
   ```bash
   docker logs knscl-app --tail 100
   ```

2. **Identify Issue**
   - Memory leak?
   - Database connection issue?
   - Code bug?

3. **Quick Fix**
   ```bash
   # Restart application
   docker-compose restart app
   
   # Verify
   curl -f https://knscl.ke/health
   ```

4. **If Restart Doesn't Work**
   ```bash
   # Rollback to previous version
   docker run -d knscl:previous_version
   
   # Investigate crashed version
   # Fix bug
   # Deploy fixed version
   ```

**Time Estimate:** 5-15 minutes

---

### Scenario 5: Storage Failure

**Impact:** Files lost (uploads, photos, reports)

**Detection:**
- Upload failures
- Missing images on website
- Disk read errors

**Recovery Steps:**

1. **Identify Lost Files**
   ```bash
   # Check backup
   ls -l /var/backups/uploads_20240101/
   ```

2. **Restore Files**
   ```bash
   # Restore from backup
   rsync -av /var/backups/uploads_20240101/ /var/knscl/uploads/
   
   # Or: Restore from S3 (if configured)
   aws s3 sync s3://knscl-backups/uploads/ /var/knscl/uploads/
   ```

3. **Verify**
   ```bash
   # Check file count
   find /var/knscl/uploads -type f | wc -l
   
   # Verify file integrity
   md5sum -c /var/backups/uploads.checksums
   ```

**Time Estimate:** 10-30 minutes (depends on file size)

---

## Backup Verification Checklist

**Monthly (1st of month):**
- [ ] Restore latest database backup to test environment
- [ ] Verify all tables present
- [ ] Run integrity check
- [ ] Verify file backups
- [ ] Document backup size
- [ ] Estimate restore time

**Test Checklist:**
```bash
# Create test database
createdb knscl_test

# Restore backup
gunzip < /var/backups/knscl_20240101.sql.gz | \
psql -U knscl_user -d knscl_test

# Verify tables
psql -U knscl_user -d knscl_test -c "\dt"

# Count rows
psql -U knscl_user -d knscl_test -c \
"SELECT COUNT(*) FROM users; \
SELECT COUNT(*) FROM fixtures; \
SELECT COUNT(*) FROM matchreports;"

# Drop test database
dropdb knscl_test
```

## Communication Plan

### During Disaster

**Immediately (< 5 min):**
- Alert response team
- Slack: #critical-incident
- Status page: "Investigating"

**Every 15 minutes:**
- Update status page
- Send update to team
- Assess progress

**Every hour:**
- Public update
- Customer notification
- ETA for recovery

### After Recovery

**Post-Incident (1 day):**
- Full status report
- Root cause analysis
- Impact assessment

**Post-Incident (1 week):**
- Corrective actions
- Improvements implemented
- Team debriefing

## Responsibilities

| Role | Responsibility |
|------|-----------------|
| **Ops Manager** | Declare disaster, activate plan |
| **DB Admin** | Database restoration, verification |
| **Sys Admin** | Server/infrastructure recovery |
| **App Dev** | Application debugging, rollback |
| **Comms** | User communication, status updates |
| **Security** | Incident investigation, response |

## Testing Schedule

- **Monthly:** Database restore test
- **Quarterly:** Full system disaster recovery drill
- **Annually:** Ransomware recovery simulation

---

**Last Updated:** August 2026
**Next Drill:** Q4 2026
**Plan Owner:** Platform Operations Manager
