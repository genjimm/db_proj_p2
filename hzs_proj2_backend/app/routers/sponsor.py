# app/routers/sponsors.py

from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app import schemas
from app.database import get_db

router = APIRouter(prefix="/sponsors", tags=["sponsors"])

@router.post(
    "/organizations",
    status_code=201,
    response_model=schemas.OrganizationOut
)
def create_organization(
    data: schemas.OrganizationCreate,
    db = Depends(get_db)
):
    # 1) 插主表，只存 sponsor_type
    db.execute(
        "INSERT INTO hzs_sponsor (sponsor_type) VALUES ('O') RETURNING sponsor_id, sponsor_type, created_at"
    )
    row = db.fetchone()
    if not row:
        raise HTTPException(500, "创建 Sponsor 失败")
    sid = row["sponsor_id"]

    # 2) 插机构子表
    db.execute(
        "INSERT INTO hzs_organization (sponsor_id, org_name) VALUES (%s, %s)",
        (sid, data.org_name)
    )
    db.connection.commit()

    # 3) 构造返回
    return {
        **row,
        "org_name": data.org_name,
    }

@router.post(
    "/individuals",
    status_code=201,
    response_model=schemas.IndividualOut
)
def create_individual(
    data: schemas.IndividualCreate,
    db = Depends(get_db)
):
    db.execute(
        "INSERT INTO hzs_sponsor (sponsor_type) VALUES ('I') RETURNING sponsor_id, sponsor_type, created_at"
    )
    row = db.fetchone()
    if not row:
        raise HTTPException(500, "创建 Sponsor 失败")
    sid = row["sponsor_id"]

    db.execute(
        "INSERT INTO hzs_individual (sponsor_id, f_name, l_name) VALUES (%s, %s, %s)",
        (sid, data.f_name, data.l_name)
    )
    db.connection.commit()

    return {
        **row,
        "f_name": data.f_name,
        "l_name": data.l_name,
    }

@router.get("/", response_model=List[schemas.SponsorOutBase])
def list_sponsors(db=Depends(get_db)):
    sql = """
    SELECT s.sponsor_id, s.sponsor_type, s.created_at,
           o.org_name,
           i.f_name, i.l_name 
    FROM hzs_sponsor s
    LEFT JOIN hzs_organization o ON s.sponsor_id = o.sponsor_id
    LEFT JOIN hzs_individual  i ON s.sponsor_id = i.sponsor_id
    ORDER BY s.sponsor_id
    """
    db.execute(sql)
    return db.fetchall()
