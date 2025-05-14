from fastapi import APIRouter, HTTPException, Depends, status
from .. import database
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

class RoomReservationBase(BaseModel):
    room_id: int
    topic_description: str
    reserve_date: datetime
    start_time: datetime
    end_time: datetime
    group_size: int
    l_name: str
    f_name: str
    customer_id: Optional[int] = None

    class Config:
        json_schema_extra = {
            "example": {
                "room_id": 1,
                "topic_description": "Group Study Session",
                "reserve_date": "2024-05-14T05:31:22.140Z",
                "start_time": "2024-05-14T14:00:00.000Z",
                "end_time": "2024-05-14T16:00:00.000Z",
                "group_size": 4,
                "l_name": "Smith",
                "f_name": "John",
                "customer_id": 1
            }
        }

class RoomReservationCreate(RoomReservationBase):
    pass

class RoomReservationUpdate(RoomReservationBase):
    pass

class RoomReservationResponse(RoomReservationBase):
    reservation_id: int

    class Config:
        from_attributes = True

router = APIRouter(
    prefix="/room-reservation",
    tags=["room-reservation"]
)

# CREATE
@router.post("/", status_code=status.HTTP_201_CREATED, response_model=RoomReservationResponse)
async def create_reservation(
    reservation: RoomReservationCreate,
    db=Depends(database.get_db)
):
    """
    Create a new room reservation.
    
    Parameters:
    - room_id: ID of the room to reserve
    - topic_description: Description of the reservation purpose
    - reserve_date: Date of the reservation (ISO 8601 format)
    - start_time: Start time of the reservation (ISO 8601 format)
    - end_time: End time of the reservation (ISO 8601 format)
    - group_size: Number of people in the group
    - l_name: Last name of the person making the reservation
    - f_name: First name of the person making the reservation
    - customer_id: Optional ID of the customer making the reservation
    """
    try:
        db.execute(
            """
            INSERT INTO hzs_room_reservation
            (room_id, topic_description, reserve_date, start_time, end_time, group_size, l_name, f_name, customer_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING reservation_id, room_id, topic_description, reserve_date, start_time, end_time, group_size, l_name, f_name, customer_id
            """,
            (
                reservation.room_id,
                reservation.topic_description,
                reservation.reserve_date,
                reservation.start_time,
                reservation.end_time,
                reservation.group_size,
                reservation.l_name,
                reservation.f_name,
                reservation.customer_id
            )
        )
        reservation = db.fetchone()
        db.connection.commit()
        return reservation
    except Exception as e:
        db.connection.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# READ ALL
@router.get("/", response_model=List[RoomReservationResponse])
async def get_reservations(db=Depends(database.get_db)):
    """
    Get all room reservations.
    """
    db.execute("SELECT * FROM hzs_room_reservation")
    return db.fetchall()

# READ ONE
@router.get("/{reservation_id}", response_model=RoomReservationResponse)
async def get_reservation(reservation_id: int, db=Depends(database.get_db)):
    """
    Get a specific room reservation by ID.
    
    Parameters:
    - reservation_id: ID of the reservation to retrieve
    """
    db.execute("SELECT * FROM hzs_room_reservation WHERE reservation_id = %s", (reservation_id,))
    reservation = db.fetchone()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return reservation

# GET RESERVATIONS BY ROOM ID
@router.get("/room/{room_id}", response_model=List[RoomReservationResponse])
async def get_reservations_by_room(room_id: int, db=Depends(database.get_db)):
    """
    Get all reservations for a specific room.
    
    Parameters:
    - room_id: ID of the room to get reservations for
    """
    try:
        db.execute(
            """
            SELECT * FROM hzs_room_reservation 
            WHERE room_id = %s 
            ORDER BY reserve_date, start_time
            """,
            (room_id,)
        )
        reservations = db.fetchall()
        return reservations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# UPDATE
@router.put("/{reservation_id}", response_model=RoomReservationResponse)
async def update_reservation(
    reservation_id: int,
    reservation: RoomReservationUpdate,
    db=Depends(database.get_db)
):
    """
    Update an existing room reservation.
    
    Parameters:
    - reservation_id: ID of the reservation to update
    - room_id: ID of the room to reserve
    - topic_description: Description of the reservation purpose
    - reserve_date: Date of the reservation (ISO 8601 format)
    - start_time: Start time of the reservation (ISO 8601 format)
    - end_time: End time of the reservation (ISO 8601 format)
    - group_size: Number of people in the group
    - l_name: Last name of the person making the reservation
    - f_name: First name of the person making the reservation
    - customer_id: Optional ID of the customer making the reservation
    """
    db.execute(
        """
        UPDATE hzs_room_reservation
        SET topic_description=%s, reserve_date=%s, start_time=%s, end_time=%s, group_size=%s, l_name=%s, f_name=%s, customer_id=%s
        WHERE reservation_id=%s
        RETURNING reservation_id, room_id, topic_description, reserve_date, start_time, end_time, group_size, l_name, f_name, customer_id
        """,
        (
            reservation.topic_description,
            reservation.reserve_date,
            reservation.start_time,
            reservation.end_time,
            reservation.group_size,
            reservation.l_name,
            reservation.f_name,
            reservation.customer_id,
            reservation_id
        )
    )
    reservation = db.fetchone()
    db.connection.commit()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return reservation

# DELETE
@router.delete("/{reservation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_reservation(reservation_id: int, db=Depends(database.get_db)):
    """
    Delete a room reservation.
    
    Parameters:
    - reservation_id: ID of the reservation to delete
    """
    db.execute("DELETE FROM hzs_room_reservation WHERE reservation_id = %s", (reservation_id,))
    db.connection.commit()
    if db.rowcount == 0:
        raise HTTPException(status_code=404, detail="Reservation not found")