Prerequisites
Before you begin, ensure you have the following installed:

```
Python 3.10 or higher
PostgreSQL
pip (Python package manager)
psql (PostgreSQL command-line tool)
```

1. clone the repository

2. Create a virtual environment
```
python3 -m venv venv
source venv/bin/activate
```

3. Install dependencies
```
pip install -r requirements.txt
```

4. Create a .env file in the root directory with the following variables:
```
DATABASE_HOSTNAME=localhost
DATABASE_PORT=5432
DATABASE_PASSWORD=your_password
DATABASE_NAME=your_database
DATABASE_USERNAME=your_username
SECRET_KEY=09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60


Replace your_password, your_database, and your_username with your actual database credentials.
```

5. Start the PostgreSQL service
```
brew services start postgresql
```

6. Create the database and create tables:
```
CREATE DATABASE fastapi;
psql -U postgres -d fastapi -f <path to your create_tables.sql>
```

7. Run the application:
```
uvicorn app.main:app --reload
```

8. Open your browser and navigate to:
```
http://127.0.0.1:8000/docs
```




