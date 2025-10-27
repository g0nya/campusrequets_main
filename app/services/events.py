from typing import List, Optional
from app.models.event import Event
from app.schemas.event import EventCreate

class EventService:
    def __init__(self):
        self.events_db: List[Event] = []

    def get_events(self) -> List[Event]:
        return self.events_db

    def create_event(self, event_data: EventCreate) -> Event:
        new_event = Event(
            id=len(self.events_db) + 1,
            title=event_data.title,
            date=event_data.date,
            tag=event_data.tag,
            desc=event_data.desc
        )
        self.events_db.append(new_event)
        return new_event

    def get_event_by_id(self, event_id: int) -> Optional[Event]:
        for event in self.events_db:
            if event.id == event_id:
                return event
        return None

    def delete_event(self, event_id: int) -> bool:
        for index, event in enumerate(self.events_db):
            if event.id == event_id:
                del self.events_db[index]
                return True
        return False