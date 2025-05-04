from fastapi import status, HTTPException, Depends, APIRouter
from .. import schemas, utils
from ..database import get_db

router = APIRouter(
    prefix="/customer", # prefix of all paths in this router
    tags=["customer"] # for documentation
)

CREATE_CUSTOMER_QUERY = """
    INSERT INTO hzs_customer (l_name, f_name, phone, email, id_type, id_num, password)
    VALUES (%s, %s, %s, %s, %s, %s, %s)
    RETURNING customer_id, l_name, f_name, phone, email, id_type, id_num
"""

@router.get('/')
async def root():
    return {"message": "This is a customer"}

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=schemas.CustomerOut)
async def create_customer(customer: schemas.CustomerCreate, db=Depends(get_db)):
    # Hash the password
    hashed_password = utils.hash(customer.password)
    customer.password = hashed_password

    # Insert the new customer into the database
    db.execute(
        CREATE_CUSTOMER_QUERY,
        (customer.l_name, customer.f_name, customer.phone, customer.email, customer.id_type, customer.id_num, customer.password)
    )
    new_customer = db.fetchone()
    db.connection.commit()

    return new_customer





@router.get("/{customer_id}", response_model=schemas.CustomerOut)
async def get_customer(customer_id: int, db=Depends(get_db)):
    db.execute("""SELECT customer_id, l_name, f_name, phone, email, id_type, id_num FROM hzs_customer WHERE customer_id = %s""", (customer_id,))
    customer = db.fetchone()

    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"customer with id {id} does not exist"
        )

    return customer