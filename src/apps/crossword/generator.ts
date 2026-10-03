/**
 * 交叉填字谜题生成器
 *
 * 移植自 crossword_puzzle/backend/puzzle.py，去掉 Python 依赖，
 * 改为浏览器内本地生成，摆脱对后端 API 的依赖。
 */

export type Direction = 'horizontal' | 'vertical';

export type IdiomEntry = {
  idiom: string;
  meaning: string;
  category?: string;
};

type PlacedIdiom = {
  idiom: string;
  meaning: string;
  direction: Direction;
  start_row: number;
  start_col: number;
};

export type Puzzle = {
  /** 展示网格：空格为 ''，非填字格为 null */
  grid: (string | null)[][];
  /** 答案网格 */
  solution: (string | null)[][];
  blanks: { row: number; col: number; answer: string }[];
  idioms: {
    idiom: string;
    direction: Direction;
    start_row: number;
    start_col: number;
    meaning: string;
    length: number;
  }[];
};

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function sample<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

export class CrosswordGenerator {
  private idiomsDatabase: IdiomEntry[];
  gridSize: number;

  constructor(idiomsDatabase: IdiomEntry[], gridSize = 15) {
    this.idiomsDatabase = idiomsDatabase;
    this.gridSize = gridSize;
  }

  generate(numIdioms = 5, retryCount = 0): Puzzle {
    const grid: (string | null)[][] = Array.from({ length: this.gridSize }, () =>
      Array<string | null>(this.gridSize).fill(null),
    );
    const placedIdioms: PlacedIdiom[] = [];

    const available = shuffle(this.idiomsDatabase);

    let attempts = 0;
    const maxAttempts = 1000;

    while (placedIdioms.length < numIdioms && attempts < maxAttempts && available.length > 0) {
      attempts += 1;
      const idiomData = available.shift()!;

      if (placedIdioms.length === 0) {
        const placed = this.placeFirst(grid, idiomData.idiom, idiomData.meaning);
        if (placed) placedIdioms.push(placed);
      } else {
        const placed = this.placeCrossing(grid, placedIdioms, idiomData.idiom, idiomData.meaning);
        if (placed) placedIdioms.push(placed);
      }
    }

    const minRequired = Math.max(3, Math.floor(numIdioms / 2));
    if (placedIdioms.length < minRequired && retryCount < 20) {
      return this.generate(numIdioms, retryCount + 1);
    }

    return this.buildResult(grid, placedIdioms);
  }

  private placeFirst(grid: (string | null)[][], idiom: string, meaning: string): PlacedIdiom | null {
    const row = Math.floor(this.gridSize / 2);
    const col = Math.floor((this.gridSize - idiom.length) / 2);

    for (let i = 0; i < idiom.length; i++) {
      grid[row][col + i] = idiom[i];
    }

    return { idiom, meaning, direction: 'horizontal', start_row: row, start_col: col };
  }

  private placeCrossing(
    grid: (string | null)[][],
    placed: PlacedIdiom[],
    idiom: string,
    meaning: string,
  ): PlacedIdiom | null {
    for (const existing of placed) {
      for (let ei = 0; ei < existing.idiom.length; ei++) {
        for (let ni = 0; ni < idiom.length; ni++) {
          if (existing.idiom[ei] !== idiom[ni]) continue;

          let crossRow: number;
          let crossCol: number;
          let newRow: number;
          let newCol: number;
          let newDir: Direction;

          if (existing.direction === 'horizontal') {
            crossRow = existing.start_row;
            crossCol = existing.start_col + ei;
            newRow = crossRow - ni;
            newCol = crossCol;
            newDir = 'vertical';
          } else {
            crossRow = existing.start_row + ei;
            crossCol = existing.start_col;
            newRow = crossRow;
            newCol = crossCol - ni;
            newDir = 'horizontal';
          }

          if (this.canPlace(grid, idiom, newRow, newCol, newDir, crossRow, crossCol)) {
            this.doPlace(grid, idiom, newRow, newCol, newDir);
            return { idiom, meaning, direction: newDir, start_row: newRow, start_col: newCol };
          }
        }
      }
    }

    return null;
  }

  private canPlace(
    grid: (string | null)[][],
    idiom: string,
    row: number,
    col: number,
    direction: Direction,
    crossRow: number,
    crossCol: number,
  ): boolean {
    const length = idiom.length;

    if (direction === 'horizontal') {
      if (col < 0 || col + length > this.gridSize || row < 0 || row >= this.gridSize) return false;
    } else {
      if (row < 0 || row + length > this.gridSize || col < 0 || col >= this.gridSize) return false;
    }

    for (let i = 0; i < length; i++) {
      const r = direction === 'horizontal' ? row : row + i;
      const c = direction === 'horizontal' ? col + i : col;
      const char = idiom[i];

      const cell = grid[r][c];
      const isCross = r === crossRow && c === crossCol;

      if (cell !== null) {
        if (cell !== char) return false;
        if (!isCross) return false;
        continue;
      }

      if (direction === 'horizontal') {
        if (r > 0 && grid[r - 1][c] !== null) {
          if (!this.isPartOfCrossingIdiom(r - 1, c, 'vertical', crossCol)) return false;
        }
        if (r < this.gridSize - 1 && grid[r + 1][c] !== null) {
          if (!this.isPartOfCrossingIdiom(r + 1, c, 'vertical', crossCol)) return false;
        }
      } else {
        if (c > 0 && grid[r][c - 1] !== null) {
          if (!this.isPartOfCrossingIdiom(r, c - 1, 'horizontal', crossRow)) return false;
        }
        if (c < this.gridSize - 1 && grid[r][c + 1] !== null) {
          if (!this.isPartOfCrossingIdiom(r, c + 1, 'horizontal', crossRow)) return false;
        }
      }
    }

    if (direction === 'horizontal') {
      if (col > 0 && grid[row][col - 1] !== null) return false;
      if (col + length < this.gridSize && grid[row][col + length] !== null) return false;
    } else {
      if (row > 0 && grid[row - 1][col] !== null) return false;
      if (row + length < this.gridSize && grid[row + length][col] !== null) return false;
    }

    return true;
  }

  private isPartOfCrossingIdiom(
    r: number,
    c: number,
    expectedDir: Direction,
    crossRowOrCol: number,
  ): boolean {
    return expectedDir === 'vertical' ? c === crossRowOrCol : r === crossRowOrCol;
  }

  private doPlace(
    grid: (string | null)[][],
    idiom: string,
    row: number,
    col: number,
    direction: Direction,
  ): void {
    for (let i = 0; i < idiom.length; i++) {
      if (direction === 'horizontal') grid[row][col + i] = idiom[i];
      else grid[row + i][col] = idiom[i];
    }
  }

  private buildResult(grid: (string | null)[][], placedIdioms: PlacedIdiom[]): Puzzle {
    let minRow = this.gridSize;
    let maxRow = 0;
    let minCol = this.gridSize;
    let maxCol = 0;

    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        if (grid[r][c] !== null) {
          if (r < minRow) minRow = r;
          if (r > maxRow) maxRow = r;
          if (c < minCol) minCol = c;
          if (c > maxCol) maxCol = c;
        }
      }
    }

    minRow = Math.max(0, minRow - 1);
    maxRow = Math.min(this.gridSize - 1, maxRow + 1);
    minCol = Math.max(0, minCol - 1);
    maxCol = Math.min(this.gridSize - 1, maxCol + 1);

    const blankSet = new Map<string, { row: number; col: number; answer: string }>();

    for (const info of placedIdioms) {
      const positions: { i: number; row: number; col: number }[] = [];
      for (let i = 0; i < info.idiom.length; i++) {
        const r = info.direction === 'horizontal' ? info.start_row : info.start_row + i;
        const c = info.direction === 'horizontal' ? info.start_col + i : info.start_col;
        const key = `${r}-${c}`;
        if (!blankSet.has(key)) positions.push({ i, row: r, col: c });
      }

      if (positions.length > 0) {
        const numBlanks = 1 + Math.floor(Math.random() * Math.min(2, positions.length));
        for (const p of sample(positions, numBlanks)) {
          blankSet.set(`${p.row}-${p.col}`, { row: p.row, col: p.col, answer: info.idiom[p.i] });
        }
      }
    }

    const displayGrid: (string | null)[][] = [];
    const solutionGrid: (string | null)[][] = [];

    for (let r = minRow; r <= maxRow; r++) {
      const displayRow: (string | null)[] = [];
      const solutionRow: (string | null)[] = [];
      for (let c = minCol; c <= maxCol; c++) {
        const cell = grid[r][c];
        solutionRow.push(cell);
        displayRow.push(blankSet.has(`${r}-${c}`) ? '' : cell);
      }
      displayGrid.push(displayRow);
      solutionGrid.push(solutionRow);
    }

    const blanks = Array.from(blankSet.values())
      .map((b) => ({ ...b, row: b.row - minRow, col: b.col - minCol }))
      .sort((a, b) => (a.row - b.row) || (a.col - b.col));

    const idioms = placedIdioms.map((p) => ({
      idiom: p.idiom,
      direction: p.direction,
      start_row: p.start_row - minRow,
      start_col: p.start_col - minCol,
      meaning: p.meaning,
      length: p.idiom.length,
    }));

    return { grid: displayGrid, solution: solutionGrid, blanks, idioms };
  }
}