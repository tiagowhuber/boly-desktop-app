<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed, nextTick } from 'vue'
import useAuth from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuth()
const router = useRouter()

// Game State
const currentBoard = ref<number[][]>([])
const solutionBoard = ref<number[][]>([])
const initialBoard = ref<number[][]>([])
const difficultyLevel = ref(1)
const timerInterval = ref<ReturnType<typeof setInterval> | null>(null)
const timeLeft = ref(0)
const originalTimeLimit = ref(0)
const selectedCell = ref<{ row: number; col: number } | null>(null)
const gameMode = ref('')
const userCredits = ref(10)
const isGameConcluded = ref(false)
const showMenu = ref(true)
const streakCount = ref(0)
const messageText = ref('')

// UI State
const showGameOverModal = ref(false)
const showSolutionModal = ref(false)
const modalTitle = ref('')
const modalMessage = ref('')
const showNextPuzzleButton = ref(false)
const backToMenuText = ref('Menú Principal')
const solutionModalTitle = ref('')
const solutionModalMessage = ref('')
const solutionModalCost = ref('')
const confirmButtonText = ref('')
const cancelButtonText = ref('')
const solutionError = ref('')

// Highlighting state
const highlightedCells = reactive(new Set<string>())
const selectedCellKey = ref('')

// Flat list of all 81 cells for direct grid rendering
const flatCells = computed(() => {
  const cells: { row: number; col: number }[] = []
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      cells.push({ row: i, col: j })
    }
  }
  return cells
})

// Computed properties
const timerDisplay = computed(() => {
  if (gameMode.value === 'difficulty') {
    return `Nivel: ${difficultyLevel.value}`
  } else {
    const minutes = Math.floor(timeLeft.value / 60)
    const seconds = timeLeft.value % 60
    return `Tiempo: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }
})

// Helper functions
function loadCredits() {
  const savedCredits = localStorage.getItem('sudokuUserCredits')
  userCredits.value = savedCredits !== null ? parseInt(savedCredits) : 10
  localStorage.setItem('sudokuUserCredits', userCredits.value.toString())
}

function saveCredits() {
  localStorage.setItem('sudokuUserCredits', userCredits.value.toString())
}

function canAfford(cost: number) {
  return userCredits.value >= cost
}

function isValid(board: number[][], row: number, col: number, num: number): boolean {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) return false
  }

  // Check column
  for (let x = 0; x < 9; x++) {
    if (board[x][col] === num) return false
  }

  // Check 3x3 box
  const startRow = row - (row % 3)
  const startCol = col - (col % 3)
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i + startRow][j + startCol] === num) return false
    }
  }

  return true
}

function solveSudoku(board: number[][]): boolean {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j] === 0) {
        // Shuffle numbers 1-9 for randomization
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5)
        for (const num of nums) {
          if (isValid(board, i, j, num)) {
            board[i][j] = num
            if (solveSudoku(board)) return true
            board[i][j] = 0
          }
        }
        return false
      }
    }
  }
  return true
}

function generateSudoku(): number[][] {
  const board = Array(9)
    .fill(null)
    .map(() => Array(9).fill(0))
  solveSudoku(board)
  solutionBoard.value = JSON.parse(JSON.stringify(board))

  let cellsToRemove: number
  switch (difficultyLevel.value) {
    case 1:
      cellsToRemove = 81 - 40
      break
    case 2:
      cellsToRemove = 81 - 35
      break
    case 3:
      cellsToRemove = 81 - 30
      break
    case 4:
      cellsToRemove = 81 - 25
      break
    case 5:
      cellsToRemove = 81 - 22
      break
    default:
      cellsToRemove = 81 - 30
  }

  const currentPuzzleBoard = JSON.parse(JSON.stringify(solutionBoard.value))
  let removedCount = 0
  while (removedCount < cellsToRemove) {
    const row = Math.floor(Math.random() * 9)
    const col = Math.floor(Math.random() * 9)
    if (currentPuzzleBoard[row][col] !== 0) {
      currentPuzzleBoard[row][col] = 0
      removedCount++
    }
  }

  initialBoard.value = JSON.parse(JSON.stringify(currentPuzzleBoard))
  return currentPuzzleBoard
}

function getCellClass(row: number, col: number): string {
  const classes = ['sudoku-cell']

  if (initialBoard.value[row][col] !== 0) {
    classes.push('prefilled')
  }

  const cellKey = `${row}-${col}`
  if (highlightedCells.has(cellKey)) {
    classes.push('highlight')
  }

  if (selectedCellKey.value === cellKey) {
    classes.push('selected')
  }

  const currentValue = currentBoard.value[row][col]
  if (currentValue !== 0 && selectedCell.value) {
    const selectedValue = currentBoard.value[selectedCell.value.row][selectedCell.value.col]
    if (currentValue === selectedValue && selectedValue !== 0) {
      classes.push('highlight-same-number')
    }
  }

  // Check for errors (only for user-entered values)
  if (currentValue !== 0 && initialBoard.value[row][col] === 0) {
    const tempBoard = JSON.parse(JSON.stringify(currentBoard.value))
    tempBoard[row][col] = 0
    if (!isValid(tempBoard, row, col, currentValue)) {
      classes.push('error')
    }
  }

  return classes.join(' ')
}

function clearHighlights() {
  highlightedCells.clear()
  selectedCellKey.value = ''
}

function applyHighlights(row: number, col: number) {
  clearHighlights()
  if (isGameConcluded.value) return

  selectedCellKey.value = `${row}-${col}`

  const startRow = row - (row % 3)
  const startCol = col - (col % 3)

  // Highlight row, column, and 3x3 box
  for (let i = 0; i < 9; i++) {
    highlightedCells.add(`${row}-${i}`) // Row
    highlightedCells.add(`${i}-${col}`) // Column
  }

  // 3x3 box
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      highlightedCells.add(`${startRow + i}-${startCol + j}`)
    }
  }
}

function handleCellClick(row: number, col: number) {
  if (isGameConcluded.value) return
  // Allow clicking any cell for highlighting; only editable cells get selected for input
  selectedCell.value = { row, col }
  applyHighlights(row, col)
  // Focus the input if it's an editable cell
  if (initialBoard.value[row][col] === 0) {
    nextTick(() => {
      const input = document.querySelector(
        `[data-row="${row}"][data-col="${col}"] .cell-input`
      ) as HTMLInputElement
      if (input) input.focus()
    })
  }
}

function handleCellSelect(row: number, col: number) {
  if (isGameConcluded.value) return
  selectedCell.value = { row, col }
  applyHighlights(row, col)
}

function handleInput(event: Event, row: number, col: number) {
  const target = event.target as HTMLInputElement

  if (isGameConcluded.value) {
    target.value = currentBoard.value[row][col] === 0 ? '' : currentBoard.value[row][col].toString()
    return
  }

  // Get only the last character typed (handles replacement of existing value)
  const rawValue = target.value
  const lastChar = rawValue.slice(-1)
  const value = /^[1-9]$/.test(lastChar) ? parseInt(lastChar) : 0

  // Update the input display
  target.value = value === 0 ? '' : value.toString()

  currentBoard.value[row][col] = value
  applyHighlights(row, col)

  if (checkWin()) {
    handleWin()
  }
}

function handleKeydown(event: KeyboardEvent, row: number, col: number) {
  // Allow: 1-9, Backspace, Delete, Tab, Arrow keys
  const allowedKeys = [
    'Backspace',
    'Delete',
    'Tab',
    'ArrowUp',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight'
  ]

  if (allowedKeys.includes(event.key)) {
    if ((event.key === 'Backspace' || event.key === 'Delete') && !isGameConcluded.value) {
      event.preventDefault()
      currentBoard.value[row][col] = 0
      const target = event.target as HTMLInputElement
      target.value = ''
      applyHighlights(row, col)
    }
    // Handle arrow key navigation
    if (event.key === 'ArrowUp' && row > 0) {
      event.preventDefault()
      handleCellClick(row - 1, col)
    } else if (event.key === 'ArrowDown' && row < 8) {
      event.preventDefault()
      handleCellClick(row + 1, col)
    } else if (event.key === 'ArrowLeft' && col > 0) {
      event.preventDefault()
      handleCellClick(row, col - 1)
    } else if (event.key === 'ArrowRight' && col < 8) {
      event.preventDefault()
      handleCellClick(row, col + 1)
    }
    return
  }

  if (!/^[1-9]$/.test(event.key)) {
    event.preventDefault()
  }
}

function handleDragOver(event: DragEvent) {
  if (!isGameConcluded.value) {
    event.preventDefault()
  }
}

function handleDrop(event: DragEvent, row: number, col: number) {
  if (isGameConcluded.value || initialBoard.value[row][col] !== 0) return

  event.preventDefault()
  const draggedNumber = parseInt(event.dataTransfer?.getData('text/plain') || '0')
  if (draggedNumber) {
    currentBoard.value[row][col] = draggedNumber
    applyHighlights(row, col)
    if (checkWin()) {
      handleWin()
    }
  }
}

function handleDragStart(event: DragEvent, num: number) {
  if (isGameConcluded.value) return event.preventDefault()
  event.dataTransfer?.setData('text/plain', num.toString())
  ;(event.target as HTMLElement).classList.add('dragging')
}

function handleDragEnd(event: DragEvent) {
  ;(event.target as HTMLElement).classList.remove('dragging')
}

function selectNumber(num: number) {
  if (isGameConcluded.value || !selectedCell.value) return

  const { row, col } = selectedCell.value
  if (initialBoard.value[row][col] === 0) {
    currentBoard.value[row][col] = num
    // Force update the input element
    nextTick(() => {
      const input = document.querySelector(
        `[data-row="${row}"][data-col="${col}"] .cell-input`
      ) as HTMLInputElement
      if (input) {
        input.value = num === 0 ? '' : num.toString()
      }
    })
    applyHighlights(row, col)
    if (num !== 0 && checkWin()) {
      handleWin()
    }
  }
}

function startGame(mode: string, param: number) {
  gameMode.value = mode
  difficultyLevel.value = param

  if (mode === 'time') {
    if (param <= 60) difficultyLevel.value = 2
    else if (param <= 180) difficultyLevel.value = 3
    else difficultyLevel.value = 4
  }

  isGameConcluded.value = false
  messageText.value = ''
  showGameOverModal.value = false
  showSolutionModal.value = false

  let cost = 0
  if (mode === 'difficulty' && difficultyLevel.value >= 4) {
    cost = 1
  }

  if (cost > 0 && !canAfford(cost)) {
    modalTitle.value = 'Créditos Insuficientes'
    modalMessage.value = `Necesitas ${cost} crédito(s) para jugar este nivel. Gana más en niveles fáciles.`
    showNextPuzzleButton.value = false
    backToMenuText.value = 'Entendido'
    showGameOverModal.value = true
    return
  }

  if (cost > 0) {
    userCredits.value -= cost
    saveCredits()
  }

  if (mode === 'time') {
    originalTimeLimit.value = timeLeft.value = param
    startTimer()
  }

  showMenu.value = false
  currentBoard.value = generateSudoku()
}

function startTimer() {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }

  timerInterval.value = setInterval(() => {
    if (isGameConcluded.value) {
      if (timerInterval.value) {
        clearInterval(timerInterval.value)
      }
      return
    }

    timeLeft.value--
    if (timeLeft.value <= 0) {
      if (timerInterval.value) {
        clearInterval(timerInterval.value)
      }
      handleTimeUp()
    }
  }, 1000)
}

function showMainMenu() {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
  showMenu.value = true
  selectedCell.value = null
  isGameConcluded.value = false
  clearHighlights()
  showGameOverModal.value = false
  showSolutionModal.value = false
}

function checkWin(): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (currentBoard.value[r][c] === 0) return false
      const num = currentBoard.value[r][c]
      currentBoard.value[r][c] = 0
      if (!isValid(currentBoard.value, r, c, num)) {
        currentBoard.value[r][c] = num
        return false
      }
      currentBoard.value[r][c] = num
    }
  }
  return true
}

function handleWin() {
  isGameConcluded.value = true
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
  clearHighlights()

  const creditsEarned = gameMode.value === 'difficulty' ? (difficultyLevel.value <= 3 ? 2 : 10) : 5
  userCredits.value += creditsEarned
  saveCredits()

  modalTitle.value = '¡Ganaste!'
  modalMessage.value = `¡Excelente trabajo! Has ganado ${creditsEarned} crédito(s).`
  showNextPuzzleButton.value = true
  backToMenuText.value = 'Menú Principal'
  showGameOverModal.value = true
}

function showSolutionWithAnimation() {
  isGameConcluded.value = true
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
  clearHighlights()
  currentBoard.value = JSON.parse(JSON.stringify(solutionBoard.value))
  messageText.value = 'Solución mostrada.'
}

function closeModalAndShowMenu() {
  showGameOverModal.value = false
  showMainMenu()
}

function resetPuzzle() {
  if (isGameConcluded.value) return
  currentBoard.value = JSON.parse(JSON.stringify(initialBoard.value))
  clearHighlights()
  selectedCell.value = null
  messageText.value = 'Tablero reiniciado.'
  // Force all inputs to update
  nextTick(() => {
    const inputs = document.querySelectorAll<HTMLInputElement>('.cell-input')
    inputs.forEach((input) => {
      const row = parseInt(input.closest('[data-row]')?.getAttribute('data-row') || '0')
      const col = parseInt(input.closest('[data-col]')?.getAttribute('data-col') || '0')
      input.value =
        currentBoard.value[row][col] === 0 ? '' : currentBoard.value[row][col].toString()
    })
  })
}

function validateSolution() {
  if (isGameConcluded.value) return
  if (checkWin()) {
    handleWin()
  } else {
    messageText.value = 'Incompleto o con errores. ¡Sigue intentando!'
    setTimeout(() => {
      if (!isGameConcluded.value) messageText.value = ''
    }, 3000)
  }
}

function promptShowSolution() {
  if (isGameConcluded.value) return
  solutionModalTitle.value = '¿Mostrar Solución?'
  solutionModalMessage.value = '¿Quieres ver la solución completa del puzzle?'
  solutionModalCost.value = 'Costo: 1 crédito'
  confirmButtonText.value = 'Sí, ver solución'
  cancelButtonText.value = 'No, seguir intentando'
  solutionError.value = ''
  showSolutionModal.value = true
}

function confirmShowSolution() {
  if (!canAfford(1)) {
    solutionError.value = 'No tienes suficientes créditos.'
    return
  }
  userCredits.value -= 1
  saveCredits()
  showSolutionModal.value = false
  showSolutionWithAnimation()
}

function cancelShowSolution() {
  showSolutionModal.value = false
}

function handleTimeUp() {
  isGameConcluded.value = true
  solutionModalTitle.value = '¡Tiempo Agotado!'
  solutionModalMessage.value = '¿Quieres ver la solución?'
  solutionModalCost.value = 'Costo: 1 crédito'
  confirmButtonText.value = 'Sí, ver solución'
  cancelButtonText.value = 'Volver al Menú'
  solutionError.value = ''
  showSolutionModal.value = true
}

function startNextPuzzle() {
  showGameOverModal.value = false
  const nextParam =
    gameMode.value === 'difficulty' ? difficultyLevel.value : originalTimeLimit.value
  startGame(gameMode.value, nextParam)
}

function checkDailyChallenge() {
  const lastPlayed = localStorage.getItem('sudokuLastPlayed')
  const today = new Date().toDateString()
  let streak = parseInt(localStorage.getItem('sudokuStreak') || '0')

  if (lastPlayed !== today) {
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    if (lastPlayed === yesterday) {
      streak++
    } else {
      streak = 1
    }
    localStorage.setItem('sudokuLastPlayed', today)
    localStorage.setItem('sudokuStreak', streak.toString())
  }
  streakCount.value = streak
}

// Lifecycle
onMounted(() => {
  auth.checkToken()
  if (!auth.isLoggedIn) {
    router.push('/login')
  } else {
    loadCredits()
    checkDailyChallenge()
  }
})

onUnmounted(async () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
})
</script>

<template>
  <div class="sudoku-game">
    <!-- Main Menu -->
    <div v-if="showMenu" id="main-menu" class="text-center p-4">
      <h1 class="text-4xl font-bold mb-8 text-sky-400">Sudoku Infinito</h1>

      <div class="mb-6">
        <h2 class="text-2xl font-semibold mb-3 text-teal-300">Modo por Dificultad</h2>
        <div class="difficulty-buttons">
          <button class="btn btn-easy" @click="startGame('difficulty', 1)">
            Nivel 1 (Fácil, +2 Créditos)
          </button>
          <button class="btn btn-easy" @click="startGame('difficulty', 2)">
            Nivel 2 (Fácil, +2 Créditos)
          </button>
          <button class="btn btn-normal" @click="startGame('difficulty', 3)">
            Nivel 3 (Normal, +2 Créditos)
          </button>
          <button class="btn btn-hard" @click="startGame('difficulty', 4)">
            Nivel 4 (Difícil, Costo: 1, +10 Créditos)
          </button>
          <button class="btn btn-expert" @click="startGame('difficulty', 5)">
            Nivel 5 (Experto, Costo: 1, +10 Créditos)
          </button>
        </div>
      </div>

      <div>
        <h2 class="text-2xl font-semibold mb-3 text-amber-300">Modo por Tiempo (+5 Créditos)</h2>
        <div class="time-buttons">
          <button class="btn btn-normal" @click="startGame('time', 60)">1 Minuto (Fácil)</button>
          <button class="btn btn-normal" @click="startGame('time', 180)">3 Minutos (Medio)</button>
          <button class="btn btn-normal" @click="startGame('time', 300)">
            5 Minutos (Difícil)
          </button>
        </div>
      </div>

      <div id="credits-section" class="mt-6 p-4 bg-gray-800 rounded-lg">
        <h3>Sistema de Créditos</h3>
        <p>
          Créditos Actuales: <span>{{ userCredits }}</span>
        </p>
      </div>

      <div id="recurrence-section" class="mt-4 p-4 bg-gray-800 rounded-lg">
        <h3>Recompensas por Recurrencia</h3>
        <p>
          Racha Actual: <span>{{ streakCount }}</span> días
        </p>
      </div>
    </div>

    <!-- Game Area -->
    <div v-if="!showMenu" id="game-area" class="flex flex-col items-center">
      <div class="flex justify-between items-center w-full max-w-lg mb-4 px-2">
        <button class="btn btn-secondary" @click="showMainMenu">Menú Principal</button>
        <div class="text-lg font-semibold text-yellow-400">Créditos: {{ userCredits }}</div>
        <div class="text-xl font-semibold text-rose-400">{{ timerDisplay }}</div>
      </div>

      <div id="sudoku-board" class="sudoku-grid">
        <div
          v-for="{ row: i, col: j } in flatCells"
          :key="`cell-${i}-${j}`"
          :class="getCellClass(i, j)"
          :data-row="i"
          :data-col="j"
          @click="handleCellClick(i, j)"
          @dragover="handleDragOver"
          @drop="(e) => handleDrop(e, i, j)"
        >
          <span v-if="currentBoard.length && initialBoard[i][j] !== 0" class="cell-content">
            {{ initialBoard[i][j] }}
          </span>
          <input
            v-else-if="currentBoard.length"
            type="text"
            maxlength="1"
            pattern="[1-9]"
            inputmode="numeric"
            class="cell-input"
            autocomplete="off"
            :value="currentBoard[i][j] === 0 ? '' : currentBoard[i][j]"
            @input="(e) => handleInput(e, i, j)"
            @focus="handleCellSelect(i, j)"
            @keydown="(e) => handleKeydown(e, i, j)"
          />
        </div>
      </div>

      <div class="number-palette mt-4">
        <button
          v-for="num in 9"
          :key="num"
          class="btn btn-normal palette-btn"
          :draggable="!isGameConcluded"
          @dragstart="(e) => handleDragStart(e, num)"
          @dragend="handleDragEnd"
          @click="selectNumber(num)"
        >
          {{ num }}
        </button>
        <button
          class="btn btn-danger palette-btn"
          aria-label="Borrar número"
          @click="selectNumber(0)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z"
            />
          </svg>
        </button>
      </div>

      <div v-if="!isGameConcluded" class="mt-6 space-x-1">
        <button
          v-if="gameMode === 'difficulty'"
          class="btn btn-secondary"
          @click="promptShowSolution"
        >
          Mostrar Solución
        </button>
        <button class="btn btn-normal" @click="validateSolution">Comprobar</button>
        <button class="btn btn-secondary" @click="resetPuzzle">Reiniciar</button>
      </div>

      <div v-if="isGameConcluded" class="mt-6 space-x-1">
        <button class="btn btn-normal" @click="startNextPuzzle">Siguiente Puzzle</button>
        <button class="btn btn-secondary" @click="showMainMenu">Menú Principal</button>
      </div>

      <p class="mt-4 text-lg h-6">{{ messageText }}</p>
    </div>

    <!-- Game Over Modal -->
    <div v-if="showGameOverModal" class="modal active">
      <div class="modal-content">
        <h2 class="text-3xl font-bold mb-4">{{ modalTitle }}</h2>
        <p class="mb-6 text-lg">{{ modalMessage }}</p>
        <div class="flex justify-center gap-4">
          <button v-if="showNextPuzzleButton" class="btn btn-normal" @click="startNextPuzzle">
            Siguiente Puzzle
          </button>
          <button class="btn btn-secondary" @click="closeModalAndShowMenu">
            {{ backToMenuText }}
          </button>
        </div>
      </div>
    </div>

    <!-- Solution Prompt Modal -->
    <div v-if="showSolutionModal" class="modal active">
      <div class="modal-content">
        <h2 class="text-2xl font-bold mb-4">{{ solutionModalTitle }}</h2>
        <p class="mb-6 text-lg">{{ solutionModalMessage }}</p>
        <p class="mb-6 text-md font-semibold text-yellow-500">{{ solutionModalCost }}</p>
        <div class="flex justify-center gap-4">
          <button class="btn btn-danger" @click="confirmShowSolution">
            {{ confirmButtonText }}
          </button>
          <button class="btn btn-secondary" @click="cancelShowSolution">
            {{ cancelButtonText }}
          </button>
        </div>
        <p v-if="solutionError" class="mt-3 text-red-400">{{ solutionError }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sudoku-game {
  font-family: 'Poppins', 'Inter', sans-serif;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  margin: 0;
  padding: 1rem;
  overflow-x: hidden;
}

.sudoku-grid {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  grid-template-rows: repeat(9, 1fr);
  width: min(90vw, 500px);
  height: min(90vw, 500px);
  border: 3px solid #cbd5e0;
  border-radius: 8px;
  gap: 0;
  background-color: #4a5568;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  box-sizing: border-box;
}

.sudoku-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2d3748;
  border: 1px solid #4a5568;
  font-size: clamp(0.6rem, 3.5vw, 1.5rem);
  font-weight: 600;
  color: #e2e8f0;
  transition: background-color 0.15s ease-in-out;
  cursor: pointer;
  position: relative;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

/* 3x3 box borders via inset box-shadow so cell size stays identical */
.sudoku-cell[data-col='2'],
.sudoku-cell[data-col='5'] {
  box-shadow: inset -2px 0 0 #a0aec0;
}

.sudoku-cell[data-row='2'],
.sudoku-cell[data-row='5'] {
  box-shadow: inset 0 -2px 0 #a0aec0;
}

/* Corner cells need both shadows */
.sudoku-cell[data-col='2'][data-row='2'],
.sudoku-cell[data-col='2'][data-row='5'],
.sudoku-cell[data-col='5'][data-row='2'],
.sudoku-cell[data-col='5'][data-row='5'] {
  box-shadow:
    inset -2px 0 0 #a0aec0,
    inset 0 -2px 0 #a0aec0;
}

.cell-input {
  width: 100%;
  height: 100%;
  text-align: center;
  background-color: transparent;
  border: none;
  color: #63b3ed;
  font-size: inherit;
  font-weight: inherit;
  outline: none;
  padding: 0;
  margin: 0;
  caret-color: #63b3ed;
  cursor: pointer;
  font-family: inherit;
  min-width: 0;
  box-sizing: border-box;
  display: block;
}

.cell-content {
  color: #a0aec0;
  pointer-events: none;
  user-select: none;
}

.sudoku-cell.prefilled {
  color: #a0aec0;
  background-color: #2c3140;
}

.sudoku-cell.error {
  background-color: #c5303066;
  color: #fed7d7;
}

.sudoku-cell.error .cell-input {
  color: #fc8181;
}

.sudoku-cell.highlight {
  background-color: #3b4458;
}

.sudoku-cell.highlight-same-number {
  background-color: #4a5f78;
}

.sudoku-cell.selected {
  background-color: #4299e1;
  outline: 2px solid #fff;
  z-index: 10;
}

.sudoku-cell.selected .cell-input {
  color: #fff;
}

.number-palette {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.palette-btn {
  width: clamp(30px, 8vw, 45px);
  height: clamp(30px, 8vw, 45px);
  font-size: clamp(1rem, 4vw, 1.5rem);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.palette-btn.dragging {
  opacity: 0.5;
  border: 2px dashed #a0aec0;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 600;
  transition:
    background-color 0.2s,
    transform 0.1s;
  cursor: pointer;
  border: none;
  color: white;
  margin: 0.25rem;
}

.btn-secondary {
  background-color: #4a5568;
}
.btn-secondary:hover {
  background-color: #2d3748;
}

.btn-danger {
  background-color: #e53e3e;
}
.btn-danger:hover {
  background-color: #c53030;
}

.btn:active {
  transform: scale(0.95);
}

.btn:disabled {
  background-color: #718096;
  cursor: not-allowed;
}

.btn-easy {
  background-color: #38a169;
}
.btn-easy:hover {
  background-color: #2f855a;
}

.btn-normal {
  background-color: #4299e1;
}
.btn-normal:hover {
  background-color: #3182ce;
}

.btn-hard {
  background-color: #dd6b20;
}
.btn-hard:hover {
  background-color: #c05621;
}

.btn-expert {
  background-color: #c53030;
}
.btn-expert:hover {
  background-color: #9b2c2c;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: #2d3748;
  padding: 2rem;
  border-radius: 0.5rem;
  text-align: center;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 90vw;
}

.difficulty-buttons,
.time-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
}
</style>
