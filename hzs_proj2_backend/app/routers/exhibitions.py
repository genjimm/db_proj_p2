# app/routers/exhibitions.py
from fastapi import APIRouter, Depends, HTTPException, status
from app import schemas
from app.database import get_db
from typing import List
from app.oauth2 import get_current_user

router = APIRouter(
    prefix="/exhibitions",
    tags=["exhibitions"]
)

@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    response_model=schemas.ExhibitionOut
)
def create_exhibition(
    exh: schemas.ExhibitionCreate,
    db = Depends(get_db)
):

    insert_event_sql = """
        INSERT INTO hzs_event
          (e_name, topic, start_datetime, stop_datetime, event_type)
        VALUES (%s, %s, %s, %s, 'E')
        RETURNING event_id, e_name, topic, start_datetime, stop_datetime, event_type
    """
    db.execute(insert_event_sql, (
        exh.e_name,
        exh.topic,
        exh.start_datetime,
        exh.stop_datetime
    ))
    new_event = db.fetchone()
    if not new_event:
        raise HTTPException(500, "Failed to create base event")


    insert_exh_sql = """
        INSERT INTO hzs_exhibition (event_id, expense)
        VALUES (%s, %s)
    """
    db.execute(insert_exh_sql, (
        new_event["event_id"],
        exh.expense
    ))

    db.connection.commit()

    return {
        "event_id":       new_event["event_id"],
        "e_name":         new_event["e_name"],
        "topic":          new_event["topic"],
        "start_datetime": new_event["start_datetime"],
        "stop_datetime":  new_event["stop_datetime"],
        "event_type":     new_event["event_type"],
        "expense":        exh.expense
    }

@router.get(
    "/",
    response_model=List[schemas.ExhibitionOut]
)
def list_exhibitions(db = Depends(get_db)):
    query = """
        SELECT e.event_id, e.e_name, e.topic,
               e.start_datetime, e.stop_datetime,
               e.event_type, x.expense
        FROM hzs_event e
        JOIN hzs_exhibition x
          ON e.event_id = x.event_id
        WHERE e.event_type = 'E'
        ORDER BY e.start_datetime
    """
    db.execute(query)
    rows = db.fetchall()
    return [
        {
          "event_id":        r["event_id"],
          "e_name":          r["e_name"],
          "topic":           r["topic"],
          "start_datetime":  r["start_datetime"],
          "stop_datetime":   r["stop_datetime"],
          "event_type":      r["event_type"],
          "expense":         r["expense"]
        }
        for r in rows
    ]

@router.get(
    "/{event_id}",
    response_model=schemas.ExhibitionOut
)
def get_exhibition(event_id: int, db = Depends(get_db)):
    query = """
        SELECT e.event_id, e.e_name, e.topic,
               e.start_datetime, e.stop_datetime,
               e.event_type, x.expense
        FROM hzs_event e
        JOIN hzs_exhibition x
          ON e.event_id = x.event_id
        WHERE e.event_type = 'E'
          AND e.event_id = %s
    """
    db.execute(query, (event_id,))
    row = db.fetchone()
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Exhibition {event_id} not found"
        )
    return {
        "event_id":       row["event_id"],
        "e_name":         row["e_name"],
        "topic":          row["topic"],
        "start_datetime": row["start_datetime"],
        "stop_datetime":  row["stop_datetime"],
        "event_type":     row["event_type"],
        "expense":        row["expense"]
    }

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_exhibition(event_id: int, db=Depends(get_db), current_user=Depends(get_current_user)):
    # Check if user is admin
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to perform this action"
        )
    
    # First delete related records in hzs_exhibition_access
    db.execute("DELETE FROM hzs_exhibition_access WHERE event_id = %s", (event_id,))
    
    # Then delete from hzs_exhibition
    db.execute("DELETE FROM hzs_exhibition WHERE event_id = %s", (event_id,))
    
    # Finally delete from main event table
    db.execute("DELETE FROM hzs_event WHERE event_id = %s", (event_id,))
    
    db.connection.commit()
    return None
