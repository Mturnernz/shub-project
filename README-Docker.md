# Docker Development Environment

This Docker setup provides a complete offline development environment for the Shub project with a local Supabase instance.

## Prerequisites

- Docker Desktop installed and running
- At least 4GB RAM allocated to Docker

## Quick Start

1. **Start the development environment:**
   ```bash
   docker-compose up -d
   ```

2. **View logs (optional):**
   ```bash
   docker-compose logs -f shub-app
   ```

3. **Access the application:**
   - Frontend: http://localhost:5173
   - Supabase API: http://localhost:54321
   - Supabase Database: localhost:54322
   - Supabase Storage: http://localhost:54324

4. **Stop the environment:**
   ```bash
   docker-compose down
   ```

## Services Included

### Frontend (shub-app)
- React/Vite development server
- Hot reloading enabled
- Port: 5173

### Supabase Local Stack
- **PostgreSQL Database** (port 54322)
- **API Gateway/Auth** (port 54321)
- **Storage API** (port 54324)
- **REST API** (port 54323)
- **Realtime** (port 54325)

## Environment Variables

The development environment uses these default values:
- `VITE_SUPABASE_URL=http://localhost:54321`
- `VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0`

## Development Workflow

### Making Code Changes
- Edit files in the `shub/` directory
- Changes are automatically reflected via hot reload
- Node modules are persisted in a Docker volume

### Database Access
Connect to PostgreSQL with:
- Host: localhost
- Port: 54322
- Database: postgres
- User: supabase_admin
- Password: your-super-secret-and-long-postgres-password

### Rebuilding
If you modify dependencies:
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Troubleshooting

### Port Conflicts
If ports are already in use, modify the port mappings in `docker-compose.yml`:
```yaml
ports:
  - "5174:5173"  # Change 5173 to 5174
```

### Memory Issues
If containers fail to start:
1. Increase Docker memory allocation
2. Close other applications
3. Restart Docker Desktop

### Database Connection Issues
1. Ensure all containers are running: `docker-compose ps`
2. Check logs: `docker-compose logs supabase-db`
3. Restart the stack: `docker-compose restart`

### Reset Everything
To start fresh:
```bash
docker-compose down -v  # Removes volumes
docker-compose up -d
```

## Useful Commands

```bash
# View all running containers
docker-compose ps

# View logs for specific service
docker-compose logs shub-app

# Execute commands in running container
docker-compose exec shub-app npm run lint

# Stop specific service
docker-compose stop shub-app

# Restart specific service
docker-compose restart shub-app
```