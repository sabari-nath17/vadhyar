import { describe, expect, it } from 'vitest';
import { boardSize, newSnake, stepSnake, turnSnake, type Snake } from '../src/panel/snake.js';

describe('local Snake Easter egg', () => {
  const running = (): Snake => ({ ...newSnake(() => 0), status: 'running' });
  it('starts with food outside the body and freezes before play or while paused', () => {
    const ready = newSnake(() => 0);
    expect(ready.body).not.toContain(ready.food);
    expect(stepSnake(ready)).toBe(ready);
    const paused: Snake = { ...ready, status: 'paused' };
    expect(stepSnake(paused)).toBe(paused);
  });
  it('moves one cell without growing and prevents reversal within a tick', () => {
    expect(stepSnake(running()).body).toEqual([79, 78, 77]);
    const turned = turnSnake(running(), 'up');
    expect(turnSnake(turned, 'left')).toBe(turned);
    const moved = stepSnake(turned);
    expect(moved.body[0]).toBe(66);
    expect(moved.direction).toBe('up');
    expect(stepSnake(turnSnake(moved, 'left')).body[0]).toBe(65);
  });
  it('grows on food and keeps new food outside the snake', () => {
    const moved = stepSnake({ ...running(), food: 79 }, () => 0);
    expect(moved.body).toEqual([79, 78, 77, 76]);
    expect(moved.body).not.toContain(moved.food);
  });
  it('ends on walls or the body, but permits entering a vacated tail cell', () => {
    expect(stepSnake({ ...running(), body: [11, 10, 9] }).status).toBe('lost');
    expect(stepSnake({ ...running(), body: [78, 79, 80, 92] }).status).toBe('lost');
    const tail = stepSnake({ ...running(), body: [78, 66, 67, 79] });
    expect(tail.body).toEqual([79, 78, 66, 67]);
    expect(tail.status).toBe('running');
  });
  it('wins without looping when the final free cell is collected', () => {
    const body = [0, ...Array.from({ length: boardSize ** 2 - 2 }, (_, cell) => cell + 2)];
    const won = stepSnake({ ...running(), body, food: 1 });
    expect(won.status).toBe('won');
    expect(won.food).toBeNull();
    expect(won.body).toHaveLength(boardSize ** 2);
    expect(stepSnake(won)).toBe(won);
  });
});
