from typing import Optional
from fastapi import FastAPI, Depends
from .routers import customer, auth, book, rental, seminars, exhibitions, seminar_sponsor, seminar_access, sponsor, exhibition_access, author, event, invoice, room, room_reservation
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


app.include_router(customer.router)

app.include_router(auth.router)

app.include_router(book.router)

app.include_router(rental.router)

app.include_router(seminars.router)

app.include_router(exhibitions.router)

app.include_router(sponsor.router)

app.include_router(seminar_sponsor.router)

app.include_router(seminar_access.router)

app.include_router(exhibition_access.router)

app.include_router(author.router)

app.include_router(event.router)

app.include_router(invoice.router)

app.include_router(room.router)

app.include_router(room_reservation.router)


@app.get('/')
async def root():
    return {"message": "hello world!123"}



@app.get('/posts')
async def get_posts(db=Depends(get_db)):
    db.execute(""" SELECT * FROM posts """)
    posts = db.fetchall()
    print(posts)
    return {"data": posts}

