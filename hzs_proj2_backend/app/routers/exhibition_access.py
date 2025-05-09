from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app import schemas
from app.database import get_db

router = APIRouter(prefix="/exhibitions/{event_id}/registrations", tags=["exhibition-access"])

@router.post("/", status_code=201, response_model=schemas.RegistrationOut)
def register_exhibition(
    event_id: int,
    data: schemas.RegistrationCreate,
    db = Depends(get_db)
):
    sql = """
      INSERT INTO hzs_exhibition_access (event_id, registrant_name, registrant_email, registered_at)
      VALUES (%s, %s, %s, %s)
      RETURNING registration_id, event_id, registrant_name, registrant_email, registered_at
    """
    db.execute(sql, (event_id,  data.registrant_name, data.registrant_email, data.registered_at))
    reg = db.fetchone()
    if not reg:
        raise HTTPException(500, "创建报名失败")
    db.connection.commit()
    return reg

@router.get("/", response_model=List[schemas.RegistrationOut])
def list_registrations(event_id: int, db = Depends(get_db)):
    sql = """
      SELECT registration_id, event_id, registrant_name, registrant_email, registered_at
      FROM hzs_exhibition_access
      WHERE event_id = %s
    """
    db.execute(sql, (event_id,))
    return db.fetchall()
