from fastapi import APIRouter, Depends, status, HTTPException
from .. import schemas, database
from ..oauth2 import get_current_user
from typing import List
import logging

logging.basicConfig(
    level=logging.DEBUG,  # Set to DEBUG to capture all logs
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/book",
    tags=["book"]
)

ADD_BOOK_QUERY = """
    INSERT INTO hzs_book (b_name, topic)
    VALUES (%s, %s) 
    RETURNING book_id, b_name, topic
"""

GET_BOOK_BY_ID_QUERY = """
    SELECT book_id, b_name, topic 
    FROM hzs_book 
    WHERE book_id = %s
"""

GET_ALL_BOOKS_QUERY = """
    SELECT book_id, b_name, topic 
    FROM hzs_book
    ORDER BY book_id
"""

DELETE_BOOK_BY_ID_QUERY = """
    DELETE FROM hzs_book
    WHERE book_id = %s
"""

UPDATE_BOOK_BY_ID_QUERY = """
    UPDATE hzs_book
    SET b_name = %s, topic = %s
    WHERE book_id = %s
"""

ADD_BOOK_COPY_QUERY = """
    INSERT INTO hzs_book_copy (book_id, status)
    VALUES (%s, %s)
    RETURNING copy_id, book_id, status
"""


GET_BOOK_COPIES_QUERY = """
    SELECT copy_id, book_id, status
    FROM hzs_book_copy
    WHERE book_id = %s
"""

ADD_BOOK_AUTHOR_QUERY = """
    INSERT INTO hzs_book_author (book_id, author_id)
    VALUES (%s, %s)
    RETURNING book_id, author_id
"""

GET_AUTHORS_BY_BOOK_QUERY = """
    SELECT a.author_id, a.f_name, a.l_name, a.email, a.state, a.country, a.street, a.city
    FROM hzs_author a
    JOIN hzs_book_author ba ON a.author_id = ba.author_id
    WHERE ba.book_id = %s
"""

DELETE_BOOK_COPY_QUERY = """
    DELETE FROM hzs_book_copy
    WHERE copy_id = %s
"""

DELETE_BOOK_QUERY = """
    DELETE FROM hzs_book
    WHERE book_id = %s
"""

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=schemas.BookOut)
async def add_book(book: schemas.BookCreate, db=Depends(database.get_db), current_user=Depends(get_current_user)):
    # logger.info(current_user['role'])
    if current_user['role'] != 'admin':
        
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this resource"
        )
    try:
        db.execute(ADD_BOOK_QUERY, (book.b_name, book.topic))
        added_book = db.fetchone()
        db.connection.commit()
        logger.info(f"Book added successfully: {added_book}")
    except Exception as e:
        db.connection.rollback()
        logger.error(f"Error adding book: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while adding the book."
        )

    # 嚙踝蕭嚙踝蕭嚙踝蕭嚙踝蕭芞嚙踝蕭嚙踝蕭嚙踝蕭嚙誕�?
    return added_book

@router.get("/", response_model=List[schemas.BookOut])
async def get_all_books(db=Depends(database.get_db), current_user=Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this resource"
        )
    try:
        db.execute(GET_ALL_BOOKS_QUERY)
        books = db.fetchall()
        return books
    except Exception as e:
        logger.error(f"Error retrieving books: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving books."
        )

@router.get("/{book_id}", response_model=schemas.BookOut)
async def get_book_byid(book_id: int, db=Depends(database.get_db), current_user=Depends(get_current_user)):
    if current_user['role'] != 'admin':
        
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this resource"
        )
    db.execute(GET_BOOK_BY_ID_QUERY, (book_id,))
    book = db.fetchone()

    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Book with id {book_id} does not exist!"
        )

    return book


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_book_byid(book_id: int, db=Depends(database.get_db)):
    try:
        db.execute(DELETE_BOOK_BY_ID_QUERY, (book_id,))
        db.connection.commit()

        if db.rowcount == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Book with id {book_id} does not exist!"
            )

        logger.info(f"Book with id {book_id} deleted successfully.")
    except Exception as e:
        db.connection.rollback()
        logger.error(f"Error deleting book with id {book_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while deleting the book."
        )


@router.put("/{book_id}", status_code=status.HTTP_200_OK, response_model=schemas.BookOut)
async def update_book_byid(book_id: int, new_book: schemas.BookCreate, db=Depends(database.get_db)):
    try:
        # 嚙踝蕭戙猁嚙踝蕭嚙蝓蛛蕭芞嚙踝蕭嚙褒瘀蕭嚙踝蕭嚙�
        db.execute(GET_BOOK_BY_ID_QUERY, (book_id,))
        old_book = db.fetchone()
        if not old_book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Book with id {book_id} does not exist!"
            )

        # 嚙踝蕭嚙踝蕭芞嚙踝蕭
        db.execute(UPDATE_BOOK_BY_ID_QUERY, (new_book.b_name, new_book.topic, book_id))
        db.connection.commit()

        # 龰嚙衛賂蕭嚙蝓綽蕭嚙談潘蕭嚙�?
        db.execute(GET_BOOK_BY_ID_QUERY, (book_id,))
        updated_book = db.fetchone()

        logger.info(f"Book with id {book_id} updated successfully: {updated_book}")
        return updated_book

    except Exception as e:
        db.connection.rollback()
        logger.error(f"Error updating book with id {book_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating the book."
        )
    


# 嚙衛鳴蕭嚙踝蕭嚙踝蕭橦棹潘蕭嚙踝蕭嚙踝蕭嚙課鳴蕭嚙踝蕭繕嚙篁tml珜嚙賣ㄛ嚙踝蕭嚙踝蕭嚙踝蕭嚙踝蕭埴橦棹潘蕭嚙踝蕭嚙踝蕭嚙踝蕭洘嚙踝蕭嚙踝蕭嚙踝蕭嚙踝蕭虒嚙踝蕭嚙踝蕭嚙箱all嚙踝蕭嚙窮pi嚙踝蕭嚙踝蕭嚙踝蕭嚙賤掛芞嚙踝蕭嚙踝蕭繕譫嚙踝蕭嚙�
@router.post("/{book_id}/copy", status_code=status.HTTP_201_CREATED, response_model=schemas.BookCopyOut)
async def add_book_copy(book_id: int, copy: schemas.BookCopyCreate, db=Depends(database.get_db)):
    try:
        # 嚙賡艘嚙賤掛嚙踝蕭嚙褒瘀蕭嚙踝蕭嚙�
        db.execute(GET_BOOK_BY_ID_QUERY, (book_id,))
        book = db.fetchone()
        if not book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Book with id {book_id} does not exist!"
            )

        # 嚙踝蕭嚙踝蕭嚙蝓腔賂蕭嚙踝蕭
        db.execute(ADD_BOOK_COPY_QUERY, (book_id, copy.status))
        added_copy = db.fetchone()
        db.connection.commit()

        # 嚙踝蕭嚙踝蕭嚙蝓賂蕭嚙踝蕭嚙踝蕭嚙踝蕭嚙踝蕭嚙誕�?
        logger.info(f"Book copy added successfully: {added_copy}")
        return added_copy
    except Exception as e:
        db.connection.rollback()
        logger.error(f"Error adding book copy: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while adding the book copy."
        )


# 嚙衛鳴蕭嚙誹脤艘芞嚙踝蕭珜嚙踝蕭嚙踝蕭嚙賡艘嚙踝蕭嚙請賂蕭嚙踝蕭嚙談選蕭嚙踝蕭嚙踝蕭尨嚙踝蕭嚙踝蕭嚙踝蕭嚙踝蕭邽嚙踝蕭嚙�?
@router.get("/{book_id}/copies", response_model=List[schemas.BookCopyOut])
async def get_book_copies(book_id: int, db=Depends(database.get_db)):
    try:
        # 嚙踝蕭嚙踝蕭漹橘蕭嚙踝蕭セ嚙踝蕭嚙踝�?
        db.execute(GET_BOOK_BY_ID_QUERY, (book_id,))
        book = db.fetchone()
        if not book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Book with id {book_id} does not exist!"
            )

        # 龰嚙踝蕭嚙踝蕭嚙踝蕭嚙賤掛嚙踝蕭譫嚙踝蕭嚙�
        db.execute(GET_BOOK_COPIES_QUERY, (book_id,))
        copies = db.fetchall()

        logger.info(f"Retrieved {len(copies)} copies for book id {book_id}")
        return copies
    except Exception as e:
        logger.error(f"Error retrieving book copies: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving book copies."
        )
    
# Add author to a book
@router.post("/{book_id}/authors", status_code=status.HTTP_201_CREATED)
async def add_author_to_book(book_id: int, author_id: int, db=Depends(database.get_db)):
    try:
        db.execute(ADD_BOOK_AUTHOR_QUERY, (book_id, author_id))
        relationship = db.fetchone()
        db.connection.commit()
        return relationship
    except Exception as e:
        db.connection.rollback()
        logger.error(f"Error adding author to book: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while adding the author to the book."
        )

# Get authors of a book
@router.get("/{book_id}/authors", response_model=List[schemas.AuthorOut])
async def get_authors_of_book(book_id: int, db=Depends(database.get_db)):
    db.execute(GET_AUTHORS_BY_BOOK_QUERY, (book_id,))
    authors = db.fetchall()
    return authors

@router.delete("/{book_id}/copy/{copy_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_book_copy(
    book_id: int,
    copy_id: int,
    db=Depends(database.get_db),
    current_user=Depends(get_current_user)
):
    if current_user['role'] != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin can delete book copies"
        )
    
    try:
        # First verify the copy belongs to the book
        db.execute("""
            SELECT copy_id FROM hzs_book_copy 
            WHERE copy_id = %s AND book_id = %s
        """, (copy_id, book_id))
        
        if not db.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Book copy not found"
            )
        
        # Delete the copy
        db.execute(DELETE_BOOK_COPY_QUERY, (copy_id,))
        db.connection.commit()
        
    except Exception as e:
        db.connection.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_book(
    book_id: int,
    db=Depends(database.get_db),
    current_user=Depends(get_current_user)
):
    if current_user['role'] != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin can delete books"
        )
    
    try:
        # First delete all copies of the book
        db.execute("""
            DELETE FROM hzs_book_copy
            WHERE book_id = %s
        """, (book_id,))
        
        # Then delete the book
        db.execute(DELETE_BOOK_QUERY, (book_id,))
        db.connection.commit()
        
    except Exception as e:
        db.connection.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )