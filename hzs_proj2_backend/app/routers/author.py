from fastapi import APIRouter, Depends, status, HTTPException
from .. import schemas, database
from typing import List
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/author",
    tags=["author"]
)


# Queries for HZS_AUTHOR
ADD_AUTHOR_QUERY = """
    INSERT INTO hzs_author (author_id, f_name, l_name, email, state, country, street, city)
    VALUES (DEFAULT, %s, %s, %s, %s, %s, %s, %s)
    RETURNING author_id, f_name, l_name, email, state, country, street, city
"""

GET_AUTHOR_BY_ID_QUERY = """
    SELECT author_id, f_name, l_name, email, state, country, street, city
    FROM hzs_author
    WHERE author_id = %s
"""

GET_ALL_AUTHORS_QUERY = """
    SELECT author_id, f_name, l_name, email, state, country, street, city
    FROM hzs_author
"""

UPDATE_AUTHOR_QUERY = """
    UPDATE hzs_author
    SET f_name = %s, l_name = %s, email = %s, state = %s, country = %s, street = %s, city = %s
    WHERE author_id = %s
    RETURNING author_id, f_name, l_name, email, state, country, street, city
"""

DELETE_AUTHOR_QUERY = """
    DELETE FROM hzs_author
    WHERE author_id = %s
"""

# Queries for HZS_BOOK_AUTHOR

GET_BOOKS_BY_AUTHOR_QUERY = """
    SELECT b.book_id, b.b_name, b.topic
    FROM hzs_book b
    JOIN hzs_book_author ba ON b.book_id = ba.book_id
    WHERE ba.author_id = %s
"""

# Add a new author
@router.post("/", status_code=status.HTTP_201_CREATED, response_model=schemas.AuthorOut)
async def add_author(author: schemas.AuthorCreate, db=Depends(database.get_db)):
    try:
        db.execute(ADD_AUTHOR_QUERY, (
            author.f_name, author.l_name, author.email, author.state, author.country, author.street, author.city
        ))
        new_author = db.fetchone()
        db.connection.commit()
        logger.info(f"Author added successfully: {new_author}")
        return new_author
    except Exception as e:
        db.connection.rollback()
        logger.error(f"Error adding author: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while adding the author."
        )

# Get author by ID
@router.get("/{author_id}", response_model=schemas.AuthorOut)
async def get_author_by_id(author_id: int, db=Depends(database.get_db)):
    db.execute(GET_AUTHOR_BY_ID_QUERY, (author_id,))
    author = db.fetchone()
    if not author:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Author with id {author_id} does not exist!"
        )
    return author

# Get all authors
@router.get("/", response_model=List[schemas.AuthorOut])
async def get_all_authors(db=Depends(database.get_db)):
    db.execute(GET_ALL_AUTHORS_QUERY)
    authors = db.fetchall()
    return authors

# Update author
@router.put("/{author_id}", response_model=schemas.AuthorOut)
async def update_author(author_id: int, updated_author: schemas.AuthorCreate, db=Depends(database.get_db)):
    db.execute(UPDATE_AUTHOR_QUERY, (
        updated_author.f_name, updated_author.l_name, updated_author.email,
        updated_author.state, updated_author.country, updated_author.street, updated_author.city, author_id
    ))
    author = db.fetchone()
    if not author:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Author with id {author_id} does not exist!"
        )
    db.connection.commit()
    return author

# Delete author
@router.delete("/{author_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_author(author_id: int, db=Depends(database.get_db)):
    db.execute(DELETE_AUTHOR_QUERY, (author_id,))
    if db.rowcount == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Author with id {author_id} does not exist!"
        )
    db.connection.commit()


# Get books by author
@router.get("/{author_id}/books", response_model=List[schemas.BookOut])
async def get_books_by_author(author_id: int, db=Depends(database.get_db)):
    db.execute(GET_BOOKS_BY_AUTHOR_QUERY, (author_id,))
    books = db.fetchall()
    return books