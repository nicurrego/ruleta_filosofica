'use client';
import { useRef, useEffect, useState } from 'react';

const COLORS = [
  '#f43f5e', '#f97316', '#eab308', '#22c55e', 
  '#0ea5e9', '#6366f1', '#a855f7', '#ec4899',
  '#ef4444', '#f59e0b', '#84cc16', '#10b981',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef'
];

export default function Wheel({ names, onSpinEnd }: { names: string[], onSpinEnd: (winner: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const currentRotation = useRef(0);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    drawWheel();
  }, [names]);

  const drawWheel = () => {
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

    if (names.length === 0) {
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
      ctx.fillText('Add some names!', 0, 0);
      ctx.restore();
      return;
    }

    const anglePerSegment = (2 * Math.PI) / names.length;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(currentRotation.current);

    names.forEach((name, i) => {
      const startAngle = i * anglePerSegment;
      const endAngle = startAngle + anglePerSegment;
      
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();
      
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.stroke();

      ctx.save();
      ctx.rotate(startAngle + anglePerSegment / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      
      const fontSize = Math.max(12, Math.min(26, (radius * 0.9) / Math.max(1, names.length * 0.25)));
      ctx.font = `600 ${fontSize}px Inter`;
      
      const maxTextWidth = radius * 0.75;
      let displayName = name;
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
    
    // Draw center dot
    ctx.beginPath();
    ctx.arc(0, 0, 25, 0, 2 * Math.PI);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 10;

    // Draw inner accent center dot
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    
    ctx.restore();
  };

  const spin = () => {
    if (isSpinning || names.length === 0) return;
    setIsSpinning(true);

    const spinDuration = 5000 + Math.random() * 2000;
    const spins = 10 + Math.random() * 10; // multiple full rotations
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

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const normalizedRotation = currentRotation.current % (2 * Math.PI);
        const segmentAngle = 2 * Math.PI / names.length;
        
        // Pointer is on the right (0 rad)
        let pointerAngle = (2 * Math.PI - normalizedRotation) % (2 * Math.PI);
        if (pointerAngle < 0) pointerAngle += 2 * Math.PI;
        
        const winnerIndex = Math.floor(pointerAngle / segmentAngle);
        onSpinEnd(names[winnerIndex]);
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

  // Re-draw on window resize to keep high res
  useEffect(() => {
    const handleResize = () => drawWheel();
    window.addEventListener('resize', handleResize);
    // Draw initial
    setTimeout(() => drawWheel(), 100);
    return () => window.removeEventListener('resize', handleResize);
  }, [names]);

  return (
    <div className="canvas-container" onClick={spin}>
      <div className="pointer" />
      <canvas 
        ref={canvasRef} 
        style={{ width: '100%', height: '100%', cursor: isSpinning || names.length === 0 ? 'default' : 'pointer', display: 'block' }}
      />
    </div>
  );
}
