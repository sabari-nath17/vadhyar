import { useEffect, useRef, useState } from 'react';
import { boardSize, newSnake, stepSnake, turnSnake, type Direction } from './snake.js';

const directions: Record<string, Direction> = { arrowup: 'up', w: 'up', arrowdown: 'down', s: 'down', arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right' };

export function SnakeGame() {
  const [game, setGame] = useState(() => newSnake());
  const board = useRef<HTMLDivElement>(null);
  const pause = () => setGame(current => current.status === 'running' ? { ...current, status: 'paused' } : current);
  useEffect(() => {
    if (game.status !== 'running') return;
    const timer = window.setInterval(() => setGame(current => stepSnake(current)), 200);
    return () => window.clearInterval(timer);
  }, [game.status]);
  useEffect(() => {
    const onVisibility = () => { if (document.hidden) pause(); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);
  return <details className="snake-egg" onToggle={event => { if (!event.currentTarget.open) pause(); }} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) pause();
  }}>
    <summary aria-label="Open Snake Easter egg" title="A tiny break">🥚</summary>
    <section aria-labelledby="snake-title">
      <h2 id="snake-title">Snake — a tiny break</h2>
      <p id="snake-help">Collect diamonds. Avoid walls and your tail. Focus the board and use arrow keys or WASD; Escape pauses. Direction buttons work too.</p>
      <p role="status" aria-live="polite">{game.status === 'lost' ? 'Game over.' : game.status === 'won' ? 'You filled the board!' : game.status === 'running' ? 'Playing.' : game.status === 'paused' ? 'Paused.' : 'Ready.'} Diamonds: {game.body.length - 3}.</p>
      <div ref={board} className="snake-board" role="group" tabIndex={0} aria-label="Snake game board" aria-describedby="snake-help" onKeyDown={event => {
        const direction = directions[event.key.toLowerCase()];
        if (direction || event.key === 'Escape') {
          event.preventDefault(); event.stopPropagation();
          if (direction) setGame(current => turnSnake(current, direction));
          else pause();
        }
      }}>
        {Array.from({ length: boardSize ** 2 }, (_, cell) => <span key={cell} aria-hidden="true" className={game.body.includes(cell) ? 'snake-cell snake-body' : game.food === cell ? 'snake-cell snake-food' : 'snake-cell'}>{game.body[0] === cell ? '●' : game.body.includes(cell) ? '▪' : game.food === cell ? '◆' : ''}</span>)}
      </div>
      <div className="snake-controls">
        <button disabled={game.status === 'running' || game.status === 'lost' || game.status === 'won'} onClick={() => { setGame(current => ({ ...current, status: 'running' })); board.current?.focus(); }}>{game.status === 'paused' ? 'Resume' : 'Play'}</button>
        <button disabled={game.status !== 'running'} onClick={pause}>Pause</button>
        <button onClick={() => { setGame(newSnake()); board.current?.focus(); }}>New game</button>
      </div>
      <div className="snake-controls" role="group" aria-label="Snake directions">
        {(['up', 'left', 'down', 'right'] as const).map((direction, index) => <button key={direction} aria-label={`Move ${direction}`} disabled={game.status !== 'running'} onClick={() => { setGame(current => turnSnake(current, direction)); board.current?.focus(); }}>{['↑', '←', '↓', '→'][index]}</button>)}
      </div>
      <p>This game stays in the panel. It makes no API calls and its score is separate from learning progress.</p>
    </section>
  </details>;
}
