import confetti from 'canvas-confetti';
import { useEffect } from 'react';

export default function WinnerModal({ 
  winner, 
  winnerColor,
}: { 
  winner: string, 
  winnerColor: string,
}) {
  useEffect(() => {
    const duration = 2500;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: [winnerColor, '#ffffff', winnerColor, '#ffbd00']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: [winnerColor, '#ffffff', winnerColor, '#ffbd00']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, [winnerColor]);

  return (
    <div className="modal-overlay">
      {/* Immersive radial glow background */}
      <div 
        style={{ 
          position: 'absolute', 
          inset: 0, 
          background: `radial-gradient(circle at center, ${winnerColor}44 0%, transparent 65%)`,
          pointerEvents: 'none',
          zIndex: 0
        }} 
      />
      
      <div 
        className="modal-content glass-container" 
        onClick={e => e.stopPropagation()}
        style={{ zIndex: 1, borderColor: `${winnerColor}44` }}
      >
        <h3 style={{ fontSize: '0.8rem', letterSpacing: '4px', opacity: 0.8 }}>TEMA GANADOR</h3>
        <div 
          className="winner-name" 
          style={{ 
            backgroundImage: `linear-gradient(135deg, ${winnerColor}, #fff, ${winnerColor})`, 
            backgroundSize: '200% auto',
            fontSize: 'max(2.5rem, 8vw)',
            fontWeight: 900,
            animation: 'titleShimmer 3s linear infinite'
          }}
        >
          {winner}
        </div>
      </div>
    </div>
  );
}
