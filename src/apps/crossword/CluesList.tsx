import { useState } from 'react';
import type { PuzzleIdiom } from './CrosswordGrid';

export default function CluesList({ idioms }: { idioms: PuzzleIdiom[] }) {
  const [revealedClues, setRevealedClues] = useState<Set<number>>(new Set());

  const horizontalClues = idioms.filter((idiom) => idiom.direction === 'horizontal');
  const verticalClues = idioms.filter((idiom) => idiom.direction === 'vertical');

  const getClueNumber = (idiom: PuzzleIdiom) =>
    idioms.findIndex((i) => i.start_row === idiom.start_row && i.start_col === idiom.start_col) + 1;

  const toggleClue = (number: number) => {
    setRevealedClues((prev) => {
      const next = new Set(prev);
      if (next.has(number)) next.delete(number);
      else next.add(number);
      return next;
    });
  };

  const renderClueItem = (idiom: PuzzleIdiom, index: number) => {
    const number = getClueNumber(idiom);
    const isRevealed = revealedClues.has(number);

    return (
      <li key={index} className={`clue-item ${isRevealed ? 'clue-revealed' : ''}`}>
        <button
          className="clue-number"
          onClick={() => toggleClue(number)}
          title={isRevealed ? '点击隐藏释义' : '点击查看释义'}
        >
          {number}
        </button>
        <div className="clue-content">
          {isRevealed ? (
            <span className="clue-text">{idiom.meaning}</span>
          ) : (
            <span className="clue-hidden">点击数字查看释义</span>
          )}
          <span className="clue-length">({idiom.length}字)</span>
        </div>
      </li>
    );
  };

  return (
    <div className="clues-container">
      <div className="clues-header">
        <span className="clues-tip">💡 点击数字查看成语释义</span>
      </div>

      <div className="clues-section">
        <h3 className="clues-title">
          <span className="clues-icon">→</span>
          横向
        </h3>
        <ul className="clues-list">
          {horizontalClues.map((idiom, index) => renderClueItem(idiom, index))}
        </ul>
      </div>

      <div className="clues-section">
        <h3 className="clues-title">
          <span className="clues-icon">↓</span>
          纵向
        </h3>
        <ul className="clues-list">
          {verticalClues.map((idiom, index) => renderClueItem(idiom, index))}
        </ul>
      </div>
    </div>
  );
}