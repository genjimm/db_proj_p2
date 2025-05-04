from fastapi import APIRouter, Depends, status, HTTPException
from .. import schemas, database
from typing import List
import logging

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


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=schemas.BookOut)
async def add_book(book: schemas.BookCreate, db=Depends(database.get_db)):
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

    return added_book

@router.get("/{book_id}", response_model=schemas.BookOut)
async def get_book_byid(book_id: int, db=Depends(database.get_db)):
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
        # ��ѯҪ���µ�ͼ���Ƿ����
        db.execute(GET_BOOK_BY_ID_QUERY, (book_id,))
        old_book = db.fetchone()
        if not old_book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Book with id {book_id} does not exist!"
            )

        # ����ͼ��
        db.execute(UPDATE_BOOK_BY_ID_QUERY, (new_book.b_name, new_book.topic, book_id))
        db.connection.commit()

        # ȡ�ø��º��ͼ��
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
    


# �û�����鿴ͼ������һ���µ�htmlҳ�棬��������Բ鿴ͼ�������Ϣ�������Ӹ�����call���api������Ȿͼ����µĸ���
@router.post("/{book_id}/copy", status_code=status.HTTP_201_CREATED, response_model=schemas.BookCopyOut)
async def add_book_copy(book_id: int, copy: schemas.BookCopyCreate, db=Depends(database.get_db)):
    try:
        # �鿴�Ȿ���Ƿ����
        db.execute(GET_BOOK_BY_ID_QUERY, (book_id,))
        book = db.fetchone()
        if not book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Book with id {book_id} does not exist!"
            )

        # ����µĸ���
        db.execute(ADD_BOOK_COPY_QUERY, (book_id, copy.status))
        added_copy = db.fetchone()
        db.connection.commit()

        # �����¸����������Ϣ
        logger.info(f"Book copy added successfully: {added_copy}")
        return added_copy
    except Exception as e:
        db.connection.rollback()
        logger.error(f"Error adding book copy: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while adding the book copy."
        )


# �û��ڲ鿴ͼ��ҳ�����鿴���и����Ϳ�����ʾ��������и���
@router.get("/{book_id}/copies", response_model=List[schemas.BookCopyOut])
async def get_book_copies(book_id: int, db=Depends(database.get_db)):
    try:
        # ����Ȿ���Ƿ����
        db.execute(GET_BOOK_BY_ID_QUERY, (book_id,))
        book = db.fetchone()
        if not book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Book with id {book_id} does not exist!"
            )

        # ȡ�������Ȿ��ĸ���
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