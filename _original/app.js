'use strict';

const STORAGE_KEY = 'chushinmei_words';

// ---- データ操作 ----

function loadWords() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveWords(words) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
}

function addWord(text, author, memo) {
  const words = loadWords();
  const entry = {
    id: Date.now().toString(),
    text: text.trim(),
    author: author.trim(),
    memo: memo.trim(),
    createdAt: new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' }),
  };
  words.unshift(entry);
  saveWords(words);
  return entry;
}

function deleteWord(id) {
  const words = loadWords().filter(w => w.id !== id);
  saveWords(words);
}

// ---- DOM ----

const wordList = document.getElementById('wordList');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const searchCount = document.getElementById('searchCount');
const wordForm = document.getElementById('wordForm');
const inputText = document.getElementById('inputText');
const inputAuthor = document.getElementById('inputAuthor');
const inputMemo = document.getElementById('inputMemo');
const btnToggleForm = document.getElementById('btnToggleForm');
const formWrapper = document.getElementById('formWrapper');
const btnCancel = document.getElementById('btnCancel');
const btnRandom = document.getElementById('btnRandom');
const todayText = document.getElementById('todayText');
const todayAuthor = document.getElementById('todayAuthor');
const todaySection = document.getElementById('todaySection');

// ---- 描画 ----

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderCard(entry) {
  const card = document.createElement('div');
  card.className = 'word-card';
  card.dataset.id = entry.id;

  const textEl = document.createElement('p');
  textEl.className = 'word-card-text';
  textEl.textContent = entry.text;

  const meta = document.createElement('div');
  meta.className = 'word-card-meta';

  if (entry.author) {
    const authorEl = document.createElement('span');
    authorEl.className = 'word-card-author';
    authorEl.textContent = entry.author;
    meta.appendChild(authorEl);
  }

  if (entry.memo) {
    const memoEl = document.createElement('span');
    memoEl.className = 'word-card-memo';
    memoEl.textContent = entry.memo;
    meta.appendChild(memoEl);
  }

  const dateEl = document.createElement('span');
  dateEl.className = 'word-card-date';
  dateEl.textContent = entry.createdAt;
  meta.appendChild(dateEl);

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn-delete';
  deleteBtn.title = '削除';
  deleteBtn.textContent = '×';
  deleteBtn.addEventListener('click', () => {
    if (confirm('この言葉を削除しますか？')) {
      deleteWord(entry.id);
      render(searchInput.value);
      showToday();
    }
  });

  card.appendChild(textEl);
  card.appendChild(meta);
  card.appendChild(deleteBtn);
  return card;
}

function render(query = '') {
  const words = loadWords();
  const q = query.trim().toLowerCase();
  const filtered = q
    ? words.filter(w =>
        w.text.toLowerCase().includes(q) ||
        w.author.toLowerCase().includes(q) ||
        w.memo.toLowerCase().includes(q)
      )
    : words;

  wordList.innerHTML = '';

  if (filtered.length === 0) {
    emptyState.classList.add('show');
  } else {
    emptyState.classList.remove('show');
    filtered.forEach(entry => wordList.appendChild(renderCard(entry)));
  }

  searchCount.textContent = q ? `${filtered.length} 件` : `${words.length} 件`;
}

// ---- 今日の言葉 ----

function showToday() {
  const words = loadWords();
  if (words.length === 0) {
    todaySection.style.display = 'none';
    return;
  }
  todaySection.style.display = '';

  // 日付ベースで毎日変わる + ランダムボタン用のインデックス管理
  const idx = parseInt(todaySection.dataset.idx || '-1');
  let nextIdx;

  if (idx === -1) {
    // 初回: 日付シードで選ぶ
    const seed = new Date().toDateString();
    let hash = 0;
    for (const c of seed) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
    nextIdx = Math.abs(hash) % words.length;
  } else {
    // ランダムボタン: 別の言葉を選ぶ
    if (words.length === 1) {
      nextIdx = 0;
    } else {
      do { nextIdx = Math.floor(Math.random() * words.length); } while (nextIdx === idx);
    }
  }

  todaySection.dataset.idx = nextIdx;
  const entry = words[nextIdx];
  todayText.textContent = entry.text;
  todayAuthor.textContent = entry.author;
}

// ---- イベント ----

btnToggleForm.addEventListener('click', () => {
  formWrapper.classList.toggle('open');
  btnToggleForm.textContent = formWrapper.classList.contains('open') ? '✕ 閉じる' : '＋ 言葉を記す';
});

btnCancel.addEventListener('click', () => {
  formWrapper.classList.remove('open');
  btnToggleForm.textContent = '＋ 言葉を記す';
  wordForm.reset();
});

wordForm.addEventListener('submit', e => {
  e.preventDefault();
  const text = inputText.value.trim();
  if (!text) {
    inputText.focus();
    return;
  }
  addWord(text, inputAuthor.value, inputMemo.value);
  wordForm.reset();
  formWrapper.classList.remove('open');
  btnToggleForm.textContent = '＋ 言葉を記す';
  render(searchInput.value);
  showToday();
});

searchInput.addEventListener('input', () => {
  render(searchInput.value);
});

btnRandom.addEventListener('click', () => {
  showToday();
});

// ---- 初期化 ----

render();
showToday();
