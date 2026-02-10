-- Add email verification columns to users table
ALTER TABLE users 
ADD COLUMN email_verified VARCHAR(10) DEFAULT 'false',
ADD COLUMN verification_token VARCHAR(255) NULL UNIQUE;

-- Also add invitation_token to team_members if not exists
ALTER TABLE team_members 
ADD COLUMN invitation_token VARCHAR(255) NULL UNIQUE;
