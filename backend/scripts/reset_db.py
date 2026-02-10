"""Reset database - delete all users, companies, and team members."""
import os
import sys
from sqlalchemy import create_engine, text

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings

def reset_database():
    """Delete all user-related data."""
    engine = create_engine(settings.DATABASE_URL)
    
    print("⚠️  WARNING: This will delete ALL user data!")
    print("Tables to be cleared:")
    print("  - users")
    print("  - companies")
    print("  - team_members")
    print("  - pending_users")
    print()
    
    response = input("Are you sure you want to continue? (yes/no): ")
    if response.lower() != "yes":
        print("❌ Operation cancelled.")
        return
    
    with engine.connect() as conn:
        try:
            # Delete in correct order (foreign key constraints)
            print("\n🗑️  Deleting data...")
            
            # 1. Delete team members first
            result = conn.execute(text("DELETE FROM team_members"))
            conn.commit()
            print(f"✓ Deleted {result.rowcount} team members")
            
            # 2. Delete documents (references companies)
            result = conn.execute(text("DELETE FROM documents"))
            conn.commit()
            print(f"✓ Deleted {result.rowcount} documents")
            
            # 3. Delete users
            result = conn.execute(text("DELETE FROM users"))
            conn.commit()
            print(f"✓ Deleted {result.rowcount} users")
            
            # 4. Delete companies
            result = conn.execute(text("DELETE FROM companies"))
            conn.commit()
            print(f"✓ Deleted {result.rowcount} companies")
            
            # 5. Delete pending users
            result = conn.execute(text("DELETE FROM pending_users"))
            conn.commit()
            print(f"✓ Deleted {result.rowcount} pending users")
            
            print("\n✅ Database reset completed successfully!")
            print("You can now sign up with a fresh account.")
            
        except Exception as e:
            print(f"\n❌ Error: {e}")
            conn.rollback()

if __name__ == "__main__":
    reset_database()
