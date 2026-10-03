import { useCallback, useEffect, useRef } from 'react';
import type { Direction } from './generator';

export type Blank = { row: number; col: number; answer: string };
export type PuzzleIdiom = {
  idiom: string;
  direction: Direction;
  start_row: number;
  start_col: number;
  meaning: string;
  length: number;
};
export type CellStatus = 'empty' | 'given' | 'correct' | 'wrong' | 'hint' | 'revealed';

type Props = {
  grid: (string | null)[][];
  status: (CellStatus | null)[][];
  blanks: Blank[];
  idioms: PuzzleIdiom[];
  onCellChange: (row: number, col: number, value: string) => void;
  selectedCell: { row: number; col: number } | null;
  onCellSelect: (cell: { row: number; col: number } | null) => void;
};

export default function CrosswordGrid({
  grid,
  status,
  blanks,
  idioms,
  onCellChange,
  selectedCell,
  onCellSelect,
}: Props) {
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const composingRef = useRef(false);

  useEffect(() => {
    blanks.forEach((blank) => {
      const key = `${blank.row}-${blank.col}`;
      const input = inputRefs.current[key];
      if (input && !composingRef.current) {
        const gridValue = grid[blank.row]?.[blank.col] ?? '';
        if (input.value !== gridValue) input.value = gridValue;
      }
    });
  }, [grid, blanks]);

  const getCellNumber = useCallback(
    (row: number, col: number) => {
      const index = idioms.findIndex(
        (idiom) => idiom.start_row === row && idiom.start_col === col,
      );
      return index >= 0 ? index + 1 : null;
    },
    [idioms],
  );

  const isBlank = useCallback(
    (row: number, col: number) => blanks.some((b) => b.row === row && b.col === col),
    [blanks],
  );

  const focusBlank = useCallback(
    (row: number, col: number) => {
      const key = `${row}-${col}`;
      const input = inputRefs.current[key];
      if (input && !input.disabled) {
        input.focus();
        input.select();
        onCellSelect({ row, col });
      }
    },
    [onCellSelect],
  );

  const moveToNext = useCallback(
    (row: number, col: number, direction = 1) => {
      const currentIndex = blanks.findIndex((b) => b.row === row && b.col === col);
      if (currentIndex === -1) return;
      const next = blanks[currentIndex + direction];
      if (next) focusBlank(next.row, next.col);
    },
    [blanks, focusBlank],
  );

  const handleCompositionEnd = (e: React.FormEvent<HTMLInputElement>, row: number, col: number) => {
    composingRef.current = false;
    const input = e.currentTarget;
    const value = input.value;
    if (value.length > 0) {
      const char = value.charAt(0);
      input.value = char;
      onCellChange(row, col, char);
      setTimeout(() => moveToNext(row, col, 1), 10);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, row: number, col: number) => {
    if (composingRef.current) return;
    const input = e.currentTarget;
    const value = input.value;
    if (value.length > 0) {
      const char = value.charAt(value.length - 1);
      if (/[\u4e00-\u9fa5]/.test(char)) {
        input.value = char;
        onCellChange(row, col, char);
        setTimeout(() => moveToNext(row, col, 1), 10);
      } else {
        input.value = grid[row]?.[col] ?? '';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, row: number, col: number) => {
    if (composingRef.current) return;

    if (e.key === 'Backspace') {
      e.preventDefault();
      if (e.currentTarget.value) {
        e.currentTarget.value = '';
        onCellChange(row, col, '');
      } else {
        moveToNext(row, col, -1);
      }
    } else if (e.key === 'Delete') {
      e.preventDefault();
      e.currentTarget.value = '';
      onCellChange(row, col, '');
    } else if (e.key === 'ArrowRight' || e.key === 'Tab') {
      e.preventDefault();
      moveToNext(row, col, 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      moveToNext(row, col, -1);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const direction = e.key === 'ArrowDown' ? 1 : -1;
      const sameColBlanks = blanks.filter((b) => b.col === col).sort((a, b) => a.row - b.row);
      const next = sameColBlanks[sameColBlanks.findIndex((b) => b.row === row) + direction];
      if (next) focusBlank(next.row, next.col);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      moveToNext(row, col, 1);
    }
  };

  const getCellClassName = (row: number, col: number, cellStatus: CellStatus | null) => {
    const classes = ['cell'];
    if (cellStatus === null) classes.push('cell-empty');
    else if (cellStatus === 'given') classes.push('cell-given');
    else if (cellStatus === 'correct') classes.push('cell-correct');
    else if (cellStatus === 'wrong') classes.push('cell-wrong');
    else if (cellStatus === 'hint') classes.push('cell-hint');
    else if (cellStatus === 'revealed') classes.push('cell-revealed');
    else classes.push('cell-input');

    if (selectedCell?.row === row && selectedCell?.col === col) classes.push('cell-selected');
    return classes.join(' ');
  };

  return (
    <div className="crossword-container">
      <div
        className="crossword-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${grid[0]?.length || 0}, var(--cell-size, 56px))`,
          gridTemplateRows: `repeat(${grid.length || 0}, var(--cell-size, 56px))`,
          gap: '0',
          background: 'transparent',
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            if (cell === null) return null;

            const cellStatus = status[rowIndex]?.[colIndex] ?? null;
            const cellNumber = getCellNumber(rowIndex, colIndex);
            const editable = isBlank(rowIndex, colIndex);
            const key = `${rowIndex}-${colIndex}`;
            const isDisabled =
              cellStatus === 'correct' || cellStatus === 'hint' || cellStatus === 'revealed';

            return (
              <div
                key={key}
                className={getCellClassName(rowIndex, colIndex, cellStatus)}
                onClick={() => editable && !isDisabled && focusBlank(rowIndex, colIndex)}
                style={{ gridColumn: colIndex + 1, gridRow: rowIndex + 1 }}
              >
                {cellNumber && <span className="cell-number">{cellNumber}</span>}

                {editable ? (
                  <input
                    ref={(el) => {
                      inputRefs.current[key] = el;
                    }}
                    type="text"
                    className="cell-input-field"
                    defaultValue={cell || ''}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    enterKeyHint="next"
                    onCompositionStart={() => {
                      composingRef.current = true;
                    }}
                    onCompositionEnd={(e) => handleCompositionEnd(e, rowIndex, colIndex)}
                    onChange={(e) => handleChange(e, rowIndex, colIndex)}
                    onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                    onFocus={() => onCellSelect({ row: rowIndex, col: colIndex })}
                    disabled={isDisabled}
                  />
                ) : (
                  <span className="cell-char">{cell}</span>
                )}
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}