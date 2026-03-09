import confetti from 'canvas-confetti';
import { useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';

export default function WinnerModal({ 
  winner, 
  onClose,
  onRemove
}: { 
  winner: string, 
  onClose: () => void,
  onRemove: () => void
}) {
  useEffect(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-container" onClick={e => e.stopPropagation()}>
        <h3>We have a winner!</h3>
        <div className="winner-name">{winner}</div>
        <div className="modal-actions">
          <button className="button button-danger" onClick={() => {
            onRemove();
            onClose();
          }}>
            <Trash2 size={18} /> Remove
          </button>
          <button className="button button-success" onClick={onClose}>
            <X size={18} /> Close
          </button>
        </div>
      </div>
    </div>
  );
}
