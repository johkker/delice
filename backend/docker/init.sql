-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create initial admin user (optional - you may prefer to handle this through migrations)
-- This is just an example if you want to pre-populate data
INSERT INTO "user" (id, name, email, password, roles, created_at, updated_at)
VALUES (
  uuid_generate_v4(),
  'Admin',
  'admin@delice.com',
  -- This is 'admin123' hashed with bcrypt. You should generate a proper hash in production
  '$2b$10$A12345678901234567890uaFVLpT7g/jE.j.W4Ea7v6IQ/0C9VwCC',
  '{admin}',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING; 