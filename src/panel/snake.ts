export const boardSize = 12;
export type Direction = 'up' | 'down' | 'left' | 'right';
export interface Snake {
  body: number[];
  direction: Direction;
  nextDirection: Direction;
  food: number | null;
  status: 'ready' | 'running' | 'paused' | 'lost' | 'won';
}

function foodOutside(body: number[], random: () => number): number | null {
  const free = Array.from({ length: boardSize ** 2 }, (_, cell) => cell).filter(cell => !body.includes(cell));
  return free.length ? free[Math.floor(random() * free.length)] : null;
}

export function newSnake(random = Math.random): Snake {
  const body = [78, 77, 76];
  return { body, direction: 'right', nextDirection: 'right', food: foodOutside(body, random), status: 'ready' };
}

export function turnSnake(game: Snake, direction: Direction): Snake {
  const opposite: Record<Direction, Direction> = { up: 'down', down: 'up', left: 'right', right: 'left' };
  if (game.status !== 'running' || direction === opposite[game.direction]) return game;
  return { ...game, nextDirection: direction };
}

export function stepSnake(game: Snake, random = Math.random): Snake {
  if (game.status !== 'running') return game;
  const direction = game.nextDirection;
  const x = game.body[0] % boardSize + (direction === 'right' ? 1 : direction === 'left' ? -1 : 0);
  const y = Math.floor(game.body[0] / boardSize) + (direction === 'down' ? 1 : direction === 'up' ? -1 : 0);
  const head = y * boardSize + x;
  const grows = head === game.food;
  const occupied = grows ? game.body : game.body.slice(0, -1);
  if (x < 0 || x >= boardSize || y < 0 || y >= boardSize || occupied.includes(head)) return { ...game, status: 'lost' };
  const body = [head, ...game.body];
  if (!grows) body.pop();
  const food = grows ? foodOutside(body, random) : game.food;
  return { ...game, body, direction, food, status: food === null ? 'won' : 'running' };
}
