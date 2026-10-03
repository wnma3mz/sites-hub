import { useCallback, useRef, useState } from 'react';
import CrosswordGrid from './CrosswordGrid';
import GameControls from './GameControls';
import CluesList from './CluesList';
import CompletionModal from './CompletionModal';
import { CrosswordGenerator, type IdiomEntry, type Puzzle } from './generator';
import { ScopedStyle } from '../../components/ScopedStyle';
import baseCss from './base.css?inline';
import appCss from './app.css?inline';
import gridCss from './CrosswordGrid.css?inline';
import cluesCss from './CluesList.css?inline';
import controlsCss from './GameControls.css?inline';
import modalCss from './CompletionModal.css?inline';
import idiomsData from './idioms.json';

type Difficulty = 'easy' | 'medium' | 'hard';

const DIFFICULTY_MAP: Record<Difficulty, [number, number, number]> = {
  easy: [8, 12, 20],
  medium: [15, 22, 30],
  hard: [25, 35, 40],
};

const IDIOMS = idiomsData as IdiomEntry[];
const generator = new CrosswordGenerator(IDIOMS);

type CellStatus = 'empty' | 'given' | 'correct' | 'wrong' | 'hint' | 'revealed';

export default function CrosswordApp() {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [userGrid, setUserGrid] = useState<(string | null)[][]>([]);
  const [cellStatus, setCellStatus] = useState<(CellStatus | null)[][]>([]);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  const cellStatusRef = useRef(cellStatus);
  cellStatusRef.current = cellStatus;

  const puzzleRef = useRef(puzzle);
  puzzleRef.current = puzzle;

  const recount = useCallback((nextStatus: (CellStatus | null)[][], total: number) => {
    const p = puzzleRef.current;
    if (!p) return;
    let correct = 0;
    p.blanks.forEach((blank) => {
      const status = nextStatus[blank.row]?.[blank.col];
      if (status === 'correct' || status === 'hint') correct++;
    });
    setCorrectCount(correct);
    if (correct === total) setCompleted(true);
  }, []);

  const startNewGame = useCallback(() => {
    setLoading(true);
    setCompleted(false);
    setCorrectCount(0);
    setSelectedCell(null);

    try {
      const [minCount, maxCount, gridSize] = DIFFICULTY_MAP[difficulty];
      const count = minCount + Math.floor(Math.random() * (maxCount - minCount + 1));
      generator.gridSize = gridSize;
      const result = generator.generate(count);

      setPuzzle(result);
      setUserGrid(result.grid.map((row) => row.map((cell) => (cell === null ? null : cell))));
      setCellStatus(
        result.grid.map((row) =>
          row.map((cell) => (cell === null ? null : cell === '' ? 'empty' : 'given')),
        ),
      );
    } finally {
      setLoading(false);
    }
  }, [difficulty]);

  const handleCellChange = useCallback(
    (row: number, col: number, value: string) => {
      const p = puzzleRef.current;
      if (!p) return;

      setUserGrid((prev) => prev.map((r, ri) => r.map((c, ci) => (ri === row && ci === col ? value : c))));

      if (!value) {
        setCellStatus((prev) => {
          const next = prev.map((r, ri) =>
            r.map((c, ci) => (ri === row && ci === col ? 'empty' : c)),
          );
          cellStatusRef.current = next;
          return next;
        });
        return;
      }

      const answer = p.solution[row]?.[col];
      if (answer === null || answer === undefined) return;

      const status: CellStatus = value === answer ? 'correct' : 'wrong';
      setCellStatus((prev) => {
        const next = prev.map((r, ri) =>
          r.map((c, ci) => (ri === row && ci === col ? status : c)),
        );
        cellStatusRef.current = next;
        recount(next, p.blanks.length);
        return next;
      });
    },
    [recount],
  );

  const handleGetHint = useCallback(() => {
    const p = puzzleRef.current;
    if (!p) return;

    const current = cellStatusRef.current;
    const target = p.blanks.find((blank) => {
      const status = current[blank.row]?.[blank.col];
      return status === 'empty' || status === 'wrong';
    });
    if (!target) return;

    const answer = p.solution[target.row]?.[target.col] ?? '';
    setUserGrid((prev) =>
      prev.map((r, ri) => r.map((c, ci) => (ri === target.row && ci === target.col ? answer : c))),
    );
    setCellStatus((prev) => {
      const next = prev.map((r, ri) =>
        r.map((c, ci) => (ri === target.row && ci === target.col ? 'hint' : c)),
      );
      cellStatusRef.current = next;
      recount(next, p.blanks.length);
      return next;
    });
  }, [recount]);

  const handleRevealAll = useCallback(() => {
    const p = puzzleRef.current;
    if (!p) return;
    setUserGrid(p.solution);
    setCellStatus(p.solution.map((row) => row.map((cell) => (cell === null ? null : 'revealed'))));
    setCompleted(true);
    setCorrectCount(p.blanks.length);
  }, []);

  return (
    <>
      <ScopedStyle css={`${baseCss}\n${appCss}\n${gridCss}\n${cluesCss}\n${controlsCss}\n${modalCss}`} />
      <div className="app">
      <header className="header">
        <div className="header-decoration">
          <span className="header-line"></span>
          <span className="header-icon">◈</span>
          <span className="header-line"></span>
        </div>
        <h1 className="title">成语填词</h1>
        <p className="subtitle">交叉填字 · 博大精深</p>
      </header>

      <main className="main-content">
        <GameControls
          onNewGame={startNewGame}
          onGetHint={handleGetHint}
          onRevealAll={handleRevealAll}
          loading={loading}
          hasGame={!!puzzle}
          correctCount={correctCount}
          totalBlanks={puzzle?.blanks.length ?? 0}
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
        />

        <div className="game-area">
          {loading ? (
            <div className="loading">
              <div className="loading-icon">🀄</div>
              <div>正在生成谜题...</div>
            </div>
          ) : puzzle ? (
            <>
              <CrosswordGrid
                grid={userGrid}
                status={cellStatus}
                blanks={puzzle.blanks}
                idioms={puzzle.idioms}
                onCellChange={handleCellChange}
                selectedCell={selectedCell}
                onCellSelect={setSelectedCell}
              />
              <CluesList idioms={puzzle.idioms} />
            </>
          ) : (
            <div className="welcome">
              <div className="welcome-icon">🀄</div>
              <h2>欢迎来到成语填词游戏</h2>
              <p>点击「开始新游戏」挑战交叉填字谜题</p>
              <p className="welcome-hint">成语之间会共享汉字，像数独一样填写！</p>
              <p className="welcome-hint">成语库共 {IDIOMS.length} 条 · 全部在浏览器本地生成</p>
            </div>
          )}
        </div>
      </main>

      {completed && (
        <CompletionModal onNewGame={startNewGame} onClose={() => setCompleted(false)} />
      )}

        <footer className="footer">成语填词游戏 · 传承中华文化</footer>
      </div>
    </>
  );
}
