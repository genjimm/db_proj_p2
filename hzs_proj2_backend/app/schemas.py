from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, conint
from typing import Annotated, Optional, Literal
from datetime import datetime
# Schema/Pydantic Models define the structure of a request & response
# This ensure that when a Customer wants to create a post, the request will
#  only go through if it has a valid field in the body"


class CustomerBase(BaseModel):
    l_name: str
    f_name: str
    phone: Optional[str] = Field(None, pattern=r"^\+?[1-9]\d{1,14}$") 
    email: EmailStr
    id_type: str
    id_num: str
    
class CustomerCreate(CustomerBase):
    password: str
    

class CustomerOut(CustomerBase):
    customer_id: int

    class Config:
        orm_mode = True

class CustomerLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    id: Optional[int] = None


class BookBase(BaseModel):
    b_name: str = Field(..., min_length=1, max_length=50)
    topic: Optional[str] = Field(None, max_length=20)

class BookOut(BookBase):
    book_id: int
    class Config:
        orm_mode = True

class BookCreate(BookBase):
    pass



class BookCopyCreate(BaseModel):
    status: Literal["AVAILABLE", "UNAVAILABLE"] 


class BookCopyOut(BaseModel):
    copy_id: int
    book_id: int
    status: str


class RentalCreate(BaseModel):
    borrow_date: datetime
    expected_return_date: datetime
    customer_id: int
    copy_id: int

class RentalReturn(BaseModel):
    actual_return_date: datetime

class RentalOut(BaseModel):
    rental_id: int
    rental_status: str
    borrow_date: datetime
    expected_return_date: datetime
    actual_return_date: Optional[datetime]
    customer_id: int
    copy_id: int

    class Config:
        orm_mode = True


class EventBase(BaseModel):
    e_name: str
    event_type: str
    start_datetime: datetime
    stop_datetime: datetime
    topic: str

class EventCreate(EventBase):
    expense: Optional[float] = None
    descrip: Optional[str] = None

    class Config:
        orm_mode = True

class EventOut(EventBase):
    event_id: int = Field(..., alias="event_id")
    created_at: datetime
    class Config:
        orm_mode = True

class ExhibitionCreate(EventBase):
    expense: float = Field(..., ge=0, description="展览费用")

class ExhibitionOut(ExhibitionCreate):
    event_id: int
    expense: float

    
class AuthorBase(BaseModel):
    f_name: str
    l_name: str
    email: EmailStr
    state: str
    country: str
    street: str
    city: str

class AuthorCreate(AuthorBase):
    pass

class AuthorOut(AuthorBase):
    author_id: int

    class Config:
        orm_mode = True




class SeminarCreate(EventBase):
    descrip: str   = Field(..., description="研讨会说明")

class SeminarOut(SeminarCreate):
    event_id: int
    descrip: str


class SponsorOutBase(BaseModel):
    sponsor_id: int
    sponsor_type: Literal["O", "I"]
    created_at: Optional[datetime]  = None
    model_config = {"from_attributes": True}

# —— 机构 Sponsor —— 
class OrganizationCreate(BaseModel):
    org_name: str = Field(..., description="机构名称")
    

class OrganizationOut(SponsorOutBase):
    sponsor_type: Literal["O"] 
    org_name: str
    

# —— 个人 Sponsor —— 
class IndividualCreate(BaseModel):
    f_name: str = Field(..., description="名")
    l_name: str = Field(..., description="姓")
    

class IndividualOut(SponsorOutBase):
    sponsor_type: Literal["I"] 
    f_name: str
    l_name: str
    

# —— Seminar ↔ Sponsor 关联表 —— 
class SeminarSponsorCreate(BaseModel):
    sponsor_id: int
    amount: float

class SeminarSponsorOut(BaseModel):
    event_id: int
    sponsor_id: int
    amount: float

# —— Seminar 邀请表 —— 
class InvitationCreate(BaseModel):
    invitee_name: str
    invitee_email: str
    invited_at: datetime


class InvitationOut(InvitationCreate):
    invitation_id: int
    event_id: int
    invitee_name: str
    invitee_email: str
    invited_at: datetime

    class Config:
        orm_mode = True

# —— Exhibition 报名表 —— 
class RegistrationCreate(BaseModel):
    registrant_name: str
    registrant_email: str
    registered_at: datetime


class RegistrationOut(RegistrationCreate):
    registration_id: int
    event_id: int
    registrant_name: str
    registrant_email: str
    registered_at: datetime

    class Config:
        orm_mode = True

class PaymentCreate(BaseModel):
    method: str = Field(..., description="支付方式，如CASH、CREDIT、DEBIT、PAYPAL")
    card_holder_l_name: str = Field(..., description="持卡人姓氏")
    card_holder_f_name: str = Field(..., description="持卡人名字")

