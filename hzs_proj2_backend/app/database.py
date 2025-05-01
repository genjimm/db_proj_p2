import psycopg2
from psycopg2.extras import RealDictCursor
import os
from .config import settings

DATABASE_URL = os.getenv("DATABASE_URL") or f"postgresql://{settings.database_username}:{settings.database_password}" \
                                            f"@{settings.database_hostname}:{settings.database_port}/{settings.database_name}"

def get_db():
    try:
        conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
        cursor = conn.cursor()
        yield cursor
        conn.commit()
        print("Database connection is successful!")
    except Exception as error:
        print("Database connection failed:", error)
        raise
    finally:
        cursor.close()
        conn.close()