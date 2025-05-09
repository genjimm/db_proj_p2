from fastapi import APIRouter, Depends, status, HTTPException
from .. import schemas, database
from typing import List
import logging

logging.basicConfig(
    level=logging.DEBUG,  # Set to DEBUG to capture all logs
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/rental",
    tags=["rental"]
)


ADD_RENTAL_QUERY = """
    INSERT INTO hzs_rental (rental_status, borrow_date, expected_return_date, customer_id, copy_id)
    VALUES (%s, %s, %s, %s, %s)
    RETURNING rental_id, rental_status, borrow_date, expected_return_date, actual_return_date, customer_id, copy_id
"""

GET_RENTAL_BY_ID_QUERY = """
    SELECT rental_id, rental_status, borrow_date, expected_return_date, actual_return_date, customer_id, copy_id
    FROM hzs_rental
    WHERE rental_id = %s
"""

UPDATE_RENTAL_RETURN_DATE_QUERY = """
    UPDATE hzs_rental
    SET actual_return_date = %s, rental_status = 'RETURNED'
    WHERE rental_id = %s
    RETURNING rental_id, rental_status, borrow_date, expected_return_date, actual_return_date, customer_id, copy_id
"""

UPDATE_LATE_RENTAL_RETURN_DATE_QUERY = """
    UPDATE hzs_rental
    SET actual_return_date = %s, rental_status = 'LATE'
    WHERE rental_id = %s
    RETURNING rental_id, rental_status, borrow_date, expected_return_date, actual_return_date, customer_id, copy_id
"""

GET_RENTALS_BY_CUSTOMER_QUERY = """
    SELECT rental_id, rental_status, borrow_date, expected_return_date, actual_return_date, customer_id, copy_id
    FROM hzs_rental
    WHERE customer_id = %s
"""

UPDATE_BOOK_COPY_STATUS_QUERY = """
    UPDATE hzs_book_copy
    SET status = %s
    WHERE copy_id = %s
"""



@router.post("/", status_code=status.HTTP_201_CREATED, response_model=schemas.RentalOut)
async def create_rental(rental: schemas.RentalCreate, db=Depends(database.get_db)):
    logger.info(f"Received request to create rental: {rental}")
    try:

        # Check if the book copy is available
        # prevent race conditions
        db.execute("SELECT status FROM hzs_book_copy WHERE copy_id = %s FOR UPDATE", (rental.copy_id,))
        book_copy = db.fetchone()
        logger.debug(f"Checking book copy status for copy_id: {rental.copy_id}")
        logger.debug(f"Book copy status: {book_copy}")
        logger.debug(f"Creating rental with data: {rental}")
        if not book_copy or book_copy['status'] != 'AVAILABLE':
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The book copy is not available for rental."
            )

        # Create the rental
        db.execute(ADD_RENTAL_QUERY, (
            'BORROWED',
            rental.borrow_date,
            rental.expected_return_date,
            rental.customer_id,
            rental.copy_id
        ))
        new_rental = db.fetchone()

        # Update the book copy status to 'UNAVAILABLE'
        db.execute(UPDATE_BOOK_COPY_STATUS_QUERY, ('UNAVAILABLE', rental.copy_id))
        db.connection.commit()

        logger.info(f"Rental created successfully: {new_rental}")
        return new_rental
    except Exception as e:
        db.connection.rollback()
        logger.error(f"Error creating rental: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while creating the rental."
        )


@router.get("/{rental_id}", response_model=schemas.RentalOut)
async def get_rental_by_id(rental_id: int, db=Depends(database.get_db)):
    try:
        db.execute(GET_RENTAL_BY_ID_QUERY, (rental_id,))
        rental = db.fetchone()

        if not rental:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Rental with id {rental_id} does not exist!"
            )

        logger.info(f"Retrieved rental: {rental}")
        return rental
    except Exception as e:
        logger.error(f"Error retrieving rental: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving the rental."
        )


@router.put("/{rental_id}/return", response_model=schemas.RentalOut)
async def return_rental(
    rental_id: int,
    rental_return: schemas.RentalReturn,
    db=Depends(database.get_db),
):
    try:
        db.execute(GET_RENTAL_BY_ID_QUERY, (rental_id,))
        rental = db.fetchone()
        if not rental:
            raise HTTPException(status_code=404, detail="Rental not found")

        # 1. 取字段
        actual = rental_return.actual_return_date
        expected = rental["expected_return_date"]

        # 2. 统一成 naive（或都转 UTC-aware，看你业务需求）
        if actual.tzinfo is not None:
            actual = actual.replace(tzinfo=None)
        if expected.tzinfo is not None:
            expected = expected.replace(tzinfo=None)

        # 3. 比较
        is_late = actual > expected
        if is_late:
            db.execute(UPDATE_LATE_RENTAL_RETURN_DATE_QUERY, (actual, rental_id))
        else:
            db.execute(UPDATE_RENTAL_RETURN_DATE_QUERY, (actual, rental_id))

        updated = db.fetchone()
        if not updated:
            raise HTTPException(status_code=404, detail="Rental not found")

        # 4. 标记可借
        db.execute(UPDATE_BOOK_COPY_STATUS_QUERY, ("AVAILABLE", updated["copy_id"]))
        db.connection.commit()
        return updated

    except HTTPException:
        db.connection.rollback()
        raise
    except Exception as e:
        db.connection.rollback()
        logger.error(f"Error returning rental: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while returning the rental.")



@router.get("/customer/{customer_id}", response_model=List[schemas.RentalOut])
async def get_rentals_by_customer(customer_id: int, db=Depends(database.get_db)):
    try:
        db.execute(GET_RENTALS_BY_CUSTOMER_QUERY, (customer_id,))
        rentals = db.fetchall()

        logger.info(f"Retrieved {len(rentals)} rentals for customer id {customer_id}")
        return rentals
    except Exception as e:
        logger.error(f"Error retrieving rentals: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving rentals."
        )