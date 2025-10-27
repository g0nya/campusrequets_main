/*
  Универсальный скрипт: содержит логику для игры (game.html).
  Если на странице нет #quiz-root — скрипт тихо завершается.
*/

(function () {
    const root = document.getElementById('quiz-root');
    if (!root) return; // не на странице игры

    // Набор вопросов — можно расширять или загружать с сервера
    const QUESTION_BANK = [
        { q: 'Кто сделал лучший сайт на свете?', opts: ['Гончаров Чернов Паршуков Ильченко', 'Глеб с Лехой', 'Другие красавчики', 'Никто'], a: 0, tag: 'campus' },
        { q: 'Какой предмет обычно изучают на хакатонах?', opts: ['История', 'Программирование', 'Литература', 'Биология'], a: 1, tag: 'tech' },
        { q: 'Какой вид спорта самый популярный в России?', opts: ['Футбол', 'Плавание', 'Гольф', 'Бейсбол'], a: 0, tag: 'sport' },
        { q: 'Как называют событие с живой музыкой?', opts: ['Лекция', 'Афиша', 'Концерт', 'Семинар'], a: 2, tag: 'music' },
        { q: 'Что помогает при командной работе?', opts: ['Коммуникация', 'Изоляция', 'Одиночество', 'Случайность'], a: 0, tag: 'team' },
        { q: 'Лучший способ быстро учиться — это...', opts: ['Ничего не делать', 'Практика', 'Пропускать занятия', 'Игры только'], a: 1, tag: 'study' },
        { q: 'Что такое pull request?', opts: ['Заявка в библиотеку', 'Запрос на слияние кода', 'Тип билета', 'Форма опроса'], a: 1, tag: 'tech' },
    ];

    // DOM
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const endScreen = document.getElementById('end-screen');

    const startBtn = document.getElementById('start-btn');
    const difficultyEl = document.getElementById('difficulty');

    const qIndexEl = document.getElementById('q-index');
    const qTotalEl = document.getElementById('q-total');
    const scoreEl = document.getElementById('score');
    const timerEl = document.getElementById('timer');
    const questionText = document.getElementById('question-text');
    const answersList = document.getElementById('answers');
    const nextBtn = document.getElementById('next-btn');
    const quitBtn = document.getElementById('quit-btn');

    const finalScoreEl = document.getElementById('final-score');
    const saveForm = document.getElementById('save-form');
    const playerName = document.getElementById('player-name');
    const playAgainBtn = document.getElementById('play-again');
    const leaderboardEl = document.getElementById('leaderboard');

    // Game state
    let questions = [];
    let current = 0;
    let score = 0;
    let timer = null;
    let timeLeft = 0;
    let questionCount = 5;

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }

    function pickQuestions(level) {
        const pool = QUESTION_BANK.slice();
        // Adjust pool size by difficulty
        if (level === 'easy') questionCount = 4;
        if (level === 'medium') questionCount = 5;
        if (level === 'hard') questionCount = 7;
        shuffle(pool);
        return pool.slice(0, Math.min(questionCount, pool.length));
    }

    function showScreen(show) {
        startScreen.classList.toggle('hidden', show !== 'start');
        gameScreen.classList.toggle('hidden', show !== 'game');
        endScreen.classList.toggle('hidden', show !== 'end');
        startScreen.setAttribute('aria-hidden', show !== 'start');
        gameScreen.setAttribute('aria-hidden', show !== 'game');
        endScreen.setAttribute('aria-hidden', show !== 'end');
    }

    function startGame() {
        const level = difficultyEl.value;
        questions = pickQuestions(level);
        current = 0;
        score = 0;
        scoreEl.textContent = score;
        qTotalEl.textContent = questions.length;
        showScreen('game');
        renderQuestion();
    }

    function renderQuestion() {
        clearTimer();
        nextBtn.disabled = true;
        const q = questions[current];
        qIndexEl.textContent = current + 1;
        questionText.textContent = q.q;
        answersList.innerHTML = '';
        q.opts.forEach((opt, idx) => {
            const li = document.createElement('li');
            const btn = document.createElement('button');
            btn.className = 'btn answer-btn';
            btn.type = 'button';
            btn.textContent = opt;
            btn.dataset.index = idx;
            btn.addEventListener('click', onAnswer);
            li.appendChild(btn);
            answersList.appendChild(li);
        });
        // time per question depends on difficulty
        const base = difficultyEl.value === 'hard' ? 12 : difficultyEl.value === 'easy' ? 20 : 15;
        timeLeft = base;
        timerEl.textContent = timeLeft;
        timer = setInterval(() => {
            timeLeft--;
            timerEl.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearTimer();
                markCorrect(null); // timeout = incorrect
            }
        }, 1000);
    }

    function clearTimer() {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    }

    function onAnswer(e) {
        clearTimer();
        const idx = Number(e.currentTarget.dataset.index);
        markCorrect(idx);
    }

    function markCorrect(selectedIdx) {
        const q = questions[current];
        const buttons = answersList.querySelectorAll('button');
        buttons.forEach((b) => {
            b.disabled = true;
            const idx = Number(b.dataset.index);
            if (idx === q.a) {
                b.classList.add('correct');
            }
            if (selectedIdx !== null && idx === selectedIdx && idx !== q.a) {
                b.classList.add('wrong');
            }
        });

        // scoring: correct => points based on speed and difficulty
        if (selectedIdx === q.a) {
            const difficultyMultiplier = difficultyEl.value === 'hard' ? 3 : difficultyEl.value === 'easy' ? 1 : 2;
            const gained = 10 + Math.max(0, timeLeft) * difficultyMultiplier;
            score += gained;
            scoreEl.textContent = score;
        }

        nextBtn.disabled = false;
        // if last question -> finish when next pressed
        if (current >= questions.length - 1) {
            nextBtn.textContent = 'Завершить';
        } else {
            nextBtn.textContent = 'Следующий';
        }
    }

    nextBtn.addEventListener('click', () => {
        if (current < questions.length - 1) {
            current++;
            renderQuestion();
        } else {
            endGame();
        }
    });

    quitBtn.addEventListener('click', () => {
        if (confirm('Выйти из игры? Текущий прогресс будет потерян.')) {
            showScreen('start');
            clearTimer();
        }
    });

    function endGame() {
        clearTimer();
        finalScoreEl.textContent = score;
        showScreen('end');
        renderLeaderboard();
    }

    // Leaderboard in localStorage
    const LB_KEY = 'campusquest_leaderboard_v1';
    function loadLeaderboard() {
        try {
            const raw = localStorage.getItem(LB_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }
    function saveLeaderboard(list) {
        localStorage.setItem(LB_KEY, JSON.stringify(list));
    }
    function renderLeaderboard() {
        const list = loadLeaderboard();
        leaderboardEl.innerHTML = '';
        if (list.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'Пока нет записей';
            leaderboardEl.appendChild(li);
            return;
        }
        list.slice(0, 10).forEach((item) => {
            const li = document.createElement('li');
            li.textContent = `${item.name} — ${item.score}`;
            leaderboardEl.appendChild(li);
        });
    }

    saveForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = playerName.value.trim() || 'Игрок';
        const list = loadLeaderboard();
        list.push({ name, score });
        list.sort((a, b) => b.score - a.score);
        saveLeaderboard(list.slice(0, 50));
        renderLeaderboard();
        playerName.value = '';
    });

    playAgainBtn.addEventListener('click', () => {
        showScreen('start');
    });

    startBtn.addEventListener('click', startGame);

    // initial
    showScreen('start');
    renderLeaderboard();

})();

/*
  Скрипт для работы с событиями (events.html)
*/
(function () {
    // ---- Events manager (работает на events.html) ----
    const eventsRoot = document.getElementById('events-list');
    if (!eventsRoot) return; // не на странице афиши

    const EVENTS_KEY = 'campusquest_events_v1';
    const listEl = document.getElementById('events-list');
    const tpl = document.getElementById('event-template');
    const dialog = document.getElementById('event-dialog');
    const form = document.getElementById('event-form');
    const addBtn = document.getElementById('add-event');
    const searchInput = document.getElementById('event-search');
    const filterSelect = document.getElementById('filter-type');
    const cancelBtn = document.getElementById('cancel-btn');

    function loadEvents() {
        try {
            const raw = localStorage.getItem(EVENTS_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }
    function saveEvents(arr) {
        localStorage.setItem(EVENTS_KEY, JSON.stringify(arr));
    }

    function formatDateISO(d) {
        if (!d) return '';
        try {
            const dt = new Date(d);
            return dt.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch {
            return d;
        }
    }

    function renderEvents() {
        const q = (searchInput.value || '').trim().toLowerCase();
        const type = filterSelect.value;
        const events = loadEvents();
        listEl.innerHTML = '';
        const filtered = events.filter(ev => {
            if (type !== 'all' && ev.tag !== type) return false;
            if (!q) return true;
            return (ev.title + ' ' + (ev.tag || '') + ' ' + (ev.desc || '')).toLowerCase().includes(q);
        });
        if (filtered.length === 0) {
            const li = document.createElement('li');
            li.className = 'event-item placeholder';
            li.textContent = 'Событий не найдено';
            listEl.appendChild(li);
            return;
        }
        filtered.forEach(ev => {
            const node = tpl.content.cloneNode(true);
            const li = node.querySelector('li.event-item');
            li.dataset.id = ev.id;
            node.querySelector('.event-title').textContent = ev.title;
            node.querySelector('.event-date').textContent = formatDateISO(ev.date);
            node.querySelector('.event-date').setAttribute('datetime', ev.date || '');
            const tagEl = node.querySelector('.event-tag');
            tagEl.textContent = ev.tag || '';
            node.querySelector('.event-desc').textContent = ev.desc || '';
            listEl.appendChild(node);
        });
    }

    function openDialog(editId) {
        form.reset();
        form.dataset.editId = editId || '';
        const titleEl = document.getElementById('dialog-title');
        titleEl.textContent = editId ? 'Редактировать событие' : 'Добавить событие';
        if (editId) {
            const events = loadEvents();
            const ev = events.find(x => String(x.id) === String(editId));
            if (ev) {
                form.elements['title'].value = ev.title || '';
                form.elements['date'].value = ev.date || '';
                form.elements['tag'].value = ev.tag || '';
                form.elements['desc'].value = ev.desc || '';
            }
        }
        try { dialog.showModal(); } catch { dialog.setAttribute('open', ''); }
    }

    function closeDialog() {
        try { dialog.close(); } catch { dialog.removeAttribute('open'); }
        form.dataset.editId = '';
    }

    addBtn.addEventListener('click', () => openDialog(''));

    cancelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeDialog();
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = new FormData(form);
        const title = (data.get('title') || '').trim();
        const date = data.get('date') || '';
        const tag = (data.get('tag') || '').trim();
        const desc = (data.get('desc') || '').trim();
        if (!title || !date) {
            alert('Введите название и дату события.');
            return;
        }
        const events = loadEvents();
        const editId = form.dataset.editId;
        if (editId) {
            const idx = events.findIndex(x => String(x.id) === String(editId));
            if (idx !== -1) {
                events[idx] = { ...events[idx], title, date, tag, desc };
            }
        } else {
            const newEvent = { id: Date.now(), title, date, tag, desc };
            events.push(newEvent);
        }
        saveEvents(events);
        renderEvents();
        closeDialog();
    });

    // Делегирование кликов для редактирования/удаления
    listEl.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.edit-btn');
        if (editBtn) {
            const li = editBtn.closest('li.event-item');
            if (li && li.dataset.id) openDialog(li.dataset.id);
            return;
        }
        const delBtn = e.target.closest('.delete-btn');
        if (delBtn) {
            const li = delBtn.closest('li.event-item');
            if (!li || !li.dataset.id) return;
            if (!confirm('Удалить событие?')) return;
            const events = loadEvents().filter(x => String(x.id) !== String(li.dataset.id));
            saveEvents(events);
            renderEvents();
        }
    });

    searchInput.addEventListener('input', () => renderEvents());
    filterSelect.addEventListener('change', () => renderEvents());

    // Инициализация: если нет событий — добавить пример
    (function ensureSample() {
        const evs = loadEvents();
        if (evs.length === 0) {
            const sample = [
                { id: Date.now(), title: 'Концерт у фонтана', date: new Date().toISOString().slice(0, 10), tag: 'music', desc: 'Живая музыка и студенческие группы.' },
            ];
            saveEvents(sample);
        }
        renderEvents();
    })();

})();