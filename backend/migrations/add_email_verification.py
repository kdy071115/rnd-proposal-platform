"""Database migration script to add email verification columns."""
import os
import sys
from sqlalchemy import create_engine, text

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings

def run_migration():
    """Run database migration to add email verification columns."""
    engine = create_engine(settings.DATABASE_URL)
    
    migrations = [
        ("users", "email_verified", "ALTER TABLE users ADD COLUMN email_verified VARCHAR(10) DEFAULT 'false'"),
        ("users", "verification_token", "ALTER TABLE users ADD COLUMN verification_token VARCHAR(255) NULL"),
        ("team_members", "invitation_token", "ALTER TABLE team_members ADD COLUMN invitation_token VARCHAR(255) NULL"),
    ]
    
    with engine.connect() as conn:
        for i, (table, column, migration) in enumerate(migrations, 1):
            try:
                # Check if column already exists
                check_query = text(f"""
                    SELECT COUNT(*) as count
                    FROM information_schema.COLUMNS 
                    WHERE TABLE_SCHEMA = DATABASE()
                    AND TABLE_NAME = '{table}'
                    AND COLUMN_NAME = '{column}'
                """)
                result = conn.execute(check_query).fetchone()
                
                if result[0] > 0:
                    print(f"⊙ Migration {i}/{len(migrations)}: Column {table}.{column} already exists, skipping")
                    continue
                
                print(f"Running migration {i}/{len(migrations)}: Adding {table}.{column}...")
                conn.execute(text(migration))
                conn.commit()
                print(f"✓ Migration {i} completed successfully")
            except Exception as e:
                print(f"✗ Migration {i} failed: {e}")
                # Continue with other migrations
        
        # Add unique constraint separately for verification_token
        try:
            print("\nAdding unique constraints...")
            conn.execute(text("ALTER TABLE users ADD UNIQUE INDEX idx_verification_token (verification_token)"))
            conn.commit()
            print("✓ Added unique constraint on users.verification_token")
        except Exception as e:
            print(f"⊙ Unique constraint on users.verification_token: {e}")
        
        try:
            conn.execute(text("ALTER TABLE team_members ADD UNIQUE INDEX idx_invitation_token (invitation_token)"))
            conn.commit()
            print("✓ Added unique constraint on team_members.invitation_token")
        except Exception as e:
            print(f"⊙ Unique constraint on team_members.invitation_token: {e}")
    
    print("\n✅ All migrations completed!")

if __name__ == "__main__":
    run_migration()
