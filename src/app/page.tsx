'use client';
import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Wheel, { WheelEntry, ArrowDesignType, WheelRef } from '../components/Wheel';
import PhraseScreen from '../components/PhraseScreen';
import WinnerModal from '../components/WinnerModal';
import { Settings, Database, Play, RotateCcw, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { soundManager } from '../utils/sounds';

export const ALL_TOPICS = [
  { id: 'DINERO', color: '#00ffa3', label: 'DINERO' },
  { id: 'AMOR', color: '#ff004c', label: 'AMOR' },
  { id: 'ANSIEDAD', color: '#7a5fff', label: 'ANSIEDAD' },
  { id: 'SALUD', color: '#00d1ff', label: 'SALUD' },
  { id: 'EXITO', color: '#ffbd00', label: 'ÉXITO' },
  { id: 'FELICIDAD', color: '#ff5c00', label: 'FELICIDAD' },
  { id: 'TIEMPO', color: '#94a3b8', label: 'TIEMPO' },
  { id: 'SOLEDAD', color: '#c026d3', label: 'SOLEDAD' }
];

const BASE_TOPICS = ALL_TOPICS;

const PREVIEW_PHASES = [
  'intro',
  'wheel',
  'monthly-overview',
  'candidate-reveal',
  'scarcity',
  'cta'
] as const;

type PreviewPhase = typeof PREVIEW_PHASES[number];

function HomeContent() {
  const searchParams = useSearchParams();
  const isBotMode = searchParams.get('bot') === 'true';

  const [entries, setEntries] = useState<WheelEntry[]>([]);
  const [winner, setWinner] = useState<WheelEntry | null>(null);
  const [phraseScreenWinner, setPhraseScreenWinner] = useState<WheelEntry | null>(null);
  const [previewPhase, setPreviewPhase] = useState<PreviewPhase>('intro');
  const wheelRef = useRef<WheelRef>(null);
  
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

  // Trigger sounds on phase changes
  useEffect(() => {
    if (previewPhase === 'intro') {
      soundManager.playIntroNotification();
    } else if (previewPhase === 'wheel') {
      soundManager.playWheelAppears();
    }
  }, [previewPhase]);

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
  };

  return (
    <div className="app-container">
      {/* 1. LEFT PANE: THE VIDEO STAGE (ZONA SEGURA) */}
      <div className="recording-pane" style={{ background: previewPhase === 'intro' ? '#000' : 'var(--bg-dark)' }}>
        <AnimatePresence mode="wait">
          {previewPhase === 'intro' ? (
            <motion.div 
              key="intro" 
              className="recording-safe-area"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}
            >
              <motion.h1
                style={{
                  fontFamily: 'Outfit',
                  fontWeight: 900,
                  fontSize: '3.5rem',
                  color: 'white',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  letterSpacing: '4px',
                  margin: 0,
                  lineHeight: 1.1
                }}
                layoutId="main-title"
              >
                Ruleta<br/>Filosófica
              </motion.h1>
            </motion.div>
          ) : (previewPhase === 'wheel') ? (
            <motion.div 
              key="wheel-screen" 
              className="recording-safe-area"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}
            >
              <header className="header" style={{ paddingTop: '100px', background: 'transparent' }}>
                <motion.h1 layoutId="main-title" style={{ fontSize: '2.2rem', textTransform: 'uppercase', letterSpacing: '4px', fontWeight: 900 }}>
                  Ruleta Filosófica
                </motion.h1>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                  ¿Cuál será el Tema de hoy?
                </motion.p>
              </header>
              
              <main className="main-content">
                <div className="wheel-section">
                  <Wheel 
                    ref={wheelRef} 
                    entries={entries} 
                    onSpinEnd={handleSpinEnd} 
                    arrowDesign={arrowDesign}
                    customArrowUrl={customArrowUrl}
                    centerText=""
                    disabled={!!winner || !!phraseScreenWinner || entries.length === 0}
                    autoSpin={isBotMode}
                  />
                </div>
              </main>

              <AnimatePresence>
                {(winner && previewPhase === 'wheel') && (
                  <WinnerModal 
                    key="winner-modal"
                    winner={winner.text} 
                    winnerColor={winner.color} 
                  />
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div 
              key="phrase-screen-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ width: '100%', height: '100%' }}
            >
              <PhraseScreen 
                key={phraseScreenWinner?.id || previewPhase}
                topicId={phraseScreenWinner?.id || winner?.id || (previewPhase === 'monthly-overview' ? 'DINERO' : previewPhase === 'scarcity' ? 'ANSIEDAD' : 'EXITO')} 
                topicColor={phraseScreenWinner?.color || winner?.color || (previewPhase === 'monthly-overview' ? '#00ffa3' : previewPhase === 'scarcity' ? '#7a5fff' : '#ffbd00')} 
                onClose={() => { setPhraseScreenWinner(null); setWinner(null); setPreviewPhase('wheel'); }}
                forcePhase={previewPhase && !['intro', 'wheel'].includes(previewPhase) ? (previewPhase as any) : undefined}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. RIGHT PANE: DEV CONTROLS & SETTINGS */}
      <div className="dev-pane">
        <div className="dev-header">
          <h2>Panel de Control</h2>
        </div>

        <div className="dev-section">
          <h3>Control de Pantalla</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <button 
              className="button button-secondary"
              onClick={() => {
                const idx = PREVIEW_PHASES.indexOf(previewPhase);
                const prevIdx = (idx - 1 + PREVIEW_PHASES.length) % PREVIEW_PHASES.length;
                setPreviewPhase(PREVIEW_PHASES[prevIdx]);
              }}
            >
              ← Anterior
            </button>
            <button 
              className="button button-primary"
              onClick={() => {
                const isWheelPhase = previewPhase === 'wheel';
                const hasWinner = !!winner;
                
                if (isWheelPhase && !hasWinner) {
                  wheelRef.current?.spin();
                } else {
                  const idx = PREVIEW_PHASES.indexOf(previewPhase);
                  const nextIdx = (idx + 1) % PREVIEW_PHASES.length;
                  setPreviewPhase(PREVIEW_PHASES[nextIdx]);
                }
              }}
            >
              {(previewPhase === 'wheel' && !winner) ? 'Siguiente (GIRAR) →' : 'Siguiente →'}
            </button>
          </div>
          <button 
            className="button button-secondary" 
            style={{ width: '100%', color: '#ef4444' }}
            onClick={() => {
              setPreviewPhase('intro');
              setWinner(null);
              setPhraseScreenWinner(null);
            }}
          >
            <RotateCcw size={16} /> REINICIAR TODO
          </button>
          
          <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '0.8rem', opacity: 0.6, fontWeight: 900, textTransform: 'uppercase' }}>
            Fase Actual: {previewPhase}
          </div>
        </div>

        <div className="dev-section">
          <h3>Grabación</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ fontSize: '0.8rem', opacity: 0.8, textAlign: 'center' }}>
               El botón <b>Siguiente</b> actúa como disparador de la ruleta cuando estás en la fase de Wheel.
            </p>
            
            {phraseScreenWinner && (
              <button 
                className="button button-secondary"
                style={{ width: '100%', borderColor: phraseScreenWinner.color }}
                onClick={() => {
                  soundManager.playTransition();
                  setPhraseScreenWinner(null);
                  setPreviewPhase('wheel');
                }}
              >
                <RotateCcw size={20} /> VOLVER A LA RULETA
              </button>
            )}
          </div>
        </div>

        <div className="dev-section">
          <h3>Gestión</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href="/phrases" className="icon-action-button" title="Phrase Database">
              <Database size={20} /> Base de Datos
            </Link>
            <button 
              className="icon-action-button" 
              style={{ color: '#ef4444' }}
              onClick={async () => {
                if (confirm('¿Estás seguro de que quieres REINICIAR TODAS las frases de la base de datos?')) {
                  try {
                    const res = await fetch('/api/phrases', { method: 'PATCH' });
                    if (res.ok) alert('Base de datos reiniciada con éxito (Toda las frases están disponibles)');
                    else alert('Error al reiniciar la base de datos');
                  } catch (e) {
                    alert('Error de conexión');
                  }
                }
              }}
            >
              <RefreshCw size={20} /> Reset BD
            </button>
            <button 
              className={`icon-action-button ${isSettingsOpen ? 'success' : ''}`} 
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            >
              <Settings size={20} /> Ajustes
            </button>
          </div>
        </div>

        {isSettingsOpen && (
          <div className="dev-section slide-in">
            <h3>Configuración del Wheel</h3>
            <div className="settings-panel">
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
                  <span>Foto</span>
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
          </div>
        )}

        <div className="dev-section" style={{ marginTop: 'auto', opacity: 0.6 }}>
          <p style={{ fontSize: '0.8rem' }}>
            Grabación Optimizada: <b>ACTIVA</b><br/>
            Zona Segura Redes Sociales: <b>SÍ</b>
          </p>
        </div>
      </div>
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
