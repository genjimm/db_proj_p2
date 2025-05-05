from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app import schemas
from app.database import get_db

router = APIRouter(prefix="/seminars/{event_id}/sponsors", tags=["seminar-sponsors"])

@router.post("/", status_code=201, response_model=schemas.SeminarSponsorOut)
def add_seminar_sponsor(
    event_id: int,
    data: schemas.SeminarSponsorCreate,
    db = Depends(get_db)
):
    # 可先检查 seminar 与 sponsor 是否都存在
    sql = """
      INSERT INTO hzs_seminar_sponsor (event_id, sponsor_id, amount)
      VALUES (%s, %s, %s)
      RETURNING event_id, sponsor_id, amount
    """
    db.execute(sql, (event_id, data.sponsor_id, data.amount))
    rec = db.fetchone()
    if not rec:
        raise HTTPException(500, "添加 sponsor 失败")
    db.connection.commit()
    return rec

@router.get("/", response_model=List[schemas.SeminarSponsorOut])
def list_seminar_sponsors(event_id: int, db = Depends(get_db)):
    sql = """
      SELECT event_id, sponsor_id, amount
      FROM hzs_seminar_sponsor
      WHERE event_id = %s
    """
    db.execute(sql, (event_id,))
    return db.fetchall()
