#!/bin/bash
# EC2 Backup Script
# Creates backups of PostgreSQL and MongoDB databases

set -e

# Load environment variables
if [ -f .env.production ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
fi

# Create backup directory with timestamp
BACKUP_DIR=~/backups/$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

echo "💾 Starting Database Backup..."
echo "📁 Backup location: $BACKUP_DIR"

# Backup PostgreSQL
echo "🐘 Backing up PostgreSQL..."
docker exec jobapp_postgres pg_dump -U ${DB_USERNAME} ${DB_DATABASE} > $BACKUP_DIR/postgres.sql
if [ $? -eq 0 ]; then
    echo "✅ PostgreSQL backup complete"
    echo "   Size: $(du -h $BACKUP_DIR/postgres.sql | cut -f1)"
else
    echo "❌ PostgreSQL backup failed"
fi

# Backup MongoDB
echo "🍃 Backing up MongoDB..."
docker exec jobapp_mongodb mongodump \
    --username=${MONGO_ROOT_USERNAME} \
    --password=${MONGO_ROOT_PASSWORD} \
    --authenticationDatabase=admin \
    --out=/tmp/backup

docker cp jobapp_mongodb:/tmp/backup $BACKUP_DIR/mongodb
docker exec jobapp_mongodb rm -rf /tmp/backup

if [ $? -eq 0 ]; then
    echo "✅ MongoDB backup complete"
    echo "   Size: $(du -sh $BACKUP_DIR/mongodb | cut -f1)"
else
    echo "❌ MongoDB backup failed"
fi

# Compress backups
echo "🗜️ Compressing backups..."
cd ~/backups
tar -czf $(basename $BACKUP_DIR).tar.gz $(basename $BACKUP_DIR)
rm -rf $BACKUP_DIR

echo ""
echo "✅ Backup Complete!"
echo "📦 Backup file: ~/backups/$(basename $BACKUP_DIR).tar.gz"
echo "💾 Size: $(du -h ~/backups/$(basename $BACKUP_DIR).tar.gz | cut -f1)"
echo ""
echo "🗑️ Cleanup old backups (keep last 7 days):"
find ~/backups -name "*.tar.gz" -mtime +7 -delete
echo "   Done"
echo ""
