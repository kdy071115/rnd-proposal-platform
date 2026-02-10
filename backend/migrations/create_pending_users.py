"""Create pending_users table for email verification flow."""
import os
import sys
from sqlalchemy import create_engine, text

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings

def run_migration():
    """Create pending_users table."""
    engine = create_engine(settings.DATABASE_URL)
    
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS pending_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) UNIQUE NOT NULL,
        hashed_password VARCHAR(200) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        company_name VARCHAR(200) NOT NULL,
        verification_token VARCHAR(255) UNIQUE NOT NULL,
        created_at DATETIME NOT NULL,
        expires_at DATETIME NOT NULL,
        INDEX idx_email (email),
        INDEX idx_token (verification_token)
    )
    """
    
    with engine.connect() as conn:
        try:
            print("Creating pending_users table...")
            conn.execute(text(create_table_sql))
            conn.commit()
            print("✓ pending_users table created successfully")
        except Exception as e:
            print(f"⊙ Table creation: {e}")
    
    print("\n✅ Migration completed!")

if __name__ == "__main__":
    run_migration()
