'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Sparkles, Loader2, Lock, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../utils/sounds';

interface PhraseRow {
  TEMA: string;
  FRASE: string;
  USADA: string;
  FECHA_USADA: string;
}

interface PhraseScreenProps {
  topicId: string;
  topicColor: string;
  onClose: () => void;
}

const ALL_TOPICS = [
  { id: 'DINERO', color: '#00ffa3', label: 'DINERO' },
  { id: 'AMOR', color: '#ff004c', label: 'AMOR' },
  { id: 'ANSIEDAD', color: '#7a5fff', label: 'ANSIEDAD' },
  { id: 'SALUD', color: '#00d1ff', label: 'SALUD' },
  { id: 'EXITO', color: '#ffbd00', label: 'ÉXITO' },
  { id: 'FELICIDAD', color: '#ff5c00', label: 'FELICIDAD' },
  { id: 'TIEMPO', color: '#94a3b8', label: 'TIEMPO' },
  { id: 'SOLEDAD', color: '#c026d3', label: 'SOLEDAD' },
];

type Phase = 'loading' | 'monthly-overview' | 'candidate-reveal' | 'scarcity' | 'cta';

export default function PhraseScreen({ topicId, topicColor, onClose }: PhraseScreenProps) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [allRows, setAllRows] = useState<PhraseRow[]>([]);
  const [revealedPhrase, setRevealedPhrase] = useState<string | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isCrossedOut, setIsCrossedOut] = useState(false);
  const hasAssigned = useRef(false);

  const date = new Date();
  const currentMonthPrefix = date.toISOString().slice(0, 7);
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const currentMonthName = monthNames[date.getMonth()];
  const nextMonthDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  const nextMonthName = monthNames[nextMonthDate.getMonth()];
  const nextMonthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const daysLeft = nextMonthEnd.getDate() - date.getDate();

  // Fetch data & assign phrase
  useEffect(() => {
    if (hasAssigned.current) return;
    hasAssigned.current = true;

    async function init() {
      try {
        const res = await fetch('/api/phrases');
        const data = await res.json();
        if (!data.rows) return;

        const rows: PhraseRow[] = data.rows;
        const topicRows = rows.filter(r => r.TEMA === topicId);
        const usedThisMonth = topicRows.filter(r => r.USADA === 'TRUE' && r.FECHA_USADA.startsWith(currentMonthPrefix));
        const unused = topicRows.filter(r => r.USADA !== 'TRUE');

        let phrase: string | null = null;
        if (usedThisMonth.length < 4 && unused.length > 0) {
          const idx = Math.floor(Math.random() * unused.length);
          phrase = unused[idx].FRASE;

          await fetch('/api/phrases', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tema: topicId, frase: phrase }),
          });

          const updatedRows = rows.map(r => {
            if (r.TEMA === topicId && r.FRASE === phrase) {
              return { ...r, USADA: 'TRUE', FECHA_USADA: date.toISOString().split('T')[0] };
            }
            return r;
          });
          setAllRows(updatedRows);
        } else {
          setAllRows(rows);
        }

        setRevealedPhrase(phrase);
        setPhase('monthly-overview');
      } catch (err) {
        console.error(err);
      }
    }
    init();
  }, [topicId]);

  // Auto-advance: monthly overview → candidate reveal
  useEffect(() => {
    if (phase === 'monthly-overview') {
      const timer = setTimeout(() => {
        soundManager.playTransition();
        setPhase('candidate-reveal');
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Candidate reveal animation sequence
  useEffect(() => {
    if (phase === 'candidate-reveal' && revealedPhrase && !isRevealing) {
      const t1 = setTimeout(() => setIsRevealing(true), 800);
      const t2 = setTimeout(() => {
        setIsRevealing(false);
        setIsCrossedOut(true);
      }, 5500);
      const t3 = setTimeout(() => {
        soundManager.playTransition();
        setPhase('scarcity');
      }, 7500);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
  }, [phase, revealedPhrase]);

  // Auto-advance: scarcity → CTA
  useEffect(() => {
    if (phase === 'scarcity') {
      const timer = setTimeout(() => {
        setPhase('cta');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const getTopicMonthStats = (tId: string) => {
    const topicRows = allRows.filter(r => r.TEMA === tId);
    const usedThisMonth = topicRows.filter(r => r.USADA === 'TRUE' && r.FECHA_USADA.startsWith(currentMonthPrefix));
    return { total: 4, used: usedThisMonth.length, usedPhrases: usedThisMonth.map(r => r.FRASE) };
  };

  const winnerStats = getTopicMonthStats(topicId);
  const winnerTopic = ALL_TOPICS.find(t => t.id === topicId)!;

  const dynamicBackground = {
    background: `
      radial-gradient(circle at 15% 15%, ${topicColor}55 0%, transparent 45%),
      radial-gradient(circle at 85% 85%, ${topicColor}44 0%, transparent 45%),
      radial-gradient(circle at 85% 15%, ${topicColor}33 0%, transparent 40%),
      radial-gradient(circle at 15% 85%, ${topicColor}22 0%, transparent 40%),
      #07060f
    `
  };

  // ── LOADING ──
  if (phase === 'loading') {
    return (
      <motion.div
        className="phrase-screen-overlay"
        style={dynamicBackground}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Loader2 className="animate-spin" size={48} color={topicColor} />
        </div>
      </motion.div>
    );
  }

  // ── SCREEN 2: MONTHLY OVERVIEW (All topics) ──
  if (phase === 'monthly-overview') {
    return (
      <motion.div
        className="phrase-screen-overlay"
        style={dynamicBackground}
        initial={{ x: '100vw', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '-100vw', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
      >

        <div className="phrase-content" style={{ maxWidth: '95vw', width: '100%', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
          <motion.h1
            style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: 'white', textTransform: 'uppercase', letterSpacing: '3px', textAlign: 'center' }}
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            Frases de {currentMonthName}
          </motion.h1>

          <motion.div
            style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '8px', width: '100%', maxWidth: '1200px' }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {ALL_TOPICS.map((topic) => {
              const stats = getTopicMonthStats(topic.id);
              const isWinner = topic.id === topicId;

              return (
                <div key={topic.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{
                    background: isWinner ? `${topic.color}30` : 'rgba(255,255,255,0.03)',
                    border: isWinner ? `2px solid ${topic.color}` : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    padding: '10px 6px',
                    textAlign: 'center',
                  }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: topic.color, margin: '0 auto 4px' }} />
                    <span style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 'clamp(0.5rem, 1.2vw, 0.8rem)', color: 'white', letterSpacing: '1px' }}>
                      {topic.label}
                    </span>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {stats.used}/4
                    </div>
                  </div>

                  {Array.from({ length: 4 }).map((_, slotIdx) => {
                    const isUsed = slotIdx < stats.used;
                    const isCurrentReveal = isWinner && slotIdx === stats.used - 1 && revealedPhrase;
                    const isUpcoming = slotIdx >= stats.used;

                    return (
                      <motion.div
                        key={slotIdx}
                        style={{
                          background: isCurrentReveal ? `${topic.color}20` : isUsed ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.02)',
                          border: isCurrentReveal ? `2px solid ${topic.color}` : '1px solid rgba(255,255,255,0.06)',
                          borderRadius: '8px',
                          padding: '10px 6px',
                          minHeight: '50px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          overflow: 'hidden',
                          boxShadow: isCurrentReveal ? `0 0 20px ${topic.color}40` : 'none',
                        }}
                        animate={isCurrentReveal ? {
                          boxShadow: [`0 0 20px ${topic.color}40`, `0 0 40px ${topic.color}80`, `0 0 20px ${topic.color}40`],
                        } : {}}
                        transition={isCurrentReveal ? { repeat: Infinity, duration: 2 } : {}}
                      >
                        {isUsed && !isCurrentReveal && (
                          <>
                            <CheckCircle2 size={12} style={{ color: topic.color, marginBottom: '4px' }} />
                            <div style={{ width: '80%', height: '4px', background: 'rgba(255,255,255,0.15)', marginBottom: '3px', borderRadius: '2px' }} />
                            <div style={{ width: '60%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }} />
                          </>
                        )}
                        {isCurrentReveal && (
                          <>
                            <Sparkles size={12} style={{ color: topic.color, marginBottom: '4px' }} />
                            <span style={{ fontSize: '0.55rem', fontWeight: 900, color: topic.color, letterSpacing: '1px' }}>AHORA</span>
                          </>
                        )}
                        {isUpcoming && (
                          <>
                            <div style={{ position: 'absolute', inset: 0, padding: '8px', filter: 'blur(3px)', opacity: 0.2, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                              <div style={{ width: '80%', height: '4px', background: 'white', marginBottom: '3px', borderRadius: '2px' }} />
                              <div style={{ width: '60%', height: '4px', background: 'white', borderRadius: '2px' }} />
                            </div>
                            <Lock size={10} style={{ color: 'var(--text-muted)', zIndex: 2 }} />
                          </>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              );
            })}
          </motion.div>

          <motion.div
            style={{ width: '100%', maxWidth: '600px', textAlign: 'center' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
              Revelando {winnerTopic.label}...
            </span>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // ── SCREEN 3: CANDIDATE REVEAL ──
  // Order: TOPIC → PHRASE (big, centered) → 4 candidate cards
  if (phase === 'candidate-reveal') {
    return (
      <motion.div
        className="phrase-screen-overlay"
        style={dynamicBackground}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >

        <div style={{ width: '100%', maxWidth: '800px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', zIndex: 1 }}>

          {/* 1. TOPIC NAME */}
          <motion.h1
            initial={{ y: -50, scale: 0.8, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            style={{ color: topicColor, fontFamily: 'Outfit', fontWeight: 900, fontSize: 'clamp(2.5rem, 7vw, 4rem)', textTransform: 'uppercase', textAlign: 'center', margin: 0 }}
          >
            {winnerTopic.label}
          </motion.h1>

          {/* 2. THE BIG PHRASE (centered, prominent) */}
          <AnimatePresence mode="wait">
            {isRevealing && revealedPhrase && (
              <motion.div
                key="big-phrase"
                initial={{ scale: 0.6, opacity: 0, y: 40 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: -20 }}
                transition={{ type: 'spring', bounce: 0.4, duration: 0.9 }}
                style={{
                  background: `${topicColor}12`,
                  border: `2px solid ${topicColor}`,
                  borderRadius: '20px',
                  padding: '40px 36px',
                  width: '100%',
                  maxWidth: '700px',
                  textAlign: 'center',
                  boxShadow: `0 0 100px ${topicColor}50, 0 24px 64px rgba(0,0,0,0.5)`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginBottom: '20px' }}>
                  <Sparkles size={18} style={{ color: topicColor }} />
                  <span style={{ color: topicColor, fontSize: '0.85rem', fontWeight: 900, letterSpacing: '3px' }}>FRASE REVELADA</span>
                  <Sparkles size={18} style={{ color: topicColor }} />
                </div>
                <h2 style={{ fontFamily: 'Outfit', fontSize: 'clamp(1.3rem, 3.5vw, 2rem)', color: 'white', fontWeight: 700, lineHeight: 1.6, overflow: 'hidden' }}>
                  {revealedPhrase.split(' ').map((word, wi) => (
                    <span
                      key={wi}
                      className="phrase-word"
                      style={{ animationDelay: `${0.3 + wi * 0.06}s`, marginRight: '0.3em' }}
                    >
                      {word}
                    </span>
                  ))}
                </h2>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 3. PHRASE CARDS (4 candidates) */}
          <motion.div
            style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '0 4px' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
              Frases de {currentMonthName}
            </span>
            <span style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '100px', fontWeight: 900, fontSize: '0.75rem' }}>
              {winnerStats.used} / 4 REVELADAS
            </span>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', width: '100%' }}>
            {Array.from({ length: 4 }).map((_, i) => {
              const isUsedPrev = i < winnerStats.used - (revealedPhrase ? 1 : 0);
              const isCurrentSlot = revealedPhrase && i === winnerStats.used - 1;
              const isUpcoming = i >= winnerStats.used;

              // Current slot (the one being revealed)
              if (isCurrentSlot) {
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    style={{
                      background: isCrossedOut ? 'rgba(255,255,255,0.03)' : `${topicColor}15`,
                      border: isCrossedOut ? '1px solid rgba(255,255,255,0.08)' : `2px solid ${topicColor}`,
                      borderRadius: '14px',
                      padding: '16px 10px',
                      minHeight: '120px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: isCrossedOut ? 'none' : `0 0 24px ${topicColor}40`,
                      transition: 'all 0.6s ease',
                    }}
                  >
                    {isCrossedOut ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center' }}>
                        <CheckCircle2 size={14} style={{ color: topicColor, marginBottom: '6px' }} />
                        <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through', textDecorationColor: topicColor, textDecorationThickness: '2px', lineHeight: 1.3 }}>
                          {revealedPhrase}
                        </p>
                      </motion.div>
                    ) : (
                      <>
                        <Sparkles size={14} style={{ color: topicColor, marginBottom: '6px' }} />
                        <span style={{ fontSize: '0.6rem', fontWeight: 900, color: topicColor, letterSpacing: '1px' }}>AHORA</span>
                        <div style={{ width: '80%', height: '5px', background: 'rgba(255,255,255,0.8)', marginTop: '8px', borderRadius: '3px' }} />
                        <div style={{ width: '60%', height: '5px', background: 'rgba(255,255,255,0.6)', marginTop: '5px', borderRadius: '3px' }} />
                      </>
                    )}
                  </motion.div>
                );
              }

              // Previously revealed
              if (isUsedPrev) {
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderTop: `3px solid ${topicColor}`,
                      borderRadius: '14px',
                      padding: '16px 10px',
                      minHeight: '120px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckCircle2 size={14} style={{ color: topicColor, marginBottom: '6px' }} />
                    <span style={{ fontSize: '0.6rem', fontWeight: 900, color: topicColor, letterSpacing: '1px', marginBottom: '8px' }}>REVELADA</span>
                    <div style={{ width: '80%', height: '5px', background: 'rgba(255,255,255,0.15)', marginBottom: '4px', borderRadius: '3px' }} />
                    <div style={{ width: '60%', height: '5px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }} />
                  </motion.div>
                );
              }

              // Upcoming / Mystery
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '14px',
                    padding: '16px 10px',
                    minHeight: '120px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ position: 'absolute', inset: 0, padding: '16px', filter: 'blur(4px)', opacity: 0.2, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ width: '80%', height: '5px', background: 'white', marginBottom: '4px', borderRadius: '3px' }} />
                    <div style={{ width: '60%', height: '5px', background: 'white', borderRadius: '3px' }} />
                  </div>
                  <Lock size={18} style={{ color: 'var(--text-muted)', zIndex: 2, marginBottom: '6px' }} />
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.6rem', fontWeight: 900, letterSpacing: '1px', zIndex: 2 }}>MISTERIO</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    );
  }

  // ── SCREEN 4: SCARCITY TABLE ──
  // Order: "FRASES DE [MES]" → TABLE → (auto-advance to CTA)
  if (phase === 'scarcity') {
    return (
      <motion.div
        className="phrase-screen-overlay"
        style={dynamicBackground}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >

        <header className="phrase-header" style={{ display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
          <button className="button-back" onClick={() => {
            soundManager.playTransition();
            onClose();
          }}>
            <ArrowLeft size={20} /> Volver
          </button>
        </header>

        <div className="phrase-content" style={{ maxWidth: '95vw', width: '100%', padding: '0 20px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>

          {/* Title */}
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: 'white', textTransform: 'uppercase', letterSpacing: '3px', textAlign: 'center' }}
          >
            Frases de {currentMonthName}
          </motion.h1>

          {/* Full monthly table — ALL topics */}
          <motion.div
            style={{ width: '100%', maxWidth: '1200px' }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '8px' }}>
              {ALL_TOPICS.map((topic) => {
                const stats = getTopicMonthStats(topic.id);
                const isWinner = topic.id === topicId;

                return (
                  <motion.div
                    key={topic.id}
                    style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
                    initial={isWinner ? { scale: 1.05 } : {}}
                    animate={isWinner ? { scale: [1.05, 1] } : {}}
                    transition={{ delay: 0.5, duration: 0.6 }}
                  >
                    <div style={{
                      background: isWinner ? `${topic.color}25` : 'rgba(255,255,255,0.03)',
                      border: isWinner ? `2px solid ${topic.color}` : '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '10px',
                      padding: '8px 4px',
                      textAlign: 'center',
                    }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: topic.color, margin: '0 auto 3px' }} />
                      <span style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 'clamp(0.45rem, 1vw, 0.75rem)', color: 'white', letterSpacing: '1px' }}>
                        {topic.label}
                      </span>
                      <div style={{ fontSize: '0.55rem', color: stats.used >= 4 ? '#ef4444' : 'var(--text-muted)', fontWeight: stats.used >= 4 ? 900 : 400, marginTop: '2px' }}>
                        {stats.used}/4 {stats.used >= 4 ? '🔒' : ''}
                      </div>
                    </div>

                    {Array.from({ length: 4 }).map((_, slotIdx) => {
                      const isUsed = slotIdx < stats.used;
                      const isUpcoming = slotIdx >= stats.used;

                      return (
                        <div
                          key={slotIdx}
                          style={{
                            background: isUsed ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '8px',
                            padding: '8px 6px',
                            minHeight: '40px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            overflow: 'hidden',
                          }}
                        >
                          {isUsed && (
                            <>
                              <CheckCircle2 size={10} style={{ color: topic.color, marginBottom: '2px' }} />
                              <div style={{ width: '75%', height: '3px', background: 'rgba(255,255,255,0.15)', marginBottom: '2px', borderRadius: '2px' }} />
                              <div style={{ width: '55%', height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }} />
                            </>
                          )}
                          {isUpcoming && (
                            <>
                              <div style={{ position: 'absolute', inset: 0, filter: 'blur(3px)', opacity: 0.15, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '6px' }}>
                                <div style={{ width: '75%', height: '3px', background: 'white', marginBottom: '2px', borderRadius: '2px' }} />
                                <div style={{ width: '55%', height: '3px', background: 'white', borderRadius: '2px' }} />
                              </div>
                              <Lock size={8} style={{ color: 'var(--text-muted)', zIndex: 2 }} />
                            </>
                          )}
                        </div>
                      );
                    })}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // ── SCREEN 5: CTA (Full-screen, black, impossible to miss) ──
  return (
    <motion.div
      className="phrase-screen-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        ...dynamicBackground,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      {/* Dark overlay for CTA visibility */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1 }} />
      {/* Subtle glow behind CTA */}
      <motion.div
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${topicColor}30 0%, transparent 70%)`,
          filter: 'blur(80px)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
      />

      <motion.div
        style={{
          zIndex: 2,
          textAlign: 'center',
          padding: '40px 32px',
          maxWidth: '600px',
          width: '90%',
        }}
        initial={{ scale: 0.8, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ delay: 0.3, type: 'spring', bounce: 0.4 }}
      >
        {winnerStats.used >= 4 ? (
          <>
            <motion.div
              style={{ fontSize: '4rem', marginBottom: '20px' }}
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              🔒
            </motion.div>
            <h2 style={{
              fontFamily: 'Outfit',
              fontWeight: 900,
              fontSize: 'clamp(1.8rem, 5vw, 3rem)',
              color: '#ef4444',
              textTransform: 'uppercase',
              letterSpacing: '3px',
              marginBottom: '16px',
              lineHeight: 1.2,
            }}>
              ¡{winnerTopic.label} agotado!
            </h2>
            <p style={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
              lineHeight: 1.6,
              marginBottom: '24px',
            }}>
              Las 4 frases de este mes ya fueron reveladas.
            </p>
            <motion.p
              style={{
                color: topicColor,
                fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
                fontFamily: 'Outfit',
                fontWeight: 900,
                letterSpacing: '1px',
              }}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              ¡Sígueme para {nextMonthName}! 🔥
            </motion.p>
          </>
        ) : (
          <>
            <motion.div
              style={{ fontSize: '3.5rem', marginBottom: '20px' }}
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
            >
              ⏳
            </motion.div>
            <h2 style={{
              fontFamily: 'Outfit',
              fontWeight: 900,
              fontSize: 'clamp(1.8rem, 5vw, 3rem)',
              color: 'white',
              lineHeight: 1.3,
              marginBottom: '16px',
            }}>
              Faltan <span style={{ color: topicColor }}>{daysLeft} días</span>
            </h2>
            <p style={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
              lineHeight: 1.6,
              marginBottom: '24px',
            }}>
              Quedan <span style={{ color: topicColor, fontWeight: 900 }}>{4 - winnerStats.used} frases</span> ocultas de {winnerTopic.label} este mes.
            </p>
            <motion.p
              style={{
                color: topicColor,
                fontSize: 'clamp(1.3rem, 3.5vw, 2rem)',
                fontFamily: 'Outfit',
                fontWeight: 900,
                letterSpacing: '2px',
                textTransform: 'uppercase',
              }}
              animate={{ opacity: [0.6, 1, 0.6], scale: [0.98, 1.02, 0.98] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              ¡Sígueme para no perdértelas! 🔥
            </motion.p>
          </>
        )}

        {/* Volver button */}
        <motion.button
          className="button-back"
          onClick={() => { soundManager.playTransition(); onClose(); }}
          style={{ marginTop: '40px', opacity: 0.5, fontSize: '0.85rem' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 2 }}
          whileHover={{ opacity: 1 }}
        >
          <ArrowLeft size={16} /> Volver a la Ruleta
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
