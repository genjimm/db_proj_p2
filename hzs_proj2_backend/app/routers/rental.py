from fastapi import APIRouter, Depends, status, HTTPException
from .. import schemas, database
from typing import List
import logging

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
    try:
        # Check if the book copy is available
        db.execute("SELECT status FROM hzs_book_copy WHERE copy_id = %s", (rental.copy_id,))
        book_copy = db.fetchone()
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
async def return_rental(rental_id: int, return_date: schemas.RentalReturn, db=Depends(database.get_db)):
    try:
        # Update the rental with the actual return date
        db.execute(UPDATE_RENTAL_RETURN_DATE_QUERY, (return_date.actual_return_date, rental_id))
        updated_rental = db.fetchone()

        if not updated_rental:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Rental with id {rental_id} does not exist!"
            )

        # Update the book copy status to 'AVAILABLE'
        db.execute(UPDATE_BOOK_COPY_STATUS_QUERY, ('AVAILABLE', updated_rental['copy_id']))
        db.connection.commit()

        logger.info(f"Rental returned successfully: {updated_rental}")
        return updated_rental
    except Exception as e:
        db.connection.rollback()
        logger.error(f"Error returning rental: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while returning the rental."
        )


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