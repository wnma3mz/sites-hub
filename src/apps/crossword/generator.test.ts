import { describe, expect, it } from 'vitest';
import { CrosswordGenerator, type IdiomEntry } from './generator';
import idiomsData from './idioms.json';

const IDIOMS = idiomsData as IdiomEntry[];

describe('CrosswordGenerator', () => {
  it('生成合法谜题：答案与成语一致、空格答案正确、无越界', () => {
    const gen = new CrosswordGenerator(IDIOMS, 30);

    for (let round = 0; round < 20; round++) {
      const puzzle = gen.generate(20);
      const rows = puzzle.grid.length;
      const cols = puzzle.grid[0].length;

      expect(rows).toBeGreaterThan(0);
      expect(puzzle.solution).toHaveLength(rows);

      // 答案网格形状一致
      for (let r = 0; r < rows; r++) {
        expect(puzzle.solution[r]).toHaveLength(cols);
        for (let c = 0; c < cols; c++) {
          if (puzzle.grid[r][c] === null) {
            expect(puzzle.solution[r][c]).toBeNull();
          }
        }
      }

      // 每个成语的每个字都与答案网格一致
      for (const item of puzzle.idioms) {
        for (let i = 0; i < item.idiom.length; i++) {
          const r = item.direction === 'horizontal' ? item.start_row : item.start_row + i;
          const c = item.direction === 'horizontal' ? item.start_col + i : item.start_col;
          expect(r).toBeGreaterThanOrEqual(0);
          expect(r).toBeLessThan(rows);
          expect(c).toBeGreaterThanOrEqual(0);
          expect(c).toBeLessThan(cols);
          expect(puzzle.solution[r][c]).toBe(item.idiom[i]);
        }
      }

      // 空格答案与解答一致，且展示网格该位置为空串
      for (const blank of puzzle.blanks) {
        expect(puzzle.grid[blank.row][blank.col]).toBe('');
        expect(puzzle.solution[blank.row][blank.col]).toBe(blank.answer);
      }
    }
  });

  it('不同难度都能出题', () => {
    const gen = new CrosswordGenerator(IDIOMS);
    for (const [count, size] of [
      [10, 20],
      [18, 30],
      [30, 40],
    ] as const) {
      gen.gridSize = size;
      const puzzle = gen.generate(count);
      expect(puzzle.idioms.length).toBeGreaterThanOrEqual(3);
    }
  });
});