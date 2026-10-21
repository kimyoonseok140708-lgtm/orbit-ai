(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const csrf = $('meta[name="csrf-token"]')?.content || '';
  const toastEl = $('#toast');
  let toastTimer;
  function toast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2400);
  }
  async function post(url, body={}) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {'Content-Type':'application/json', 'X-CSRFToken':csrf},
      body: JSON.stringify(body)
    });
    let data = {};
    try { data = await response.json(); } catch {}
    if (!response.ok) throw new Error(data.error || '요청을 처리하지 못했어요.');
    return data;
  }
  function addMessage(role, text) {
    const log = $('#chatLog');
    const empty = $('.empty-chat', log);
    if (empty) empty.remove();
    const item = document.createElement('div');
    item.className = `message ${role === 'user' ? 'user-message' : 'assistant-message'}`;
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = role === 'user' ? 'YOU' : 'O';
    const body = document.createElement('div');
    body.className = 'message-body';
    const meta = document.createElement('div');
    meta.className = 'message-meta';
    meta.textContent = role === 'user' ? '나' : 'ORBIT AI';
    const content = document.createElement('div');
    content.className = 'message-text';
    content.textContent = text;
    body.append(meta, content);
    if (role === 'assistant') {
      const speak = document.createElement('button');
      speak.type = 'button'; speak.className = 'speak-btn'; speak.textContent = '▶ 답변 듣기';
      speak.addEventListener('click', () => speakText(text));
      body.append(speak);
    }
    item.append(avatar, body); log.append(item); log.scrollTop = log.scrollHeight;
  }
  const chatForm = $('#chatForm');
  if (chatForm) {
    const input = $('#chatInput');
    const send = $('.send-btn', chatForm);
    const error = $('#chatError');
    async function sendMessage(text) {
      text = (text ?? input.value).trim();
      if (!text) return;
      error.textContent = '';
      input.value = '';
      input.style.height = 'auto';
      addMessage('user', text);
      send.disabled = true; send.textContent = '…';
      const waiting = document.createElement('div');
      waiting.className = 'message assistant-message'; waiting.id = 'waitingMessage';
      waiting.innerHTML = '<div class="message-avatar">O</div><div class="message-body"><div class="message-meta">ORBIT AI</div><div class="message-text">생각 중...</div></div>';
      $('#chatLog').append(waiting); $('#chatLog').scrollTop = $('#chatLog').scrollHeight;
      try {
        const result = await post('/api/chat', {message:text});
        waiting.remove(); addMessage('assistant', result.answer);
      } catch (e) {
        waiting.remove(); error.textContent = e.message;
      } finally {
        send.disabled = false; send.textContent = '↑'; input.focus();
      }
    }
    chatForm.addEventListener('submit', e => { e.preventDefault(); sendMessage(); });
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); chatForm.requestSubmit(); }
    });
    input.addEventListener('input', () => { input.style.height='auto'; input.style.height=Math.min(input.scrollHeight,150)+'px'; });
    $$('[data-prompt]').forEach(btn => btn.addEventListener('click', () => { input.value = btn.dataset.prompt; sendMessage(); }));
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const mic = $('#micBtn');
    if (SpeechRecognition && mic) {
      mic.addEventListener('click', () => {
        const recognition = new SpeechRecognition();
        recognition.lang = 'ko-KR'; recognition.interimResults = false; recognition.maxAlternatives = 1;
        mic.classList.add('recording'); mic.textContent = '●';
        recognition.onresult = e => { input.value = (input.value + ' ' + e.results[0][0].transcript).trim(); input.dispatchEvent(new Event('input')); input.focus(); };
        recognition.onerror = () => toast('음성 인식에 실패했어요. 마이크 권한을 확인해 주세요.');
        recognition.onend = () => { mic.classList.remove('recording'); mic.textContent='🎙'; };
        try { recognition.start(); } catch { mic.classList.remove('recording'); mic.textContent='🎙'; }
      });
    } else if (mic) {
      mic.addEventListener('click', () => toast('이 브라우저는 음성 입력을 지원하지 않아요. Chrome 또는 Edge를 이용해 보세요.'));
    }
  }
  function speakText(text) {
    if (!('speechSynthesis' in window)) { toast('이 브라우저는 음성 재생을 지원하지 않아요.'); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR'; utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  }
  $$('[data-speak]').forEach(btn => btn.addEventListener('click', () => speakText(btn.dataset.speak || '')));
  const taskForm = $('#taskForm');
  if (taskForm) {
    const list = $('#taskList');
    const updateTaskCount = () => { $('#taskCount').textContent = $$('.task-row', list).length; };
    taskForm.addEventListener('submit', async e => {
      e.preventDefault(); const input = $('#taskInput'); const title = input.value.trim(); if (!title) return;
      try {
        await post('/api/tasks', {title});
        const empty = $('#emptyTasks'); if (empty) empty.remove();
        const row = document.createElement('div'); row.className='task-row'; row.dataset.taskId='new';
        const check = document.createElement('button'); check.className='task-check'; check.textContent=''; check.setAttribute('aria-label','완료 전환'); check.disabled=true;
        const span = document.createElement('span'); span.textContent=title;
        const del = document.createElement('button'); del.className='delete-btn'; del.textContent='×'; del.disabled=true; del.title='새로고침 후 관리할 수 있어요';
        row.append(check, span, del); list.prepend(row); input.value=''; updateTaskCount(); toast('할 일을 저장했어요. 새로고침하면 완료/삭제 기능을 사용할 수 있어요.');
        // Reload obtains the database ID so future actions target the correct record.
        setTimeout(() => location.reload(), 700);
      } catch (err) { toast(err.message); }
    });
    list.addEventListener('click', async e => {
      const toggle = e.target.closest('[data-toggle-task]');
      const del = e.target.closest('[data-delete-task]');
      try {
        if (toggle) { await post(`/api/tasks/${toggle.dataset.toggleTask}/toggle`); location.reload(); }
        if (del) { await post(`/api/tasks/${del.dataset.deleteTask}/delete`); del.closest('.task-row')?.remove(); updateTaskCount(); toast('할 일을 삭제했어요.'); }
      } catch (err) { toast(err.message); }
    });
  }
  const noteForm = $('#noteForm');
  if (noteForm) {
    noteForm.addEventListener('submit', async e => {
      e.preventDefault(); const input = $('#noteInput'); const content = input.value.trim(); if (!content) return;
      try { await post('/api/notes', {content}); toast('메모를 저장했어요.'); location.reload(); }
      catch (err) { toast(err.message); }
    });
    $('#notesList').addEventListener('click', async e => {
      const del = e.target.closest('[data-delete-note]');
      if (!del) return;
      try { await post(`/api/notes/${del.dataset.deleteNote}/delete`); del.closest('.note-item')?.remove(); toast('메모를 삭제했어요.'); }
      catch (err) { toast(err.message); }
    });
  }
  const themeBtn = $('#themeBtn');
  if (themeBtn) {
    const saved = localStorage.getItem('orbit-theme');
    if (saved === 'light' || saved === 'dark') document.body.dataset.theme = saved;
    themeBtn.addEventListener('click', async () => {
      const theme = document.body.dataset.theme === 'light' ? 'dark' : 'light';
      document.body.dataset.theme = theme; localStorage.setItem('orbit-theme', theme);
      try { await post('/api/theme', {theme}); } catch { /* login is required for server-side theme persistence */ }
    });
  }
  const menuBtn = $('#menuBtn');
  if (menuBtn) menuBtn.addEventListener('click', () => $('#sidebar')?.classList.toggle('open'));
  $$('.nav-item').forEach(link => link.addEventListener('click', () => $('#sidebar')?.classList.remove('open')));
  const date = $('#todayDate');
  if (date) date.textContent = new Intl.DateTimeFormat('ko-KR', {year:'numeric',month:'short',day:'numeric',weekday:'short'}).format(new Date()).toUpperCase();
})();
