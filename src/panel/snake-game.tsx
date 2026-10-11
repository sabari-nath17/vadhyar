import { useEffect, useRef, useState } from 'react';
import { Icon } from './ui.js';
import { boardSize, newSnake, stepSnake, turnSnake, type Direction } from './snake.js';

const directions: Record<string, Direction> = { arrowup: 'up', w: 'up', arrowdown: 'down', s: 'down', arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right' };

export function SnakeGame({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return <details className="snake-egg" open={open} onToggle={event => setOpen(event.currentTarget.open)}><summary aria-label="Take a short break"><Icon name="egg" />Take a short break</summary>{open && <SnakeBoard />}</details>;
}

function SnakeBoard() {
  const [game, setGame] = useState(() => newSnake());
  const board = useRef<HTMLDivElement>(null);
  const pause = () => setGame(current => current.status === 'running' ? { ...current, status: 'paused' } : current);
  useEffect(() => {
    if (game.status !== 'running') return;
    const timer = window.setInterval(() => setGame(current => stepSnake(current)), window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 600 : 200);
    return () => window.clearInterval(timer);
  }, [game.status]);
  useEffect(() => {
    const onVisibility = () => { if (document.hidden) pause(); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);
  return <section aria-labelledby="snake-title">
      <h2 id="snake-title">Snake — a tiny break</h2>
      <p id="snake-help">Collect diamonds. Avoid walls and your tail. Focus the board and use arrow keys or WASD; Escape pauses. Direction buttons work too.</p>
      <p role="status" aria-live="polite">{game.status === 'lost' ? 'Game over.' : game.status === 'won' ? 'You filled the board!' : game.status === 'running' ? 'Playing.' : game.status === 'paused' ? 'Paused.' : 'Ready.'} Diamonds: {game.body.length - 3}.</p>
      <div ref={board} className="snake-board" role="group" tabIndex={0} aria-label="Snake game board" aria-describedby="snake-help" onBlur={pause} onKeyDown={event => {
        const direction = directions[event.key.toLowerCase()];
        if (direction || event.key === 'Escape') {
          event.preventDefault(); event.stopPropagation();
          if (direction) setGame(current => turnSnake(current, direction));
          else pause();
        }
      }}>
        {Array.from({ length: boardSize ** 2 }, (_, cell) => <span key={cell} aria-hidden="true" className={game.body.includes(cell) ? 'snake-cell snake-body' : game.food === cell ? 'snake-cell snake-food' : 'snake-cell'}></span>)}
      </div>
      <div className="snake-controls">
        {(game.status === 'ready' || game.status === 'paused') && <button onClick={() => { setGame(current => ({ ...current, status: 'running' })); board.current?.focus(); }}>{game.status === 'paused' ? 'Resume' : 'Play'}</button>}
        {game.status === 'running' && <button onClick={pause}>Pause</button>}
        <button onClick={() => { setGame(newSnake()); board.current?.focus(); }}>New game</button>
      </div>
      {(game.status === 'running' || game.status === 'paused') && <div className="snake-controls" role="group" aria-label="Snake directions">
        {(['up', 'left', 'down', 'right'] as const).map((direction, index) => <button key={direction} aria-label={`Move ${direction}`} onClick={() => { setGame(current => turnSnake({ ...current, status: 'running' }, direction)); board.current?.focus(); }}><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" ><g transform={`rotate(${[0, 270, 180, 90][index]}, 12, 12)`}><path d="m6 10 6-6 6 6m-6-6v16" /></g></svg></button>)}
      </div>}
      <p>This game stays in the panel. It makes no API calls and its score is separate from learning progress.</p>
    </section>;
}
