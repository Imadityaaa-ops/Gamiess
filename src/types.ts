/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Player = 'X' | 'O' | null;
export type GameMode = 'PVB' | 'PVP'; // Player vs Bot, Player vs Player
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface GameState {
  board: Player[];
  xIsNext: boolean;
  winner: Player | 'DRAW';
  winningLine: number[] | null;
}

export const INITIAL_STATE: GameState = {
  board: Array(9).fill(null),
  xIsNext: true,
  winner: null,
  winningLine: null,
};

export const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
  [0, 4, 8], [2, 4, 6],           // Diagonals
];

// Sound files
export const SOUNDS = {
  CLICK: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  WIN: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  DRAW: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
  START: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3',
};
