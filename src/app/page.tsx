'use client';
import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import Wheel, { WheelEntry, ArrowDesignType } from '../components/Wheel';
import PhraseScreen from '../components/PhraseScreen';
import WinnerModal from '../components/WinnerModal';
import { Settings, Database } from 'lucide-react';
import Link from 'next/link';
import { soundManager } from '../utils/sounds';

const BASE_TOPICS = [
  { id: 'DINERO', color: '#00ffa3' }, // Neon Emerald
  { id: 'AMOR', color: '#ff004c' },   // Electric Crimson
  { id: 'ANSIEDAD', color: '#7a5fff' }, // Hyper Purple
  { id: 'SALUD', color: '#00d1ff' },   // Sky Turquoise
  { id: 'EXITO', color: '#ffbd00' },   // Brilliant Gold
  { id: 'FELICIDAD', color: '#ff5c00' }, // Vibrant Orange
  { id: 'TIEMPO', color: '#94a3b8' },   // Sleek Chrome
  { id: 'SOLEDAD', color: '#c026d3' }    // Deep Fuchsia
];

function HomeContent() {
  const searchParams = useSearchParams();
  const isBotMode = searchParams.get('bot') === 'true';

  const [entries, setEntries] = useState<WheelEntry[]>([]);
  const [winner, setWinner] = useState<WheelEntry | null>(null);
  const [phraseScreenWinner, setPhraseScreenWinner] = useState<WheelEntry | null>(null);
  
  // Settings
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [arrowDesign, setArrowDesign] = useState<ArrowDesignType>('kibo');
  const [customArrowUrl, setCustomArrowUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTopics() {
      try {
        const res = await fetch('/api/phrases');
        const data = await res.json();
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        
        const countsThisMonth: Record<string, number> = {};
        if (data.rows) {
          for (const row of data.rows) {
            if (row.USADA === 'TRUE' && row.FECHA_USADA.startsWith(currentMonth)) {
              countsThisMonth[row.TEMA] = (countsThisMonth[row.TEMA] || 0) + 1;
            }
          }
        }
        
        // Filter out topics that have reached 4 this month
        const validEntries = BASE_TOPICS.filter(t => (countsThisMonth[t.id] || 0) < 4).map(topic => ({
          ...topic,
          text: topic.id === 'EXITO' ? 'ÉXITO' : topic.id
        }));
        
        setEntries(validEntries);
      } catch (err) {
        console.error(err);
        setEntries(BASE_TOPICS.map(topic => ({
          ...topic,
          text: topic.id === 'EXITO' ? 'ÉXITO' : topic.id
        })));
      }
    }
    fetchTopics();
  }, [phraseScreenWinner]); // re-fetch when closing phrase screen

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomArrowUrl(event.target?.result as string);
        setArrowDesign('custom');
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };


  const handleSpinEnd = (w: WheelEntry) => {
    setWinner(w);
    // Play dramatic whoosh for tension right after win
    soundManager.playDramaticWhoosh();
    // Display winner modal for 3 seconds, then transition to PhraseScreen
    setTimeout(() => {
      setWinner(null);
      // Play transition sound just before screen switches
      soundManager.playTransition();
      setPhraseScreenWinner(w);
    }, 3000);
  };

  return (
    <div className="app-container">
      <header className="header" style={{ position: 'relative' }}>
        
        <Link href="/phrases" className="icon-action-button" style={{ position: 'absolute', top: 20, right: 64 }} title="Phrase Database">
          <Database size={20} />
        </Link>
        <button className="icon-action-button settings-toggle-button" onClick={() => setIsSettingsOpen(!isSettingsOpen)} title="Wheel Settings">
          <Settings size={20} />
        </button>

        <h1>Ruleta Filosófica</h1>
        <p>¿Cuál será el Tema de hoy?</p>
      </header>
      
      <main className="main-content">
        <section className={`wheel-section glass-container ${isSettingsOpen ? 'shrink' : 'full'}`}>
          <Wheel 
            entries={entries} 
            onSpinEnd={handleSpinEnd} 
            arrowDesign={arrowDesign}
            customArrowUrl={customArrowUrl}
            centerText={isBotMode ? '' : '¡Doble Toque\npara girar!'}
            disabled={!!winner || !!phraseScreenWinner || isSettingsOpen || entries.length === 0}
            autoSpin={isBotMode}
          />
        </section>

        {isSettingsOpen && (
          <section className="sidebar-section glass-container slide-in">
             <div className="settings-panel">
              <h3>Diseño de Flecha</h3>
              <div className="design-grid">
                {(['classic', 'triangle', 'pin', 'hand', 'star', 'kibo'] as ArrowDesignType[]).map(type => (
                  <div 
                    key={type}
                    className={`design-card ${arrowDesign === type ? 'active' : ''}`}
                    onClick={() => setArrowDesign(type)}
                  >
                    <div className="design-preview">
                      {type === 'classic' && <div className="preview-classic" />}
                      {type === 'triangle' && <div className="preview-triangle" />}
                      {type === 'pin' && <div className="preview-pin" />}
                      {type === 'hand' && <div className="preview-hand">👈</div>}
                      {type === 'star' && <div className="preview-star">⭐</div>}
                      {type === 'kibo' && <img src="/kibo_icon.png" alt="kibo" width="40" />}
                    </div>
                    <span style={{ textTransform: 'capitalize' }}>{type}</span>
                  </div>
                ))}
                
                <div 
                    className={`design-card custom-upload ${arrowDesign === 'custom' ? 'active' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="design-preview">
                      {customArrowUrl ? (
                         <img src={customArrowUrl} alt="custom" />
                      ) : (
                        <div style={{ fontSize: '24px' }}>📷</div>
                      )}
                    </div>
                    <span>Foto Personalizada</span>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      style={{ display: 'none' }} 
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <AnimatePresence mode="wait">
        {winner && (
          <WinnerModal
             key="winner-modal"
             winner={winner.text}
             winnerColor={winner.color}
          />
        )}
        
        {phraseScreenWinner && (
          <PhraseScreen 
            key="phrase-screen"
            topicId={phraseScreenWinner.id}
            topicColor={phraseScreenWinner.color}
            onClose={() => setPhraseScreenWinner(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="loading">Cargando...</div>}>
      <HomeContent />
    </Suspense>
  );
}
