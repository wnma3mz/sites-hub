type Difficulty = 'easy' | 'medium' | 'hard';

export default function GameControls({
  onNewGame,
  onGetHint,
  onRevealAll,
  loading,
  hasGame,
  correctCount,
  totalBlanks,
  difficulty,
  onDifficultyChange,
}: {
  onNewGame: () => void;
  onGetHint: () => void;
  onRevealAll: () => void;
  loading: boolean;
  hasGame: boolean;
  correctCount: number;
  totalBlanks: number;
  difficulty: Difficulty;
  onDifficultyChange: (d: Difficulty) => void;
}) {
  return (
    <div className="game-controls">
      <div className="controls-left">
        <div className="score-display">
          <div className="score-item">
            <span className="score-label">已完成</span>
            <span className="score-value">{correctCount}</span>
          </div>
          <div className="score-divider" />
          <div className="score-item">
            <span className="score-label">总空格</span>
            <span className="score-value">{totalBlanks}</span>
          </div>
        </div>
      </div>

      <div className="controls-right">
        <div className="count-selector">
          <label htmlFor="difficulty">游戏难度</label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => onDifficultyChange(e.target.value as Difficulty)}
          >
            <option value="easy">简单</option>
            <option value="medium">中等</option>
            <option value="hard">困难</option>
          </select>
        </div>

        <button className="btn btn-primary" onClick={onNewGame} disabled={loading}>
          {loading ? '生成中...' : '开始新游戏'}
        </button>

        {hasGame && (
          <>
            <button
              className="btn btn-secondary"
              onClick={onGetHint}
              disabled={loading || correctCount === totalBlanks}
            >
              💡 提示
            </button>

            <button className="btn btn-outline" onClick={onRevealAll} disabled={loading}>
              揭示答案
            </button>
          </>
        )}
      </div>
    </div>
  );
}