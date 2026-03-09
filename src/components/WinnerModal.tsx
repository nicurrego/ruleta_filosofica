import confetti from 'canvas-confetti';
import { useEffect, useRef } from 'react';

export default function WinnerModal({ 
  winner, 
  winnerColor,
}: { 
  winner: string, 
  winnerColor: string,
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Use a custom instance of confetti on our local canvas
    const myConfetti = confetti.create(canvasRef.current, {
      resize: true,
      useWorker: true
    });

    const duration = 2500;
    const end = Date.now() + duration;

    const frame = () => {
      myConfetti({
        particleCount: 8,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: [winnerColor, '#ffffff', '#ffbd00']
      });
      myConfetti({
        particleCount: 8,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: [winnerColor, '#ffffff', '#ffbd00']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    return () => {
      myConfetti.reset();
    };
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
        style={{ zIndex: 10, borderColor: `${winnerColor}44`, position: 'relative' }}
      >
        <h3 style={{ fontSize: '0.8rem', letterSpacing: '4px', opacity: 0.8 }}>TEMA GANADOR</h3>
        <div 
          className="winner-name" 
          style={{ 
            backgroundImage: `linear-gradient(135deg, ${winnerColor}, #fff, ${winnerColor})`, 
            backgroundSize: '200% auto',
            fontSize: 'clamp(1.5rem, 8vw, 2.8rem)',
            fontWeight: 900,
            animation: 'titleShimmer 3s linear infinite',
            wordBreak: 'keep-all',
            overflowWrap: 'normal',
            lineHeight: 1.1,
            textAlign: 'center',
            padding: '10px 0',
          }}
        >
          {winner}
        </div>
      </div>

      {/* Confetti Canvas - Localized to the recording pane and on top of everything */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 5
        }}
      />
    </div>
  );
}
