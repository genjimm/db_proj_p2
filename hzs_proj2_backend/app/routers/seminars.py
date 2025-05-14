# app/routers/seminars.py
from typing import List
from fastapi    import APIRouter, Depends, HTTPException, status
from app        import schemas
from app.database import get_db
from app.oauth2 import get_current_user

router = APIRouter(
    prefix="/seminars",
    tags=["seminars"]
)

@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    response_model=schemas.SeminarOut
)
def create_seminar(
    sem: schemas.SeminarCreate,
    db  = Depends(get_db) 
):

    sql_event = """
      INSERT INTO HZS_EVENT
        (e_name, topic, start_datetime, stop_datetime, event_type)
      VALUES
        (%s, %s, %s, %s, 'S')
      RETURNING event_id, e_name, topic, start_datetime, stop_datetime, event_type
    """
    db.execute(
        sql_event,
        (sem.e_name, sem.topic, sem.start_datetime, sem.stop_datetime)
    )
    new_event = db.fetchone()
    if not new_event:
        raise HTTPException(500, "Failed to create base event")

    sql_sem = """
      INSERT INTO HZS_SEMINAR (event_id, descrip)
      VALUES (%s, %s)
    """
    db.execute(sql_sem, (new_event["event_id"], sem.descrip))


    db.connection.commit()
    return {
        "event_id":       new_event["event_id"],
        "e_name":         new_event["e_name"],
        "topic":          new_event["topic"],
        "start_datetime": new_event["start_datetime"],
        "stop_datetime":  new_event["stop_datetime"],
        "event_type":     new_event["event_type"],
        "descrip":        sem.descrip,
    }

@router.get("/", response_model=List[schemas.SeminarOut])
def list_seminars(db = Depends(get_db)):
    sql = """
      SELECT e.event_id, e.e_name, e.topic,
             e.start_datetime, e.stop_datetime,
             e.event_type, s.descrip
      FROM HZS_EVENT e
      JOIN HZS_SEMINAR s USING (event_id)
      WHERE e.event_type = 'S'
      ORDER BY e.start_datetime
    """
    db.execute(sql)
    rows = db.fetchall()
    return [
        {
          "event_id":       r["event_id"],
          "e_name":         r["e_name"],
          "topic":          r["topic"],
          "start_datetime": r["start_datetime"],
          "stop_datetime":  r["stop_datetime"],
          "event_type":     r["event_type"],
          "descrip":        r["descrip"]
        }
        for r in rows
    ]

@router.get("/{event_id}", response_model=schemas.SeminarOut)
def get_seminar(event_id: int, db = Depends(get_db)):
    sql = """
      SELECT e.event_id, e.e_name, e.topic,
             e.start_datetime, e.stop_datetime,
             e.event_type, s.descrip
      FROM HZS_EVENT e
      JOIN HZS_SEMINAR s USING (event_id)
      WHERE e.event_type = 'S'
        AND e.event_id = %s
    """
    db.execute(sql, (event_id,))
    row = db.fetchone()
    if not row:
        raise HTTPException(
          status_code=status.HTTP_404_NOT_FOUND,
          detail=f"Seminar {event_id} not found"
        )
    return {
        "event_id":       row["event_id"],
        "e_name":         row["e_name"],
        "topic":          row["topic"],
        "start_datetime": row["start_datetime"],
        "stop_datetime":  row["stop_datetime"],
        "event_type":     row["event_type"],
        "descrip":        row["descrip"],
    }

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_seminar(event_id: int, db=Depends(get_db), current_user=Depends(get_current_user)):
    # Check if user is admin
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to perform this action"
        )

    db.execute("DELETE FROM hzs_seminar_sponsor WHERE event_id = %s", (event_id,))

    db.execute("DELETE FROM hzs_seminar_access WHERE event_id = %s", (event_id,))

    db.execute("DELETE FROM hzs_seminar WHERE event_id = %s", (event_id,))

    db.execute("DELETE FROM hzs_event WHERE event_id = %s", (event_id,))
    db.connection.commit()
    return None
