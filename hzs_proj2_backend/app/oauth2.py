from jose import JWTError, jwt
from datetime import datetime, timedelta
from . import database, schemas
from fastapi import Depends, status, HTTPException
from fastapi.security import OAuth2PasswordBearer
from .config import settings
import logging

logging.basicConfig(
    level=logging.DEBUG,  # Set to DEBUG to capture all logs
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='login')

SECRET_KEY = settings.secret_key
ALGORITHM = settings.algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = settings.access_token_expire_minutes

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, ALGORITHM)

    return encoded_jwt

def verify_access_token(token: str, credentials_exception):
    try:
        payload = jwt.decode(token, SECRET_KEY, [ALGORITHM])
        # logger.info(f"Decoded token payload: {payload}")  # Debugging log
        id: int = payload.get("user_id")
        role: str = payload.get("role")
        if id is None or role is None:
            raise credentials_exception
        token_data = schemas.TokenData(id=id, role=role)
    except JWTError as e:
        logger.error(f"JWT Error: {str(e)}")  # Log the error
        raise credentials_exception
    
    return token_data

# Fetch the logged-in user
def get_current_user(token: str = Depends(oauth2_scheme), db=Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"}
    )

    token_data = verify_access_token(token, credentials_exception)

    # Query the user from the database
    db.execute("""SELECT * FROM hzs_customer WHERE customer_id = %s""", (token_data.id,))
    user = db.fetchone()

    if not user:
        raise credentials_exception

    logger.info(f"Current user: {user}")
    return {"user_id": user['customer_id'], "role": user['role']}




