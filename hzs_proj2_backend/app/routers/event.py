from fastapi import APIRouter, Depends, HTTPException, status
from .. import schemas, database, oauth2
from typing import List

router = APIRouter(
    prefix="/event",
    tags=["event"]
)

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_event(event: schemas.EventCreate, db=Depends(database.get_db), current_user=Depends(oauth2.get_current_user)):
    # Check if user is admin
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to perform this action"
        )
    
    # Insert into HZS_EVENT
    db.execute("""
        INSERT INTO hzs_event (e_name, event_type, start_datetime, stop_datetime, topic)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING event_id
    """, (event.e_name, event.event_type, event.start_datetime, event.stop_datetime, event.topic))
    
    new_event = db.fetchone()
    db.connection.commit()
    
    # Insert into specific event type table
    if event.event_type == 'E':
        db.execute("""
            INSERT INTO hzs_exhibition (event_id, expense)
            VALUES (%s, %s)
        """, (new_event['event_id'], event.expense))
    else:  # event_type == 'S'
        db.execute("""
            INSERT INTO hzs_seminar (event_id, descrip)
            VALUES (%s, %s)
        """, (new_event['event_id'], event.descrip))
    
    db.connection.commit()
    return new_event

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(event_id: int, db=Depends(database.get_db), current_user=Depends(oauth2.get_current_user)):
    # Check if user is admin
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to perform this action"
        )
    
    # Get event type
    db.execute("SELECT event_type FROM hzs_event WHERE event_id = %s", (event_id,))
    event = db.fetchone()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with id {event_id} does not exist"
        )
    
    # Delete from specific event type table first
    if event['event_type'] == 'E':
        # First delete related records in hzs_exhibition_access
        db.execute("DELETE FROM hzs_exhibition_access WHERE event_id = %s", (event_id,))
        # Then delete from hzs_exhibition
        db.execute("DELETE FROM hzs_exhibition WHERE event_id = %s", (event_id,))
    else:  # event_type == 'S'
        # 先删 sponsor 关系
        db.execute("DELETE FROM hzs_seminar_sponsor WHERE event_id = %s", (event_id,))
        # First delete related records in hzs_seminar_access
        db.execute("DELETE FROM hzs_seminar_access WHERE event_id = %s", (event_id,))
        # Then delete from hzs_seminar
        db.execute("DELETE FROM hzs_seminar WHERE event_id = %s", (event_id,))
    
    # Finally delete from main event table
    db.execute("DELETE FROM hzs_event WHERE event_id = %s", (event_id,))
    db.connection.commit()
    
    return None 