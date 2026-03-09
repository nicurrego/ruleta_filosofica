'use client';
import { useRef, useEffect, useState } from 'react';
import { soundManager } from '../utils/sounds';

export type WheelEntry = {
  id: string;
  text: string;
  color: string;
};

export type ArrowDesignType = 'classic' | 'triangle' | 'pin' | 'hand' | 'star' | 'kibo' | 'custom';

interface WheelProps {
  entries: WheelEntry[];
  onSpinEnd: (winner: WheelEntry) => void;
  arrowDesign: ArrowDesignType;
  customArrowUrl?: string | null;
  centerText: string;
  disabled?: boolean;
  autoSpin?: boolean;
}

export default function Wheel({ entries, onSpinEnd, arrowDesign = 'classic', customArrowUrl, centerText, disabled = false, autoSpin = false }: WheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const currentRotation = useRef(0);
  const animationRef = useRef<number | null>(null);
  const prevIndexRef = useRef<number>(-1);

  useEffect(() => {
    drawWheel();
  }, [entries]);

  function drawWheel() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use device pixel ratio for sharper text
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Set actual size in memory (scaled to account for extra pixel density)
    if (canvas.width !== rect.width * dpr && rect.width > 0) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
    } else if (canvas.width === 0) { // Fallback if no rect width yet
        canvas.width = 600 * dpr;
        canvas.height = 600 * dpr;
        ctx.scale(dpr, dpr);
    }

    const width = canvas.width / dpr;
    const height = canvas.height / dpr;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    // Restore context if it was scaled previously and not reset properly (fallback measure)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    if (entries.length === 0) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.stroke();
      
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '24px Inter';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Add some entries!', 0, 0);
      ctx.restore();
      return;
    }

    const anglePerSegment = (2 * Math.PI) / entries.length;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(currentRotation.current);

    entries.forEach((entry, i) => {
      const startAngle = i * anglePerSegment;
      const endAngle = startAngle + anglePerSegment;
      
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();
      
      ctx.fillStyle = entry.color;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.stroke();

      ctx.save();
      ctx.rotate(startAngle + anglePerSegment / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      
      const fontSize = Math.max(12, Math.min(26, (radius * 0.9) / Math.max(1, entries.length * 0.25)));
      ctx.font = `600 ${fontSize}px Inter`;
      
      const maxTextWidth = radius * 0.75;
      let displayName = entry.text;
      if (ctx.measureText(displayName).width > maxTextWidth) {
        while (displayName.length > 0 && ctx.measureText(displayName + '...').width > maxTextWidth) {
          displayName = displayName.slice(0, -1);
        }
        displayName += '...';
      }
      
      // Shadow for text legibility
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 4;
      ctx.fillText(displayName, radius * 0.85, 0);
      ctx.restore();
    });
    
    
    // Do NOT draw center dot on canvas anymore. 
    // It's handled by HTML overlay .wheel-center-button for better text rendering and double tap capturing

    ctx.restore();
  }

  const [hearts, setHearts] = useState<{ id: number; top: string; left: string }[]>([]);
  const nextHeartKey = useRef(0);

  const triggerLikeAnimation = () => {
    // Typical double-tap effect: 2 hearts in slight offset
    const h1 = { id: nextHeartKey.current++, top: '50%', left: '50%' };
    const h2 = { id: nextHeartKey.current++, top: '52%', left: '48%' };
    
    setHearts(prev => [...prev, h1]);
    setTimeout(() => {
      setHearts(prev => [...prev, h2]);
    }, 150);

    // Clean up hearts after animation ends (1s)
    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== h1.id));
    }, 1000);
    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== h2.id));
    }, 1150);
  };

  const spin = () => {
    // block spin if already spinning or no entries
    if (isSpinning || entries.length === 0 || disabled) return;
    
    // Trigger tiktok like animation
    triggerLikeAnimation();

    // play starting sound and start cycle
    soundManager.playSpin();
    setIsSpinning(true);

    // Duration is set to match the wheel-spin.wav audio file (4.46 seconds)
    const spinDuration = 4460; 
    const spins = 10 + Math.random() * 5; // multiple full rotations
    const totalRotation = spins * 2 * Math.PI;
    const startRotation = currentRotation.current;
    
    const startTime = performance.now();

    const easeOutQuart = (x: number): number => {
      return 1 - Math.pow(1 - x, 4);
    };

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);
      
      const easeProgress = easeOutQuart(progress);
      currentRotation.current = startRotation + totalRotation * easeProgress;
      drawWheel();

      const segmentAngle = 2 * Math.PI / entries.length;
      const normalizedRotation = currentRotation.current % (2 * Math.PI);
      
      // Pointer is on the right (0 rad)
      let pointerAngle = (2 * Math.PI - normalizedRotation) % (2 * Math.PI);
      if (pointerAngle < 0) pointerAngle += 2 * Math.PI;
      const currentIndex = Math.floor(pointerAngle / segmentAngle);

      // Play tick when crossing segment boundary
      if (currentIndex !== prevIndexRef.current) {
        prevIndexRef.current = currentIndex;
        // Only tick when slowing down (last 40% of spin) to build tension
        if (progress > 0.6) {
          soundManager.playTick();
        }
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        soundManager.stopSpin();
        soundManager.playWin();
        onSpinEnd(entries[currentIndex]);
      }
    };

    // Make canvas sharp instantly on first render
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0) drawWheel();
    }

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (autoSpin && entries.length > 0 && !isSpinning && !disabled) {
      // Delay slightly for recording to start
      const timer = setTimeout(() => {
        spin();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [autoSpin, entries.length]);

  const spinRef = useRef(spin);
  useEffect(() => {
    spinRef.current = spin;
  }, [spin]);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (disabled) return;
      // Ignore click if clicking settings or something
      if ((e.target as HTMLElement).closest('button, a, input')) return;
      spinRef.current();
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [disabled]);

  // Re-draw on window resize to keep high res
  useEffect(() => {
    const handleResize = () => drawWheel();
    window.addEventListener('resize', handleResize);
    // Draw initial
    setTimeout(() => drawWheel(), 100);
    return () => window.removeEventListener('resize', handleResize);
  }, [entries]);

  return (
    <div className="canvas-container" onClick={spin} style={{ touchAction: 'none' }}>
      <div className={`pointer-wrapper design-${arrowDesign}`}>
        {arrowDesign === 'kibo' ? (
          <img src="/kibo_icon.png" alt="kibo pointer" className="custom-pointer kibo-pointer" />
        ) : arrowDesign === 'custom' && customArrowUrl ? (
          <img src={customArrowUrl} alt="custom pointer" className="custom-pointer" />
        ) : arrowDesign === 'pin' ? (
          <div className="pointer-pin" />
        ) : arrowDesign === 'triangle' ? (
          <div className="pointer-triangle" />
        ) : arrowDesign === 'hand' ? (
          <div className="pointer-hand">👈</div>
        ) : arrowDesign === 'star' ? (
          <div className="pointer-star">⭐</div>
        ) : (
          <div className="pointer" />
        )}
      </div>
      
      <div className={`wheel-center-button ${isSpinning ? 'spinning' : ''}`}>
        {centerText.split('\n').map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>

      {/* TikTok Like Animation Hearts */}
      {hearts.map(heart => (
        <div 
          key={heart.id} 
          className="tiktok-heart-container"
          style={{ top: heart.top, left: heart.left }}
        >
          <svg className="tiktok-heart" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
      ))}

      <canvas 
        ref={canvasRef} 
        style={{ width: '100%', height: '100%', cursor: isSpinning || entries.length === 0 ? 'default' : 'pointer', display: 'block' }}
      />
    </div>
  );
}
