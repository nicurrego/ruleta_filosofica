'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Sparkles, Loader2, Lock, ChevronRight } from 'lucide-react';
import { ALL_TOPICS } from '../app/page';
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
  onClose?: () => void;
  forcePhase?: string;
}

type Phase = 'loading' | 'monthly-overview' | 'candidate-reveal' | 'scarcity' | 'cta';

export default function PhraseScreen({ topicId, topicColor, forcePhase }: PhraseScreenProps) {
  const [allRows, setAllRows] = useState<PhraseRow[]>([]);
  const [phase, setPhase] = useState<Phase>((forcePhase as Phase) || 'loading');
  const [revealedPhrase, setRevealedPhrase] = useState<string>('');

  // 1. Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/phrases');
        const data = await res.json();
        setAllRows(data.rows || []);

        if (!forcePhase) {
          // Normal flow
          setTimeout(() => setPhase('monthly-overview'), 1500);
        }
      } catch (err) {
        console.error('Failed to fetch phrases:', err);
      }
    }
    fetchData();
  }, [forcePhase]);

  // Sync phase with forcePhase if present
  useEffect(() => {
    if (forcePhase) {
      setPhase(forcePhase as Phase);
    }
  }, [forcePhase]);

  // Handle flow transitions (only if not forced)
  useEffect(() => {
    if (phase === 'candidate-reveal') {
      const winnerRows = allRows.filter(r => r.TEMA === topicId && r.USADA === 'FALSE');
      if (winnerRows.length > 0) {
        setRevealedPhrase(winnerRows[0].FRASE);
        // Mark as used in local state for immediate feedback
        const today = new Date().toISOString().split('T')[0];
        setAllRows(prev => prev.map(r => 
          (r.TEMA === topicId && r.FRASE === winnerRows[0].FRASE) 
            ? { ...r, USADA: 'TRUE', FECHA_USADA: today } 
            : r
        ));
      }
    }
  }, [phase, topicId, allRows]);

  const currentMonthName = new Date().toLocaleString('es-ES', { month: 'long' });
  const nextMonthName = new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleString('es-ES', { month: 'long' });
  const currentMonthPrefix = new Date().toISOString().substring(0, 7);
  const daysLeft = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate();

  const getTopicMonthStats = (tId: string) => {
    const topicRows = allRows.filter(r => r.TEMA === tId);
    const usedThisMonth = topicRows.filter(r => r.USADA === 'TRUE' && r.FECHA_USADA?.startsWith(currentMonthPrefix));
    return { 
      total: 4, 
      used: usedThisMonth.length, 
      usedPhrases: usedThisMonth.map(r => r.FRASE) 
    };
  };

  const extractAuthor = (phrase: string) => {
    if (!phrase) return '';
    const parts = phrase.split(/[–—-]/);
    if (parts.length > 1) {
      let author = parts[parts.length - 1].trim();
      if (author.endsWith('.')) author = author.slice(0, -1);
      return author;
    }
    return 'Anónimo';
  };

  const truncatePhrase = (phrase: string, wordLimit = 6) => {
    if (!phrase) return '';
    const content = phrase.split(/[–—-]/)[0].trim();
    const words = content.split(/\s+/);
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return content;
  };

  const winnerStats = getTopicMonthStats(topicId);
  const winnerTopic = ALL_TOPICS.find(t => t.id === topicId)!;

  const sortedTopics = useMemo(() => {
    return [...ALL_TOPICS].sort((a: any, b: any) => {
      if (a.id === topicId) return -1;
      if (b.id === topicId) return 1;
      return 0;
    });
  }, [topicId]);

  const dynamicBackground = {
    background: `
      radial-gradient(circle at 15% 15%, ${topicColor}55 0%, transparent 45%),
      radial-gradient(circle at 85% 85%, ${topicColor}44 0%, transparent 45%),
      radial-gradient(circle at 85% 15%, ${topicColor}33 0%, transparent 40%),
      radial-gradient(circle at 15% 85%, ${topicColor}22 0%, transparent 40%),
      #07060f
    `
  };

  const renderTopicList = (isScarcity = false) => (
    <div 
      className="phrase-content" 
      style={{ 
        maxWidth: '400px', 
        width: '100%', 
        padding: isScarcity ? '0 24px 100px' : '40px 24px 100px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '20px',
        overflowY: 'auto',
        height: '100%',
        scrollbarWidth: 'none',
        position: 'relative'
      }}
    >
      <motion.h1
        key="title"
        style={{ 
          fontFamily: 'Outfit', 
          fontWeight: 900, 
          fontSize: '2rem', 
          color: 'white', 
          textTransform: 'uppercase', 
          letterSpacing: '4px', 
          textAlign: 'center', 
          marginBottom: '10px' 
        }}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        Frases de {currentMonthName}
      </motion.h1>

      <motion.div
        key="list-container"
        style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { 
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.4 }
          }
        }}
      >
        {sortedTopics.map((topic) => {
          const stats = getTopicMonthStats(topic.id);
          const isWinner = topic.id === topicId;

          return (
            <motion.div 
              key={topic.id} 
              variants={{
                hidden: { y: -200, opacity: 0 },
                visible: { y: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 120 } }
              }}
              style={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: '10px',
                background: isWinner ? `${topic.color}15` : 'rgba(255,255,255,0.03)',
                border: isWinner ? `1px solid ${topic.color}50` : '1px solid rgba(255,255,255,0.05)',
                borderRadius: '20px',
                padding: '16px',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: topic.color }} />
                  <span style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '0.9rem', color: 'white', letterSpacing: '1px' }}>
                    {topic.label}
                  </span>
                </div>
                <div style={{ fontSize: '0.65rem', color: isWinner ? topic.color : 'var(--text-muted)', fontWeight: stats.used === 4 ? 900 : 600 }}>
                  {stats.used === 4 ? 'COMPLETADO' : `${stats.used}/4 REVELADAS`}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {Array.from({ length: 4 }).map((_, slotIdx) => {
                  const isUsed = slotIdx < stats.used;
                  const isCurrentReveal = isWinner && slotIdx === stats.used - 1 && revealedPhrase && !isScarcity;
                  const isUpcoming = slotIdx >= stats.used;
                  const phrase = isUsed ? (stats.usedPhrases[slotIdx] || revealedPhrase || '') : '';
                  const author = isUsed ? extractAuthor(phrase) : '';
                  const summary = isUsed ? truncatePhrase(phrase, 6) : '';

                  return (
                    <motion.div
                      key={slotIdx}
                      style={{
                        minHeight: '60px',
                        background: isCurrentReveal ? `${topic.color}25` : isUsed ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.02)',
                        border: isCurrentReveal ? `1px solid ${topic.color}80` : '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '10px 8px',
                        gap: '4px'
                      }}
                      animate={isCurrentReveal ? {
                        boxShadow: [`0 0 5px ${topic.color}20`, `0 0 15px ${topic.color}40`, `0 0 5px ${topic.color}20`],
                      } : {}}
                      transition={isCurrentReveal ? { repeat: Infinity, duration: 2 } : {}}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {isUsed && !isCurrentReveal && <CheckCircle2 size={12} style={{ color: topic.color }} />}
                        {isCurrentReveal && <Sparkles size={12} style={{ color: topic.color }} />}
                        {isUpcoming && <Lock size={10} style={{ color: 'rgba(255,255,255,0.1)' }} />}
                        {isUsed && (
                          <span style={{ fontSize: '0.45rem', color: 'rgba(255,255,255,0.4)', fontWeight: 900 }}>
                            {author.length > 10 ? author.substring(0, 9) + '..' : author}
                          </span>
                        )}
                      </div>
                      
                      {isUsed && (
                         <p style={{ 
                           fontSize: '0.6rem', 
                           color: 'white', 
                           lineHeight: '1.2',
                           textAlign: 'center',
                           margin: 0,
                           fontWeight: isCurrentReveal ? 700 : 400
                         }}>
                           {summary}
                         </p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );

  return (
    <div className="phrase-screen-overlay" style={dynamicBackground}>
      <AnimatePresence mode="wait">
        {phase === 'loading' && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}
          >
            <Loader2 className="animate-spin" size={48} color={topicColor} />
          </motion.div>
        )}

        {phase === 'monthly-overview' && (
          <motion.div
            key="overview"
            className="phase-container"
            style={{ width: '100%', height: '100%' }}
            initial={{ y: '-100vh', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100vh', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 150 }}
          >
            {renderTopicList(false)}
          </motion.div>
        )}

        {phase === 'candidate-reveal' && (
          <motion.div
            key="reveal"
            className="phase-container"
            style={{ width: '100%', height: '100%' }}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -50 }}
          >
            <div style={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '40px',
              textAlign: 'center'
            }}>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{ marginBottom: '20px' }}
              >
                <span style={{ 
                  background: topicColor, 
                  color: 'black', 
                  padding: '6px 16px', 
                  borderRadius: '20px', 
                  fontSize: '0.8rem', 
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '2px'
                }}>
                  Ganador: {winnerTopic.label}
                </span>
              </motion.div>

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', delay: 0.8 }}
                style={{ position: 'relative' }}
              >
                <div style={{ position: 'absolute', inset: -40, background: `radial-gradient(circle, ${topicColor}30 0%, transparent 70%)`, filter: 'blur(30px)', zIndex: -1 }} />
                <Sparkles style={{ position: 'absolute', top: -30, right: -30, color: topicColor }} />
                
                <p style={{ 
                  fontFamily: 'Outfit', 
                  fontWeight: 700, 
                  fontSize: '1.8rem', 
                  lineHeight: 1.3, 
                  color: 'white' 
                }}>
                  "{revealedPhrase.split(/[–—-]/)[0].trim()}"
                </p>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  style={{ marginTop: '20px', color: topicColor, fontSize: '1.1rem', fontWeight: 600 }}
                >
                  — {extractAuthor(revealedPhrase)}
                </motion.p>
              </motion.div>

              <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 2.5 }}
                 style={{ marginTop: '40px' }}
              >
                <ChevronRight size={32} color="white" className="animate-bounce" />
              </motion.div>
            </div>
          </motion.div>
        )}

        {phase === 'scarcity' && (
          <motion.div
            key="scarcity"
            className="phase-container"
            style={{ width: '100%', height: '100%' }}
            initial={{ y: '-100vh' }}
            animate={{ y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
          >
            {renderTopicList(true)}
          </motion.div>
        )}

        {phase === 'cta' && (
          <motion.div
            key="cta"
            className="phase-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              position: 'relative'
            }}
          >
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1 }} />
            <motion.div
              style={{
                position: 'absolute',
                width: '400px',
                height: '400px',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${topicColor}30 0%, transparent 70%)`,
                filter: 'blur(80px)',
                zIndex: 0
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
                    fontSize: '2rem',
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
                    fontSize: '1.2rem',
                    lineHeight: 1.6,
                    marginBottom: '24px',
                  }}>
                    Las 4 frases de este mes ya fueron reveladas.
                  </p>
                  <motion.p
                    style={{
                      color: topicColor,
                      fontSize: '1.4rem',
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
                    fontSize: '2rem',
                    color: 'white',
                    lineHeight: 1.3,
                    marginBottom: '16px',
                  }}>
                    Faltan <span style={{ color: topicColor }}>{daysLeft} días</span>
                  </h2>
                  <p style={{
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: '1.1rem',
                    lineHeight: 1.6,
                    marginBottom: '24px',
                  }}>
                    Quedan <span style={{ color: topicColor, fontWeight: 900 }}>{4 - winnerStats.used} frases</span> ocultas de {winnerTopic.label} este mes.
                  </p>
                  <motion.p
                    style={{
                      color: topicColor,
                      fontSize: '1.5rem',
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
