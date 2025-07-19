# Backend Setup Instructions

## 1. Database Setup

### Option A: Using PostgreSQL (Recommended for Production)

1. **Install PostgreSQL** on your system
2. **Create database and user**:
   ```sql
   CREATE DATABASE skillswipe_db;
   CREATE USER your_username WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE skillswipe_db TO your_username;
   ```

3. **Create `.env` file** in `backend/skillswipe_backend/.env`:
   ```env
   # Database Configuration
   DATABASE_NAME=skillswipe_db
   DATABASE_USER=your_username
   DATABASE_PASSWORD=your_password
   DATABASE_HOST=localhost
   DATABASE_PORT=5432

   # Django Configuration
   SECRET_KEY=your-very-long-secret-key-here-change-this
   DEBUG=True
   ```

### Option B: Using SQLite (Quick Development Setup)

If you want to get started quickly without PostgreSQL, you can temporarily switch to SQLite:

1. **Edit `settings.py`** - Replace the DATABASES configuration with:
   ```python
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.sqlite3',
           'NAME': BASE_DIR / 'db.sqlite3',
       }
   }
   ```

## 2. Run Migrations

```bash
cd backend/skillswipe_backend
python manage.py makemigrations
python manage.py migrate
```

## 3. Create Superuser (Optional)

```bash
python manage.py createsuperuser
```

## 4. Start Development Server

```bash
python manage.py runserver
```

## 5. Test the Setup

- Backend should be running at: http://127.0.0.1:8000
- Admin panel: http://127.0.0.1:8000/admin
- API endpoints: http://127.0.0.1:8000/api/

## Troubleshooting

### PostgreSQL Connection Issues
- Make sure PostgreSQL service is running
- Check if the database and user exist
- Verify the credentials in your `.env` file
- Make sure the `.env` file is in the correct location: `backend/skillswipe_backend/.env`

### "No module named 'psycopg2'" Error
```bash
pip install psycopg2-binary
```

### Migration Issues
```bash
python manage.py makemigrations --empty yourappname
python manage.py migrate --fake-initial
``` 