from fastapi import APIRouter, HTTPException, status
from app.schemas.event import EventCreate, EventResponse
from app.services.events import EventService

router = APIRouter()

@router.get("/", response_model=list[EventResponse], tags=["Events"])
async def get_events():
    events = await EventService.get_all_events()
    return events

@router.post("/", response_model=EventResponse, status_code=status.HTTP_201_CREATED, tags=["Events"])
async def create_event(event: EventCreate):
    created_event = await EventService.create_event(event)
    return created_event