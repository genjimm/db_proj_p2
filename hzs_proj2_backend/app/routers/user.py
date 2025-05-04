from fastapi import status, HTTPException, Depends, APIRouter
from .. import schemas, utils
from ..database import get_db

router = APIRouter(
    prefix="/user", # prefix of all paths in this router
    tags=["user"] # for documentation
)


@router.get('/')
async def root():
    return {"message": "This is a user"}

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=schemas.UserOut)
async def create_user(user: schemas.UserCreate, db=Depends(get_db)):
    # Hash the password
    hashed_password = utils.hash(user.password)
    user.password = hashed_password

    # Insert the new user into the database
    db.execute(
        """INSERT INTO users (email, password, phone_number) 
        VALUES (%s, %s, %s) RETURNING id, email, phone_number, created_at""",
        (user.email, user.password, user.phone_number)
    )
    new_user = db.fetchone()
    db.connection.commit()

    return new_user





@router.get("/{id}", response_model=schemas.UserOut)
async def get_user(id: int, db=Depends(get_db)):
    db.execute("""SELECT id, email, phone_number, created_at FROM users WHERE id = %s""", (id,))
    user = db.fetchone()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {id} does not exist"
        )

    return user