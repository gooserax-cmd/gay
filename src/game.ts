export const COLS = 10;
export const ROWS = 20;

export type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

export const TETROMINOES: Record<TetrominoType, { shape: number[][], color: string }> = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    color: 'bg-cyan-400'
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: 'bg-blue-500'
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: 'bg-orange-500'
  },
  O: {
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: 'bg-yellow-400'
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ],
    color: 'bg-green-500'
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: 'bg-purple-500'
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ],
    color: 'bg-red-500'
  }
};

export const randomTetromino = () => {
  const keys = Object.keys(TETROMINOES) as TetrominoType[];
  const randKey = keys[Math.floor(Math.random() * keys.length)];
  return { type: randKey, ...TETROMINOES[randKey] };
};

export const createBoard = () =>
  Array.from(Array(ROWS), () => new Array(COLS).fill(null));

export const checkCollision = (player: any, board: any, { x: moveX, y: moveY }: { x: number, y: number }) => {
  for (let y = 0; y < player.tetromino.length; y += 1) {
    for (let x = 0; x < player.tetromino[y].length; x += 1) {
      if (player.tetromino[y][x] !== 0) {
        if (
          !board[y + player.pos.y + moveY] ||
          board[y + player.pos.y + moveY][x + player.pos.x + moveX] === undefined ||
          (board[y + player.pos.y + moveY][x + player.pos.x + moveX] &&
            board[y + player.pos.y + moveY][x + player.pos.x + moveX].merged)
        ) {
          return true;
        }
      }
    }
  }
  return false;
};
