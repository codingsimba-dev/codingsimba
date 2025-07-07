# Log Archival and Database Space Management Strategy

## Overview

This document outlines the comprehensive strategy for managing audit logs, preserving database space, and implementing automated cleanup processes.

## Architecture

### 1. **Database Storage (Primary)**

- **Location**: `AuditLog` table in PostgreSQL
- **Retention**: 60 days by default (configurable per log entry)
- **Indexing**: Optimized for query performance and cleanup operations
- **Size Estimation**: ~1KB per log entry on average

### 2. **File-Based Archival (Secondary)**

- **Location**: `./logs/archives/` directory
- **Format**: Compressed JSON files (`audit-logs-YYYY-MM-DD.json.gz`)
- **Compression**: Gzip compression (70-80% size reduction)
- **Retention**: Indefinite (based on storage capacity)

### 3. **External Storage Options (Tertiary)**

#### Tigris Cloud Storage (Primary)

```bash
# Tigris CLI sync
tigris sync ./logs/archives/ tigris://your-bucket/audit-logs/

# Tigris SDK integration
import { Tigris } from '@tigrisdata/tigris-client';
const tigris = new Tigris({
  project: 'your-project',
  branch: 'main',
  clientId: process.env.TIGRIS_CLIENT_ID,
  clientSecret: process.env.TIGRIS_CLIENT_SECRET,
});
```

#### Alternative Cloud Storage Options

```bash
# AWS S3
aws s3 sync ./logs/archives/ s3://your-bucket/audit-logs/

# Google Cloud Storage
gsutil -m rsync -r ./logs/archives/ gs://your-bucket/audit-logs/

# Azure Blob Storage
az storage blob upload-batch --source ./logs/archives/ --destination your-container
```

#### Dedicated Log Management

- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Splunk**
- **Datadog**
- **New Relic**

## Implementation

### 1. **Automated Cleanup Process**

```typescript
// Daily at 2 AM
export async function scheduledLogCleanup() {
  // 1. Find expired logs (>60 days)
  // 2. Archive to compressed files
  // 3. Delete from database
  // 4. Log cleanup operation
}
```

### 2. **Retention Policies**

| Log Category    | Retention Period | Archive Strategy                 |
| --------------- | ---------------- | -------------------------------- |
| Security Events | 1 year           | Compressed files + cloud storage |
| User Actions    | 60 days          | Compressed files                 |
| System Events   | 30 days          | Compressed files                 |
| Debug/Info      | 7 days           | Immediate deletion               |

### 3. **Space Management**

#### Database Optimization

```sql
-- Regular VACUUM to reclaim space
VACUUM ANALYZE "AuditLog";

-- Partition by date for large tables
CREATE TABLE audit_logs_2024_01 PARTITION OF audit_logs
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

#### File System Management

```bash
# Rotate old archives
find ./logs/archives/ -name "*.json.gz" -mtime +365 -delete

# Monitor disk usage
du -sh ./logs/archives/
```

## Deployment Options

### 1. **Script-Based Approach (Recommended)**

We use dedicated TypeScript scripts for maintenance tasks, executed via Node.js cron scheduler.

#### Scripts Structure

```
scripts/
├── cleanup-logs.ts          # Log cleanup and archival
├── database-maintenance.ts  # Database maintenance tasks
├── health-check.ts         # System health monitoring
└── README.md              # Script documentation
```

#### Package Scripts

```json
{
  "scripts": {
    "cleanup-logs": "tsx scripts/cleanup-logs.ts",
    "cleanup-logs:dry-run": "tsx scripts/cleanup-logs.ts --dry-run",
    "db:maintenance": "tsx scripts/database-maintenance.ts",
    "health-check": "tsx scripts/health-check.ts"
  }
}
```

#### Node.js Cron Scheduler

```typescript
// app/utils/scheduler.server.ts
import cron from "node-cron";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

const scheduledJobs = [
  {
    name: "log-cleanup",
    schedule: "0 2 * * *", // Daily at 2 AM UTC
    handler: async () => {
      const { stdout, stderr } = await execAsync("npm run cleanup-logs");
      console.log("Log cleanup output:", stdout);
      if (stderr) console.error("Log cleanup stderr:", stderr);
    },
    enabled: true,
    timezone: "UTC",
  },
  {
    name: "database-maintenance",
    schedule: "0 3 * * 0", // Weekly on Sunday at 3 AM UTC
    handler: async () => {
      const { stdout, stderr } = await execAsync("npm run db:maintenance");
      console.log("Database maintenance output:", stdout);
      if (stderr) console.error("Database maintenance stderr:", stderr);
    },
    enabled: true,
    timezone: "UTC",
  },
  {
    name: "health-check",
    schedule: "*/15 * * * *", // Every 15 minutes
    handler: async () => {
      const { stdout, stderr } = await execAsync("npm run health-check");
      console.log("Health check output:", stdout);
      if (stderr) console.error("Health check stderr:", stderr);
    },
    enabled: true,
    timezone: "UTC",
  },
];
```

#### Manual Execution

```bash
# Test log cleanup without deleting
npm run cleanup-logs:dry-run

# Run actual cleanup
npm run cleanup-logs

# Run database maintenance
npm run db:maintenance

# Check system health
npm run health-check
```

### 2. **Simple Setup (Development/Small Scale)**

```bash
# Add to crontab (fallback option)
0 2 * * * cd /path/to/app && npm run cleanup-logs
```

### 3. **Production Setup (Alternative)**

#### Using Docker with Cron

```dockerfile
# Dockerfile
FROM node:18-alpine
RUN apk add --no-cache dcron

COPY crontab /etc/crontabs/root
CMD ["crond", "-f", "-d", "8"]
```

```bash
# crontab
0 2 * * * cd /app && npm run cleanup-logs >> /var/log/cron.log 2>&1
```

#### Using Kubernetes CronJob

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: log-cleanup
spec:
  schedule: "0 2 * * *"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: cleanup
              image: your-app:latest
              command: ["npm", "run", "cleanup-logs"]
          restartPolicy: OnFailure
```

### 3. **Cloud-Native Setup**

#### AWS Lambda + EventBridge

```typescript
// lambda-cleanup.ts
export const handler = async (event: any) => {
  await scheduledLogCleanup();
  return { statusCode: 200 };
};
```

#### Google Cloud Functions + Cloud Scheduler

```typescript
// cloud-function-cleanup.ts
export const cleanupLogs = async (req: any, res: any) => {
  await scheduledLogCleanup();
  res.status(200).send("Cleanup completed");
};
```

## Monitoring and Alerting

### 1. **Health Checks**

```typescript
// Check log table size
const stats = await getLogStatistics();
if (stats.totalLogs > 1000000) {
  // Alert: Too many logs
}

// Check disk usage
const spaceUsage = await estimateLogSpaceUsage();
if (spaceUsage.estimatedSizeMB > 1000) {
  // Alert: Database too large
}
```

### 2. **Metrics Dashboard**

```typescript
// Prometheus metrics
const logMetrics = {
  total_logs: stats.totalLogs,
  logs_by_severity: stats.logsBySeverity,
  estimated_size_mb: spaceUsage.estimatedSizeMB,
  cleanup_operations: cleanupCount,
};
```

### 3. **Alerting Rules**

```yaml
# Prometheus alerting rules
groups:
  - name: log_management
    rules:
      - alert: HighLogVolume
        expr: total_logs > 1000000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High volume of audit logs detected"
```

## Cost Optimization

### 1. **Database Costs**

| Strategy     | Cost Impact | Implementation        |
| ------------ | ----------- | --------------------- |
| Partitioning | Medium      | Reduces query costs   |
| Indexing     | Low         | Improves performance  |
| Compression  | High        | Reduces storage costs |

### 2. **Storage Costs**

| Storage Type  | Cost/Month (1GB) | Use Case               |
| ------------- | ---------------- | ---------------------- |
| Database      | $0.10-0.50       | Active logs (60 days)  |
| File System   | $0.02-0.05       | Archived logs (1 year) |
| Tigris        | $0.01-0.03       | Long-term storage      |
| Cloud Storage | $0.01-0.02       | Alternative storage    |

### 3. **Processing Costs**

| Operation          | Frequency | Cost  |
| ------------------ | --------- | ----- |
| Daily Cleanup      | 1x/day    | $0.01 |
| Weekly Maintenance | 1x/week   | $0.01 |
| Monthly Archive    | 1x/month  | $0.05 |

## Security Considerations

### 1. **Data Protection**

```typescript
// Anonymize sensitive data before archival
const anonymizedLog = {
  ...log,
  ipAddress: log.ipAddress ? hashIpAddress(log.ipAddress) : null,
  userAgent: log.userAgent ? hashUserAgent(log.userAgent) : null,
};
```

### 2. **Access Control**

```typescript
// Encrypt archived files
const encryptedData = await encrypt(JSON.stringify(logData), encryptionKey);
await fs.writeFile(filepath, encryptedData);
```

### 3. **Compliance**

- **GDPR**: Right to be forgotten
- **SOX**: 7-year retention for financial data
- **HIPAA**: Secure handling of health data

## Migration Strategy

### Phase 1: Implementation (Week 1-2)

1. Deploy cleanup utilities
2. Set up monitoring
3. Configure retention policies

### Phase 2: Testing (Week 3)

1. Run dry-run cleanup
2. Verify archival process
3. Test restoration procedures

### Phase 3: Production (Week 4)

1. Enable automated cleanup
2. Monitor performance
3. Adjust retention policies

### Phase 4: Optimization (Ongoing)

1. Analyze usage patterns
2. Optimize storage costs
3. Implement advanced features

## Troubleshooting

### Common Issues

1. **Cleanup Fails**

   ```bash
   # Check database connectivity
   npm run db:ping

   # Check file permissions
   ls -la ./logs/archives/
   ```

2. **High Disk Usage**

   ```bash
   # Find large files
   find ./logs/archives/ -size +100M

   # Check database size
   SELECT pg_size_pretty(pg_total_relation_size('"AuditLog"'));
   ```

3. **Performance Issues**

   ```sql
   -- Check slow queries
   SELECT query, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;

   -- Analyze table statistics
   ANALYZE "AuditLog";
   ```

## Best Practices

1. **Always test with dry-run first**
2. **Monitor cleanup operations**
3. **Keep multiple backup copies**
4. **Document retention policies**
5. **Regular performance reviews**
6. **Automate everything possible**
7. **Plan for disaster recovery**

## Conclusion

This strategy provides a comprehensive approach to log management that balances storage costs, performance, and compliance requirements. The modular design allows for easy scaling and adaptation to changing needs.
