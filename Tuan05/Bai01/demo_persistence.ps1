# demo_persistence.ps1

Write-Host "1. Pulling official postgres image..." -ForegroundColor Cyan
docker pull postgres:latest

Write-Host "`n2. Running initial postgres container..." -ForegroundColor Cyan
docker run --name temp-pg -e POSTGRES_PASSWORD=password -d postgres:latest

Write-Host "Waiting for postgres to start..."
Start-Sleep -Seconds 10

Write-Host "`n3. Inserting data into temp-pg..." -ForegroundColor Cyan
docker exec temp-pg psql -U postgres -c "CREATE TABLE users (id SERIAL PRIMARY KEY, name TEXT);"
docker exec temp-pg psql -U postgres -c "INSERT INTO users (name) VALUES ('AntiGravity User');"
docker exec temp-pg psql -U postgres -c "SELECT * FROM users;"

Write-Host "`n4. Committing the container to a new image: pg-with-data" -ForegroundColor Cyan
# NOTE: This usually fails to capture data because /var/lib/postgresql/data is a VOLUME
docker commit temp-pg pg-with-data

Write-Host "`n5. Cleaning up old container..." -ForegroundColor Cyan
docker stop temp-pg
docker rm temp-pg

Write-Host "`n6. Running new container from the committed image..." -ForegroundColor Cyan
docker run --name new-pg -e POSTGRES_PASSWORD=password -d pg-with-data

Write-Host "Waiting for postgres to start..."
Start-Sleep -Seconds 10

Write-Host "`n7. Checking for data..." -ForegroundColor Cyan
docker exec new-pg psql -U postgres -c "SELECT * FROM users;"
if ($LASTEXITCODE -ne 0) {
    Write-Host "DATA NOT FOUND! (This happens because /var/lib/postgresql/data is a VOLUME and 'docker commit' does not capture volume data.)" -ForegroundColor Red
}

Write-Host "`nCleaning up..."
docker stop new-pg
docker rm new-pg
