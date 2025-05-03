from typing import Optional
from fastapi import FastAPI, Response, status, HTTPException, Depends
from .routers import user, auth
from pydantic import BaseModel
from .database import get_db  
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(user.router)

app.include_router(auth.router)


@app.get('/')
async def root():
    return {"message": "hello world!123"}



@app.get('/posts')
async def get_posts(db=Depends(get_db)):
    db.execute(""" SELECT * FROM posts """)
    posts = db.fetchall()
    print(posts)
    return {"data": posts}

