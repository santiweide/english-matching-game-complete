// main.js
let state = {
  currentLevel: 1,
  score: 0,
  selectedCard: null,
  cards: [],
  matchedPairs: 0,
  totalPairs: 0,
  isProcessing: false,
};

const COLOR_CLASSES = [
  'bg-red-400 hover:bg-red-500',
  'bg-blue-400 hover:bg-blue-500',
  'bg-green-400 hover:bg-green-500',
  'bg-yellow-400 hover:bg-yellow-500',
  'bg-purple-400 hover:bg-purple-500',
  'bg-pink-400 hover:bg-pink-500',
  'bg-indigo-400 hover:bg-indigo-500',
  'bg-cyan-400 hover:bg-cyan-500',
  'bg-orange-400 hover:bg-orange-500',
  'bg-emerald-400 hover:bg-emerald-500',
  'bg-rose-400 hover:bg-rose-500',
  'bg-amber-400 hover:bg-amber-500',
  'bg-teal-400 hover:bg-teal-500',
  'bg-violet-400 hover:bg-violet-500',
  'bg-fuchsia-400 hover:bg-fuchsia-500',
  'bg-sky-400 hover:bg-sky-500',
  'bg-lime-400 hover:bg-lime-500'
];

const gameBoard = document.getElementById('game-board');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const successModal = document.getElementById('success-modal');
const modalLevelElement = document.getElementById('modal-level');
const fireworksContainer = document.getElementById('fireworks-container');

export function initGame(LEVELS) {
  gameBoard.innerHTML = '';
  state.selectedCard = null;
  state.cards = [];
  state.matchedPairs = 0;
  state.isProcessing = false;

  const idx = Math.max(0, Math.min(state.currentLevel - 1, LEVELS.length - 1));
  const current = LEVELS[idx];
  state.totalPairs = current.items.length;

  current.items.forEach((w, i) => {
    state.cards.push({
      id: `card-${i}-en`,
      text: w.english,
      type: 'english',
      pairId: `card-${i}-cn`,
      matched: false
    });
    state.cards.push({
      id: `card-${i}-cn`,
      text: w.chinese,
      type: 'chinese',
      pairId: `card-${i}-en`,
      matched: false
    });
  });

  // 洗牌
  shuffle(state.cards);
  const palette = [...COLOR_CLASSES];
  shuffle(palette);

  // 渲染
  state.cards.forEach((card, i) => {
    const el = document.createElement('div');
    const colorClass = palette[i % palette.length];
    let fontSizeClass = 'text-sm md:text-base';
    if (card.text.length > 12) fontSizeClass = 'text-xs md:text-sm';
    if (card.text.length > 18) fontSizeClass = 'text-[10px] md:text-xs';

    el.id = card.id;
    el.className = `oval ${colorClass} text-white p-3 md:p-4 aspect-square flex items-center justify-center text-center ${fontSizeClass} font-medium cursor-pointer transition-all duration-300 hover:scale-105 shadow-md pop`;
    el.style.animationDelay = `${i * 0.1}s`;
    el.textContent = card.text;
    el.dataset.pairId = card.pairId;
    el.dataset.type = card.type;
    el.addEventListener('click', () => onCardClick(el));

    gameBoard.appendChild(el);
  });

  // 更新头部
  levelElement.textContent = state.currentLevel;
  scoreElement.textContent = state.score;
}

export function nextLevel(LEVELS) {
  if (state.currentLevel < LEVELS.length) {
    state.currentLevel += 1;
    hideModal();
    initGame(LEVELS);
  } else {
    alert('恭喜你完成了所有关卡！你真是太棒了！');
    // 重置
    state.currentLevel = 1;
    state.score = 0;
    hideModal();
    initGame(LEVELS);
  }
}

// 交互
function onCardClick(cardEl) {
  if (state.isProcessing || cardEl.classList.contains('matched')) return;

  if (!state.selectedCard) {
    state.selectedCard = cardEl;
    cardEl.classList.add('ring-4', 'ring-white', 'scale-110');
    return;
  }

  if (state.selectedCard.id === cardEl.id) return;

  state.isProcessing = true;

  if (state.selectedCard.dataset.pairId === cardEl.id) {
    // 匹配成功
    cardEl.classList.add('ring-4', 'ring-white', 'scale-110');
    setTimeout(() => {
      state.selectedCard.classList.add('matched', 'fade-out', 'opacity-0', 'cursor-default');
      cardEl.classList.add('matched', 'fade-out', 'opacity-0', 'cursor-default');
      state.selectedCard.classList.remove('ring-4', 'ring-white', 'scale-110');
      cardEl.classList.remove('ring-4', 'ring-white', 'scale-110');

      state.score += 1;
      state.matchedPairs += 1;
      scoreElement.textContent = state.score;

      createFireworks(cardEl.getBoundingClientRect());

      if (state.matchedPairs === state.totalPairs) {
        setTimeout(showModal, 600);
      }

      state.selectedCard = null;
      state.isProcessing = false;
    }, 500);
  } else {
    // 匹配失败
    cardEl.classList.add('ring-4', 'ring-red-500', 'scale-110');
    setTimeout(() => {
      state.selectedCard.classList.remove('ring-4', 'ring-white', 'scale-110');
      cardEl.classList.remove('ring-4', 'ring-red-500', 'scale-110');
      state.selectedCard = null;
      state.isProcessing = false;
    }, 800);
  }
}

// UI 小工具
function showModal() {
  modalLevelElement.textContent = state.currentLevel;
  successModal.classList.remove('hidden');
}

function hideModal() {
  successModal.classList.add('hidden');
}

// 动效
function createFireworks(position) {
  const fireworksCount = 5;
  for (let i = 0; i < fireworksCount; i++) {
    const f = document.createElement('div');
    const size = Math.random() * 10 + 5;
    const color = `rgb(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255})`;
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 50 + 30;
    f.style.position = 'absolute';
    f.style.width = `${size}px`;
    f.style.height = `${size}px`;
    f.style.backgroundColor = color;
    f.style.borderRadius = '50%';
    f.style.left = `${position.left + position.width / 2}px`;
    f.style.top = `${position.top + position.height / 2}px`;
    f.style.opacity = '1';
    f.style.transform = 'translate(0, 0)';
    f.style.transition = 'all 0.8s ease-out';
    fireworksContainer.appendChild(f);
    setTimeout(() => {
      f.style.transform = `translate(${Math.cos(angle)*distance}px, ${Math.sin(angle)*distance}px)`;
      f.style.opacity = '0';
    }, 10);
    setTimeout(() => f.remove(), 900);
  }
}

// 工具函数
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
