from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app import schemas
from app.database import get_db

router = APIRouter(prefix="/seminars/{event_id}/invitations", tags=["seminar-access"])

@router.post("/", status_code=201, response_model=schemas.InvitationOut)
def create_invitation(
    event_id: int,
    data: schemas.InvitationCreate,
    db = Depends(get_db)
):
    sql = """
      INSERT INTO hzs_seminar_access (event_id, invitee_name, invitee_email, invited_at)
      VALUES (%s, %s, %s, %s)
      RETURNING invitation_id, event_id, invitee_name, invitee_email, invited_at
    """
    db.execute(sql, (event_id, data.invitee_name, data.invitee_email, data.invited_at))
    inv = db.fetchone()
    if not inv:
        raise HTTPException(500, "创建邀请失败")
    db.connection.commit()
    return inv

@router.get("/", response_model=List[schemas.InvitationOut])
def list_invitations(event_id: int, db = Depends(get_db)):
    sql = """
      SELECT invitation_id, event_id, invitee_name, invitee_email, invited_at
      FROM hzs_seminar_access
      WHERE event_id = %s
    """
    db.execute(sql, (event_id,))
    return db.fetchall()
