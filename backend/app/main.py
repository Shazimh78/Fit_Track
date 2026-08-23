from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.mongodb import init_indexes
from app.routers import admin, auth, chat, dashboard, exercises, recommend

app = FastAPI(title="Fit-Track API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://fit-track-eta-three.vercel.app",
    ],
    allow_origin_regex=r"https://fit-track.*-shazim-hassans-projects\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(exercises.router)
app.include_router(recommend.router)
app.include_router(dashboard.router)
app.include_router(chat.router)
app.include_router(admin.router)


@app.on_event("startup")
async def on_startup():
    await init_indexes()


@app.get("/health")
async def health():
    return {"status": "ok"}
