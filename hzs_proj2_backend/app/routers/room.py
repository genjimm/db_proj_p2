from fastapi import APIRouter, HTTPException, Depends, status
from .. import database
from typing import List
from pydantic import BaseModel

class RoomBase(BaseModel):
    capacity: int

    class Config:
        json_schema_extra = {
            "example": {
                "capacity": 4
            }
        }

class RoomCreate(RoomBase):
    pass

class RoomUpdate(RoomBase):
    pass

class RoomResponse(RoomBase):
    room_id: int

    class Config:
        from_attributes = True

router = APIRouter(
    prefix="/room",
    tags=["room"]
)

# CREATE
@router.post("/", status_code=status.HTTP_201_CREATED, response_model=RoomResponse)
async def create_room(room: RoomCreate, db=Depends(database.get_db)):
    """
    Create a new study room.
    
    Parameters:
    - capacity: Maximum number of people that can use the room
    """
    try:
        db.execute(
            """
            INSERT INTO hzs_study_room (capacity)
            VALUES (%s)
            RETURNING room_id, capacity
            """,
            (room.capacity,)
        )
        room = db.fetchone()
        db.connection.commit()
        return room
    except Exception as e:
        db.connection.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# READ ALL
@router.get("/", response_model=List[RoomResponse])
async def get_rooms(db=Depends(database.get_db)):
    """
    Get all study rooms.
    """
    db.execute("SELECT * FROM hzs_study_room")
    return db.fetchall()

# READ ONE
@router.get("/{room_id}", response_model=RoomResponse)
async def get_room(room_id: int, db=Depends(database.get_db)):
    """
    Get a specific study room by ID.
    
    Parameters:
    - room_id: ID of the room to retrieve
    """
    db.execute("SELECT * FROM hzs_study_room WHERE room_id = %s", (room_id,))
    room = db.fetchone()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room

# UPDATE
@router.put("/{room_id}", response_model=RoomResponse)
async def update_room(room_id: int, room: RoomUpdate, db=Depends(database.get_db)):
    """
    Update an existing study room.
    
    Parameters:
    - room_id: ID of the room to update
    - capacity: New maximum number of people that can use the room
    """
    db.execute(
        """
        UPDATE hzs_study_room
        SET capacity = %s
        WHERE room_id = %s
        RETURNING room_id, capacity
        """,
        (room.capacity, room_id)
    )
    room = db.fetchone()
    db.connection.commit()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room

# DELETE
@router.delete("/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_room(room_id: int, db=Depends(database.get_db)):
    """
    Delete a study room.
    
    Parameters:
    - room_id: ID of the room to delete
    """
    db.execute("DELETE FROM hzs_study_room WHERE room_id = %s", (room_id,))
    db.connection.commit()
    if db.rowcount == 0:
        raise HTTPException(status_code=404, detail="Room not found")

