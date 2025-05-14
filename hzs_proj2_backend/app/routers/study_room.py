from fastapi import APIRouter, Depends, status, HTTPException
from .. import schemas, database
from ..oauth2 import get_current_user
from typing import List
import logging
from datetime import datetime

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/study-room",
    tags=["study-room"]
)

# Queries
GET_ALL_ROOMS_QUERY = """
    SELECT room_id, capacity
    FROM hzs_study_room
    ORDER BY room_id
"""

GET_ROOM_BY_ID_QUERY = """
    SELECT room_id, capacity
    FROM hzs_study_room
    WHERE room_id = %s FOR UPDATE
"""

GET_ROOM_RESERVATIONS_QUERY = """
    SELECT r.reservation_id, r.topic_description, r.reserve_date, 
           r.start_time, r.end_time, r.group_size, r.customer_id, 
           r.room_id, r.l_name, r.f_name
    FROM hzs_room_reservation r
    WHERE r.room_id = %s
    AND r.reserve_date = %s
    FOR UPDATE
    ORDER BY r.start_time
"""

ADD_RESERVATION_QUERY = """
    INSERT INTO hzs_room_reservation (
        topic_description, reserve_date, start_time, end_time,
        group_size, customer_id, room_id, l_name, f_name
    )
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    RETURNING reservation_id, topic_description, reserve_date, 
              start_time, end_time, group_size, customer_id, 
              room_id, l_name, f_name
"""

GET_CUSTOMER_RESERVATIONS_QUERY = """
    SELECT r.reservation_id, r.topic_description, r.reserve_date, 
           r.start_time, r.end_time, r.group_size, r.customer_id, 
           r.room_id, r.l_name, r.f_name
    FROM hzs_room_reservation r
    WHERE r.customer_id = %s
    ORDER BY r.reserve_date DESC, r.start_time
"""

@router.get("/", response_model=List[schemas.StudyRoomOut])
async def get_all_rooms(db=Depends(database.get_db)):
    try:
        db.execute(GET_ALL_ROOMS_QUERY)
        rooms = db.fetchall()
        return rooms
    except Exception as e:
        logger.error(f"Error retrieving rooms: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving rooms."
        )

@router.get("/{room_id}", response_model=schemas.StudyRoomOut)
async def get_room_by_id(room_id: int, db=Depends(database.get_db)):
    try:
        db.execute(GET_ROOM_BY_ID_QUERY, (room_id,))
        room = db.fetchone()
        if not room:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Room with id {room_id} does not exist!"
            )
        return room
    except Exception as e:
        logger.error(f"Error retrieving room: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving the room."
        )

@router.get("/{room_id}/reservations", response_model=List[schemas.RoomReservationOut])
async def get_room_reservations(
    room_id: int,
    date: str,
    db=Depends(database.get_db)
):
    try:
        db.execute(GET_ROOM_RESERVATIONS_QUERY, (room_id, date))
        reservations = db.fetchall()
        return reservations
    except Exception as e:
        logger.error(f"Error retrieving room reservations: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving room reservations."
        )

@router.post("/reservation", status_code=status.HTTP_201_CREATED, response_model=schemas.RoomReservationOut)
async def create_reservation(
    reservation: schemas.RoomReservationCreate,
    db=Depends(database.get_db),
    current_user=Depends(get_current_user)
):
    try:
        # Check if room exists and has sufficient capacity
        db.execute(GET_ROOM_BY_ID_QUERY, (reservation.room_id,))
        room = db.fetchone()
        if not room:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Room with id {reservation.room_id} does not exist!"
            )
        if room['capacity'] < reservation.group_size:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Room capacity ({room['capacity']}) is less than group size ({reservation.group_size})"
            )

        # Check for overlapping reservations
        db.execute(GET_ROOM_RESERVATIONS_QUERY, (reservation.room_id, reservation.reserve_date))
        existing_reservations = db.fetchall()
        for existing in existing_reservations:
            if (reservation.start_time < existing['end_time'] and 
                reservation.end_time > existing['start_time']):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="This time slot overlaps with an existing reservation"
                )

        # Create the reservation
        db.execute(
            ADD_RESERVATION_QUERY,
            (
                reservation.topic_description,
                reservation.reserve_date,
                reservation.start_time,
                reservation.end_time,
                reservation.group_size,
                current_user['user_id'],
                reservation.room_id,
                reservation.l_name,
                reservation.f_name
            )
        )
        new_reservation = db.fetchone()
        db.connection.commit()
        return new_reservation
    except HTTPException:
        db.connection.rollback()
        raise
    except Exception as e:
        db.connection.rollback()
        logger.error(f"Error creating reservation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while creating the reservation."
        )

@router.get("/my-reservations", response_model=List[schemas.RoomReservationOut])
async def get_my_reservations(
    db=Depends(database.get_db),
    current_user=Depends(get_current_user)
):
    try:
        db.execute(GET_CUSTOMER_RESERVATIONS_QUERY, (current_user['user_id'],))
        reservations = db.fetchall()
        logger.info(f"Retrieved reservations: {reservations}")
        return reservations
    except Exception as e:
        logger.error(f"Error retrieving reservations: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving reservations."
        ) 