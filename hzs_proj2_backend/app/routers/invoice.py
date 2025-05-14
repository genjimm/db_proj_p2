from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app import schemas
from app.database import get_db
from app.oauth2 import get_current_user

router = APIRouter(prefix="/invoices", tags=["invoices"])

# 查询当前用户所有未支付的罚单
@router.get("/unpaid", response_model=List[dict])
def get_unpaid_invoices(db=Depends(get_db), current_user=Depends(get_current_user)):
    sql = '''
        SELECT i.invoice_id, i.invoice_date, i.invoic__amount, i.rental_id
        FROM hzs_invoice i
        JOIN hzs_rental r ON i.rental_id = r.rental_id
        WHERE r.customer_id = %s
          AND NOT EXISTS (
            SELECT 1 FROM hzs_payment p WHERE p.invoice_id = i.invoice_id
          )
        ORDER BY i.invoice_date DESC
    '''
    db.execute(sql, (current_user["user_id"],))
    return db.fetchall()

# 支付罚单
@router.post("/pay/{invoice_id}", status_code=status.HTTP_201_CREATED)
def pay_invoice(invoice_id: int, payment: schemas.PaymentCreate, db=Depends(get_db), current_user=Depends(get_current_user)):
    # 检查该账单是否属于当前用户且未支付
    sql_check = '''
        SELECT i.invoice_id, i.invoic__amount, r.customer_id
        FROM hzs_invoice i
        JOIN hzs_rental r ON i.rental_id = r.rental_id
        WHERE i.invoice_id = %s FOR UPDATE
    '''
    db.execute(sql_check, (invoice_id,))
    inv = db.fetchone()
    if not inv or inv["customer_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="无权支付该账单")
    # 检查是否已支付
    db.execute("SELECT 1 FROM hzs_payment WHERE invoice_id = %s", (invoice_id,))
    if db.fetchone():
        raise HTTPException(status_code=400, detail="该账单已支付")
    # 插入支付记录
    sql_pay = '''
        INSERT INTO hzs_payment (payment_id, payment_date, method, card_holder_l_name, card_holder_f_name, amount, invoice_id)
        VALUES (DEFAULT, NOW(), %s, %s, %s, %s, %s)
        RETURNING payment_id, payment_date, amount
    '''
    db.execute(sql_pay, (
        payment.method, payment.card_holder_l_name, payment.card_holder_f_name, inv["invoic__amount"], invoice_id
    ))
    pay = db.fetchone()
    db.connection.commit()
    return pay 