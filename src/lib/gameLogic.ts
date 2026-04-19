/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Player, WINNING_COMBINATIONS } from '../types';

export const checkWinner = (board: Player[]) => {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: combo };
    }
  }
  if (!board.includes(null)) {
    return { winner: 'DRAW' as const, line: null };
  }
  return { winner: null, line: null };
};

export const getBestMove = (board: Player[], difficulty: string): number => {
  const availableMoves = board
    .map((val, idx) => (val === null ? idx : null))
    .filter((val): val is number => val !== null);

  if (difficulty === 'EASY') {
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  }

  if (difficulty === 'MEDIUM') {
    // Try to win
    for (const move of availableMoves) {
       const boardCopy = [...board];
       boardCopy[move] = 'O';
       if (checkWinner(boardCopy).winner === 'O') return move;
    }
    // Try to block
    for (const move of availableMoves) {
       const boardCopy = [...board];
       boardCopy[move] = 'X';
       if (checkWinner(boardCopy).winner === 'X') return move;
    }
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  }

  // HARD - Minimax
  return minimax(board, 'O').index;
};

const minimax = (board: Player[], player: 'O' | 'X'): { score: number; index: number } => {
  const result = checkWinner(board);
  if (result.winner === 'X') return { score: -10, index: -1 };
  if (result.winner === 'O') return { score: 10, index: -1 };
  if (result.winner === 'DRAW') return { score: 0, index: -1 };

  const availableMoves = board
    .map((val, idx) => (val === null ? idx : null))
    .filter((val): val is number => val !== null);

  const moves = [];

  for (const move of availableMoves) {
    const boardCopy = [...board];
    boardCopy[move] = player;
    
    const score = minimax(boardCopy, player === 'O' ? 'X' : 'O').score;
    moves.push({ index: move, score });
  }

  let bestMove = 0;
  if (player === 'O') {
    let bestScore = -Infinity;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }

  return moves[bestMove];
};
