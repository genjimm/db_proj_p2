from fastapi import APIRouter, Depends, status, HTTPException, Response
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from .. import database, schemas, utils, oauth2



router = APIRouter(tags=['Authentication'])

@router.post('/login', response_model=schemas.Token)
def login(user_credentials: OAuth2PasswordRequestForm = Depends(), db=Depends(database.get_db)):
    # Query the user from the database
    db.execute("""SELECT * FROM hzs_customer WHERE email = %s""", (user_credentials.username,))
    user = db.fetchone()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid Credentials"
        )

    # Verify the password
    if not utils.verify(user_credentials.password, user['password']):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid Credentials"
        )

    customer_id = int(user['customer_id'])

    # Create an access token
    access_token = oauth2.create_access_token(data={"user_id": customer_id})

    return {"access_token": access_token, "token_type": "bearer"}
    