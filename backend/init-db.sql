-- Create databases for the application (if they don't exist)
SELECT 'CREATE DATABASE microdatacenter' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'microdatacenter')\gexec
SELECT 'CREATE DATABASE keycloak' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'keycloak')\gexec

-- Grant permissions to the user
GRANT ALL PRIVILEGES ON DATABASE microdatacenter TO mdc_user;
GRANT ALL PRIVILEGES ON DATABASE keycloak TO mdc_user;

-- Note: Database schema will be created automatically by Entity Framework migrations
-- No manual table creation needed - the application will handle this on startup