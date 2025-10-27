from fastapi import FastAPI, HTTPException, status
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

# Инициализация приложения FastAPI
app = FastAPI(title="CampusQuest API")

# --- Настройка CORS (Cross-Origin Resource Sharing) ---
# Это позволяет вашему фронтенду, запущенному, например, на Live Server,
# обращаться к API. В продакшене лучше указывать конкретные домены.
origins = [
    "*",  # Разрешить все источники (только для разработки!)
    "http://localhost",
    "http://localhost:8000",
    "http://127.0.0.1",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Разрешить все HTTP-методы
    allow_headers=["*"],  # Разрешить все заголовки
)

# --- Обслуживание статических файлов (CSS, JS) ---
# Монтируем директории, где хранятся статические ресурсы (css, js).
# Эти файлы будут доступны по /css/... и /js/...
try:
    app.mount("/css", StaticFiles(directory="css"), name="css")
    app.mount("/js", StaticFiles(directory="js"), name="js")
except RuntimeError:
    # Игнорируем ошибку, если папки css/js не существуют, но лучше их создать
    pass

# --- Pydantic модели для API ---

class Event(BaseModel):
    """Модель для события в Афише"""
    id: int
    title: str
    date: str
    tag: str
    desc: Optional[str] = None

class Question(BaseModel):
    """Модель для вопроса в Квиз-охоте"""
    id: int
    question: str
    answers: List[str]
    correct_answer: str

# --- Заглушки данных ---

# Список событий
events_db: List[Event] = [
    Event(id=1, title="Концерт 'СтудВесна'", date="2025-11-10", tag="music", desc="Ежегодный концерт"),
    Event(id=2, title="Хакатон 'CodeQuest'", date="2025-12-05", tag="tech", desc="24 часа кодинга"),
    Event(id=3, title="Турнир по баскетболу", date="2025-11-20", tag="sport", desc="Соревнования между факультетами"),
]

# Список вопросов квиза
questions_db: List[Question] = [
    Question(id=1, question="Как называется главный корпус кампуса?", answers=["Корпус А", "Корпус Б", "Корпус Z"], correct_answer="Корпус А"),
    Question(id=2, question="Какой год основания университета?", answers=["1995", "1980", "2000"], correct_answer="1995"),
]

# --- API Маршруты ---

@app.get("/api/events", response_model=List[Event], tags=["Events"])
async def get_events():
    """Возвращает список всех событий."""
    return events_db

@app.post("/api/events", response_model=Event, status_code=status.HTTP_201_CREATED, tags=["Events"])
async def create_event(event: Event):
    """Добавляет новое событие."""
    # В реальном приложении здесь была бы логика сохранения в базу данных
    new_id = len(events_db) + 1
    event.id = new_id
    events_db.append(event)
    return event

@app.get("/api/questions", response_model=List[Question], tags=["Game"])
async def get_questions():
    """Возвращает список всех вопросов для квиза."""
    # В идеале нужно исключить 'correct_answer' при отдаче фронтенду,
    # но для простоты оставляем так.
    return questions_db

# --- Маршруты для HTML-страниц ---

# Функция для возврата HTML-файла
def serve_html(filename: str):
    """Возвращает указанный HTML-файл или 404, если файл не найден."""
    try:
        return FileResponse(filename, media_type="text/html")
    except FileNotFoundError:
        return HTMLResponse(content="<h1>404 Not Found</h1>", status_code=404)

@app.get("/", response_class=HTMLResponse, include_in_schema=False)
async def serve_index():
    return serve_html("index.html")

@app.get("/index.html", response_class=HTMLResponse, include_in_schema=False)
async def serve_index_html():
    return serve_html("index.html")

@app.get("/events.html", response_class=HTMLResponse, include_in_schema=False)
async def serve_events():
    return serve_html("events.html")

@app.get("/game.html", response_class=HTMLResponse, include_in_schema=False)
async def serve_game():
    return serve_html("game.html")

@app.get("/about.html", response_class=HTMLResponse, include_in_schema=False)
async def serve_about():
    return serve_html("about.html")