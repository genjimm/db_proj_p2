from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, conint
from typing import Optional, Literal
from datetime import datetime
# Schema/Pydantic Models define the structure of a request & response
# This ensure that when a user wants to create a post, the request will
#  only go through if it has a valid field in the body"



class UserCreate(BaseModel):
    email: EmailStr
    password: str
    phone_number: Optional[str] = Field(None, pattern=r"^\+?[1-9]\d{1,14}$") 

class UserOut(BaseModel):
    id: int
    email: str
    phone_number: Optional[str]
    created_at: datetime

    class Config:
        orm_mode = True

class UserLogin(BaseModel):
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
    








