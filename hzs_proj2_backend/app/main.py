from typing import Optional
from fastapi import FastAPI, Response, status, HTTPException, Depends
from .routers import customer, auth, book, rental
from pydantic import BaseModel
from .database import get_db  
from fastapi.middleware.cors import CORSMiddleware
from .routers import seminars, exhibitions

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(customer.router)

app.include_router(auth.router)

app.include_router(seminars.router)

app.include_router(exhibitions.router)

app.include_router(book.router)

app.include_router(rental.router)


@app.get('/')
async def root():
    return {"message": "hello world!123"}



@app.get('/posts')
async def get_posts(db=Depends(get_db)):
    db.execute(""" SELECT * FROM posts """)
    posts = db.fetchall()
    print(posts)
    return {"data": posts}

