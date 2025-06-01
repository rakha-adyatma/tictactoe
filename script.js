document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const cells = document.querySelectorAll('.cell');
    const statusMessage = document.getElementById('status-message');
    const scoreXElement = document.getElementById('score-x');
    const scoreOElement = document.getElementById('score-o');
    const scoreDrawElement = document.getElementById('score-draw');
    const resetButton = document.getElementById('reset-button');
    const startAvAButton = document.getElementById('start-ava-button');

    const gameModeSelect = document.getElementById('game-mode');
    const player1SymbolSelect = document.getElementById('player1-symbol');
    const aiDifficultySelect = document.getElementById('ai-difficulty');
    
    const playerSymbolGroup = document.getElementById('player-symbol-group');
    const aiDifficultyGroup = document.getElementById('ai-difficulty-group');
    const avaAi1DifficultyGroup = document.getElementById('ava-ai1-difficulty-group');
    const avaAi2DifficultyGroup = document.getElementById('ava-ai2-difficulty-group');
    const avaAi1DifficultySelect = document.getElementById('ava-ai1-difficulty');
    const avaAi2DifficultySelect = document.getElementById('ava-ai2-difficulty');

    // --- Game State Variables ---
    let board = ['', '', '', '', '', '', '', '', ''];
    let currentPlayerSymbol = 'X'; // Default X starts
    let humanPlayerSymbol = 'X';
    let aiPlayerSymbol = 'O';
    let gameActive = true;
    let currentMode = 'pvp'; // pvp, pve, ava
    let currentAiDifficulty = 'random'; // random, medium, unbeatable
    let avaAi1Difficulty = 'random';
    let avaAi2Difficulty = 'random';
    let avaIntervalId = null; // Untuk interval AI vs AI

    let scores = {
        X: 0,
        O: 0,
        draw: 0
    };

    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    // --- Initialization ---
    function initializeGame() {
        board = ['', '', '', '', '', '', '', '', ''];
        gameActive = true;
        
        currentMode = gameModeSelect.value;
        humanPlayerSymbol = player1SymbolSelect.value;
        aiPlayerSymbol = (humanPlayerSymbol === 'X') ? 'O' : 'X';
        
        if (currentMode === 'pve') {
            currentAiDifficulty = aiDifficultySelect.value;
        } else if (currentMode === 'ava') {
            avaAi1Difficulty = avaAi1DifficultySelect.value;
            avaAi2Difficulty = avaAi2DifficultySelect.value;
        }

        currentPlayerSymbol = 'X'; // X selalu mulai pertama

        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('X', 'O', 'occupied');
        });

        updateStatusDisplay();
        updateScoreDisplay();
        handleUiVisibility();

        if (currentMode === 'pve' && currentPlayerSymbol === aiPlayerSymbol) {
            // Jika AI yang mulai di mode PvE
            setTimeout(makeAiMove, 500);
        }
        if (avaIntervalId) {
            clearInterval(avaIntervalId);
            avaIntervalId = null;
        }
    }

    function handleUiVisibility() {
        currentMode = gameModeSelect.value;
        if (currentMode === 'pvp') {
            playerSymbolGroup.style.display = 'flex';
            aiDifficultyGroup.style.display = 'none';
            avaAi1DifficultyGroup.style.display = 'none';
            avaAi2DifficultyGroup.style.display = 'none';
            startAvAButton.style.display = 'none';
        } else if (currentMode === 'pve') {
            playerSymbolGroup.style.display = 'flex';
            aiDifficultyGroup.style.display = 'flex';
            avaAi1DifficultyGroup.style.display = 'none';
            avaAi2DifficultyGroup.style.display = 'none';
            startAvAButton.style.display = 'none';
        } else { // ava
            playerSymbolGroup.style.display = 'none'; // Simbol ditentukan oleh AI
            aiDifficultyGroup.style.display = 'none';
            avaAi1DifficultyGroup.style.display = 'flex';
            avaAi2DifficultyGroup.style.display = 'flex';
            startAvAButton.style.display = 'inline-block';
        }
    }


    // --- UI Update Functions ---
    function updateStatusDisplay() {
        if (!gameActive) return;
        if (currentMode === 'ava' && !avaIntervalId) {
             statusMessage.textContent = `Mode AI vs AI. Klik "Mulai AI vs AI".`;
        } else {
            statusMessage.textContent = `Giliran Pemain ${currentPlayerSymbol}`;
        }
    }

    function updateScoreDisplay() {
        scoreXElement.textContent = scores.X;
        scoreOElement.textContent = scores.O;
        scoreDrawElement.textContent = scores.draw;
    }

    // --- Game Logic Functions ---
    function handleCellClick(event) {
        const clickedCell = event.target;
        const clickedCellIndex = parseInt(clickedCell.dataset.index);

        if (board[clickedCellIndex] !== '' || !gameActive || currentMode === 'ava' && avaIntervalId) {
            return; // Abaikan jika sel sudah terisi, game tidak aktif, atau AvA sedang berjalan otomatis
        }

        // PvP atau giliran Human di PvE
        if (currentMode === 'pvp' || (currentMode === 'pve' && currentPlayerSymbol === humanPlayerSymbol)) {
            placeSymbol(clickedCellIndex, currentPlayerSymbol);
            if (!checkGameEnd()) {
                switchPlayer();
                if (currentMode === 'pve' && currentPlayerSymbol === aiPlayerSymbol) {
                    setTimeout(makeAiMove, 500); // AI bergerak setelah delay
                }
            }
        }
    }

    function placeSymbol(index, symbol) {
        if (board[index] === '' && gameActive) {
            board[index] = symbol;
            cells[index].textContent = symbol;
            cells[index].classList.add(symbol, 'occupied');
            return true; // Berhasil menempatkan
        }
        return false; // Gagal menempatkan
    }

    function switchPlayer() {
        currentPlayerSymbol = (currentPlayerSymbol === 'X') ? 'O' : 'X';
        updateStatusDisplay();
    }

    function checkGameEnd() {
        let roundWon = false;
        for (let i = 0; i < winningConditions.length; i++) {
            const winCondition = winningConditions[i];
            let a = board[winCondition[0]];
            let b = board[winCondition[1]];
            let c = board[winCondition[2]];
            if (a === '' || b === '' || c === '') {
                continue;
            }
            if (a === b && b === c) {
                roundWon = true;
                break;
            }
        }

        if (roundWon) {
            statusMessage.textContent = `Pemain ${currentPlayerSymbol} Menang!`;
            gameActive = false;
            scores[currentPlayerSymbol]++;
            updateScoreDisplay();
            if (avaIntervalId) clearInterval(avaIntervalId);
            return true;
        }

        let roundDraw = !board.includes('');
        if (roundDraw) {
            statusMessage.textContent = 'Permainan Seri!';
            gameActive = false;
            scores.draw++;
            updateScoreDisplay();
            if (avaIntervalId) clearInterval(avaIntervalId);
            return true;
        }
        return false;
    }

    // --- AI Logic ---
    function getEmptyCells(currentBoard) {
        return currentBoard.map((val, idx) => val === '' ? idx : null).filter(val => val !== null);
    }

    function makeAiMove() {
        if (!gameActive) return;

        let difficulty;
        let aiSymbolForThisMove = currentPlayerSymbol; // Di PvE, ini AI yang sedang giliran

        if (currentMode === 'pve') {
            difficulty = currentAiDifficulty;
        } else if (currentMode === 'ava') {
            // Ditentukan AI mana yang sedang giliran
            difficulty = (currentPlayerSymbol === 'X') ? avaAi1Difficulty : avaAi2Difficulty;
        } else {
            return; // Bukan mode AI
        }
        
        let moveIndex;
        switch (difficulty) {
            case 'random':
                moveIndex = getRandomAiMove(board);
                break;
            case 'medium':
                moveIndex = getMediumAiMove(board, aiSymbolForThisMove);
                break;
            case 'unbeatable':
                moveIndex = getMinimaxAiMove(board, aiSymbolForThisMove).index;
                break;
            default:
                moveIndex = getRandomAiMove(board);
        }

        if (moveIndex !== undefined && moveIndex !== null) {
            placeSymbol(moveIndex, aiSymbolForThisMove);
            if (!checkGameEnd()) {
                switchPlayer();
                // Jika masih AvA dan aktif, AI berikutnya bergerak
                if (currentMode === 'ava' && gameActive && avaIntervalId) {
                    // Biarkan interval yang menangani giliran berikutnya
                }
            }
        }
    }

    function getRandomAiMove(currentBoard) {
        const emptyCells = getEmptyCells(currentBoard);
        if (emptyCells.length > 0) {
            return emptyCells[Math.floor(Math.random() * emptyCells.length)];
        }
        return null;
    }

    function getMediumAiMove(currentBoard, aiSym) {
        // 60% kemungkinan Minimax, 40% kemungkinan acak
        if (Math.random() < 0.6) {
            const bestMove = getMinimaxAiMove(currentBoard, aiSym);
            if (bestMove && bestMove.index !== undefined) return bestMove.index;
        }
        return getRandomAiMove(currentBoard);
    }
    
    // Minimax AI
    function getMinimaxAiMove(newBoard, playerSymbol) {
        // Tentukan simbol lawan
        const opponentSymbol = (playerSymbol === 'X') ? 'O' : 'X';

        // Fungsi minimax
        function minimax(currentBoard, depth, isMaximizingPlayer, alpha, beta) {
            // Cek status terminal
            if (checkTerminalState(currentBoard, playerSymbol)) return { score: 10 - depth };
            if (checkTerminalState(currentBoard, opponentSymbol)) return { score: -10 + depth };
            if (getEmptyCells(currentBoard).length === 0) return { score: 0 }; // Seri

            const availableMoves = getEmptyCells(currentBoard);

            if (isMaximizingPlayer) { // AI (Maximizer)
                let best = { score: -Infinity, index: -1 };
                for (let moveIdx of availableMoves) {
                    currentBoard[moveIdx] = playerSymbol; // Coba langkah
                    let result = minimax(currentBoard, depth + 1, false, alpha, beta);
                    currentBoard[moveIdx] = ''; // Undo langkah
                    
                    if (result.score > best.score) {
                        best.score = result.score;
                        best.index = moveIdx;
                    }
                    alpha = Math.max(alpha, best.score);
                    if (beta <= alpha) break; // Pruning
                }
                return best;
            } else { // Lawan (Minimizer)
                let best = { score: Infinity, index: -1 };
                for (let moveIdx of availableMoves) {
                    currentBoard[moveIdx] = opponentSymbol; // Coba langkah
                    let result = minimax(currentBoard, depth + 1, true, alpha, beta);
                    currentBoard[moveIdx] = ''; // Undo langkah

                    if (result.score < best.score) {
                        best.score = result.score;
                        best.index = moveIdx;
                    }
                    beta = Math.min(beta, best.score);
                    if (beta <= alpha) break; // Pruning
                }
                return best;
            }
        }
        // Panggil minimax untuk pemain AI saat ini (isMaximizingPlayer = true)
        return minimax([...newBoard], 0, true, -Infinity, Infinity);
    }

    function checkTerminalState(currentBoard, player) {
        for (const condition of winningConditions) {
            if (currentBoard[condition[0]] === player &&
                currentBoard[condition[1]] === player &&
                currentBoard[condition[2]] === player) {
                return true;
            }
        }
        return false;
    }
    
    // --- AI vs AI Mode ---
    function startAvaSimulation() {
        if (currentMode !== 'ava') return;
        if (avaIntervalId) clearInterval(avaIntervalId); // Hentikan simulasi lama jika ada

        initializeGame(); // Reset papan dan status untuk AvA
        gameActive = true; // Pastikan game aktif untuk simulasi
        statusMessage.textContent = "AI vs AI dimulai...";

        avaIntervalId = setInterval(() => {
            if (!gameActive) {
                clearInterval(avaIntervalId);
                avaIntervalId = null;
                return;
            }
            makeAiMove(); // AI yang sedang giliran akan bergerak
        }, 1000); // Delay antar langkah AI
    }

    // --- Event Listeners ---
    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    resetButton.addEventListener('click', initializeGame);
    gameModeSelect.addEventListener('change', () => {
        handleUiVisibility();
        initializeGame(); // Reset game saat mode berubah
    });
    player1SymbolSelect.addEventListener('change', initializeGame); // Reset jika simbol berubah
    aiDifficultySelect.addEventListener('change', initializeGame); // Reset jika AI berubah
    avaAi1DifficultySelect.addEventListener('change', initializeGame);
    avaAi2DifficultySelect.addEventListener('change', initializeGame);
    startAvAButton.addEventListener('click', startAvaSimulation);

    // --- Initial Setup ---
    initializeGame(); // Mulai game saat halaman dimuat pertama kali
    
    // Penjelasan Minimax (bisa ditampilkan di UI atau konsol jika diinginkan)
    console.log(
    Penjelasan Algoritma Minimax (untuk AI Sulit):
    Minimax adalah algoritma rekursif yang digunakan dalam pengambilan keputusan dan teori permainan untuk menemukan langkah optimal bagi seorang pemain, dengan asumsi bahwa lawan juga bermain secara optimal.
    1. Pohon Permainan: Minimax menjelajahi semua kemungkinan langkah hingga akhir permainan, membentuk sebuah "pohon permainan".
    2. Skor Terminal: Setiap akhir permainan (menang, kalah, seri) diberi skor. Misal: +10 untuk kemenangan AI, -10 untuk kekalahan AI (kemenangan pemain), dan 0 untuk seri.
    3. Propagasi Skor: 
       - Giliran AI (Maximizer): AI akan memilih langkah yang mengarah ke hasil dengan skor maksimum.
       - Giliran Lawan (Minimizer): Diasumsikan lawan akan memilih langkah yang mengarah ke hasil dengan skor minimum (dari sudut pandang AI).
    4. Rekursi: Algoritma bekerja mundur dari akhir permainan, menghitung skor optimal untuk setiap state.
    5. Alpha-Beta Pruning (Optimasi): Teknik ini memotong cabang-cabang dari pohon permainan yang tidak perlu dieksplorasi karena sudah ditemukan langkah yang lebih baik, sehingga membuat algoritma lebih cepat.
    Dalam Tic-Tac-Toe, karena permainannya relatif sederhana, Minimax dapat menjelajahi seluruh pohon permainan dan selalu menemukan langkah yang tidak akan membuatnya kalah (jika dimainkan dengan benar, hasilnya minimal seri).
    );
});
