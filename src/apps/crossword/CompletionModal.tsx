export default function CompletionModal({
  onNewGame,
  onClose,
}: {
  onNewGame: () => void;
  onClose: () => void;
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon">🏆</div>
        <h2 className="modal-title">恭喜通关！</h2>
        <p className="modal-text">你已完成所有成语填词，真是博学多才！</p>
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={onNewGame}>
            再来一局
          </button>
          <button className="btn btn-outline" onClick={onClose}>
            查看答案
          </button>
        </div>
      </div>
    </div>
  );
}