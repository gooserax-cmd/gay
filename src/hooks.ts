import { useState, useEffect, useCallback, useRef } from 'react';
import { createBoard, checkCollision, randomTetromino, COLS } from './game';

export const usePlayer = () => {
  const [player, setPlayer] = useState({
    pos: { x: 0, y: 0 },
    tetromino: [[0]],
    color: '',
    collided: false,
  });

  const rotate = (matrix: number[][], dir: number) => {
    const rotatedTetro = matrix.map((_, index) =>
      matrix.map((col) => col[index])
    );
    if (dir > 0) return rotatedTetro.map((row) => row.reverse());
    return rotatedTetro.reverse();
  };

  const playerRotate = useCallback((board: any, dir: number) => {
    setPlayer((prevPlayer) => {
      const clonedPlayer = JSON.parse(JSON.stringify(prevPlayer));
      clonedPlayer.tetromino = rotate(clonedPlayer.tetromino, dir);

      const pos = clonedPlayer.pos;
      let offset = 1;
      while (checkCollision(clonedPlayer, board, { x: 0, y: 0 })) {
        clonedPlayer.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > clonedPlayer.tetromino[0].length) {
          rotate(clonedPlayer.tetromino, -dir);
          clonedPlayer.pos.x = pos.x;
          return prevPlayer;
        }
      }
      return clonedPlayer;
    });
  }, []);

  const updatePlayerPos = useCallback(({ x, y, collided }: { x: number, y: number, collided: boolean }) => {
    setPlayer((prev) => ({
      ...prev,
      pos: { x: (prev.pos.x + x), y: (prev.pos.y + y) },
      collided,
    }));
  }, []);

  const resetPlayer = useCallback(() => {
    const newTetromino = randomTetromino();
    setPlayer({
      pos: { x: COLS / 2 - 2, y: 0 },
      tetromino: newTetromino.shape,
      color: newTetromino.color,
      collided: false,
    });
  }, []);

  return { player, updatePlayerPos, resetPlayer, playerRotate };
};

export const useBoard = (player: any, resetPlayer: () => void) => {
  const [board, setBoard] = useState(createBoard());
  const [rowsCleared, setRowsCleared] = useState(0);

  useEffect(() => {
    setRowsCleared(0);

    const sweepRows = (newBoard: any) => {
      return newBoard.reduce((ack: any, row: any) => {
        if (row.findIndex((cell: any) => cell === null) === -1) {
          setRowsCleared((prev) => prev + 1);
          ack.unshift(new Array(COLS).fill(null));
          return ack;
        }
        ack.push(row);
        return ack;
      }, []);
    };

    const updateBoard = (prevBoard: any) => {
      const newBoard = prevBoard.map((row: any) =>
        row.map((cell: any) => (cell && cell.merged ? cell : null))
      );

      player.tetromino.forEach((row: any, y: number) => {
        row.forEach((value: any, x: number) => {
          if (value !== 0) {
            if (newBoard[y + player.pos.y] && newBoard[y + player.pos.y][x + player.pos.x] !== undefined) {
               newBoard[y + player.pos.y][x + player.pos.x] = {
                 color: player.color,
                 merged: player.collided,
               };
            }
          }
        });
      });

      if (player.collided) {
        resetPlayer();
        return sweepRows(newBoard);
      }

      return newBoard;
    };

    setBoard((prev) => updateBoard(prev));
  }, [player, resetPlayer]);

  return { board, setBoard, rowsCleared };
};

export const useGameStatus = (rowsCleared: number) => {
  const [score, setScore] = useState(0);
  const [rows, setRows] = useState(0);
  const [level, setLevel] = useState(0);

  const calcScore = useCallback(() => {
    const linePoints = [40, 100, 300, 1200];
    if (rowsCleared > 0) {
      setScore((prev) => prev + linePoints[rowsCleared - 1] * (level + 1));
      setRows((prev) => prev + rowsCleared);
    }
  }, [level, rowsCleared]);

  useEffect(() => {
    calcScore();
  }, [calcScore, rowsCleared, score]);

  return { score, setScore, rows, setRows, level, setLevel };
};

export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<(() => void) | null>(null);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      if (savedCallback.current) {
        savedCallback.current();
      }
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
