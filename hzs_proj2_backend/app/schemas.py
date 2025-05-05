from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, conint
from typing import Optional, Literal
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







