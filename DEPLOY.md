# 🚀 Deployment Guide - Obi Reminder

## Prerequisites
- Server with Docker & Docker Compose installed
- Domain pointing to server IP via Cloudflare
- Fonnte API key for WhatsApp

## Quick Deploy

### 1. Clone/Copy to Server
```bash
# Clone from GitHub or copy the folder
git clone https://github.com/tropicans/obi.git
cd obi/obi-reminder
```

### 2. Configure Environment
```bash
# Copy production env template
cp .env.production .env

# Edit with your actual values
nano .env
```

Required environment variables:
- `FONNTE_API_KEY` - Your Fonnte API key
- `AI_PROXY_KEY` - Your AI proxy key
- `DEFAULT_PHONE` - Your WhatsApp number (e.g., 6281234567890)

### 3. Create Data Directory
```bash
mkdir -p data
```

### 4. Deploy with Docker Compose
```bash
# Build and start containers
docker-compose -f docker-compose.prod.yml up -d --build

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 5. Initialize Database
```bash
# Run migration inside container
docker exec obi-reminder npx prisma migrate deploy

# Seed initial data (optional)
docker exec obi-reminder npx prisma db seed
```

### 6. Configure Cloudflare

1. Add DNS record:
   - Type: `A`
   - Name: `obi`
   - Content: `YOUR_SERVER_IP`
   - Proxy status: Proxied (orange cloud)

2. SSL/TLS Settings:
   - Mode: `Flexible` or `Full` (if you have origin cert)

3. Configure Fonnte Webhook:
   - Set webhook URL to: `https://obi.kelazz.my.id/webhook/fonnte`

## Maintenance

### View Logs
```bash
docker-compose -f docker-compose.prod.yml logs -f obi-app
```

### Restart Services
```bash
docker-compose -f docker-compose.prod.yml restart
```

### Update Application
```bash
git pull
docker-compose -f docker-compose.prod.yml up -d --build
```

### Backup Database
```bash
cp data/obi.db data/obi.db.backup-$(date +%Y%m%d)
```

## Ports

| Service | Internal | External | Description |
|---------|----------|----------|-------------|
| obi-app | 3007 | 3007 | Backend API |
| obi-web | 80 | 80 | Frontend (Nginx) |

## Health Check

Backend health can be verified at:
```
https://obi.kelazz.my.id/api/users
```

## Troubleshooting

### Container not starting
```bash
docker-compose -f docker-compose.prod.yml logs obi-app
```

### Database errors
```bash
docker exec obi-reminder npx prisma migrate deploy
```

### Permission issues
```bash
sudo chown -R 1000:1000 data/
```
