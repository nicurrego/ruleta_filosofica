'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
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
  const [todayPhrase, setTodayPhrase] = useState<string>('');
  const [isWinnerExpanded, setIsWinnerExpanded] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isCountIncreased, setIsCountIncreased] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 1. Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/phrases');
        const data = await res.json();
        const rows = data.rows || [];
        setAllRows(rows);

        // Pre-identify today's phrase for the winner topic
        const potentialWinner = rows.find((r: any) => r.TEMA === topicId && r.USADA === 'FALSE');
        if (potentialWinner) {
          setTodayPhrase(potentialWinner.FRASE);
        }

        if (!forcePhase) {
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
    if (phase === 'candidate-reveal' && todayPhrase) {
      setRevealedPhrase(todayPhrase);
      // Mark as used in local state for immediate feedback
      const today = new Date().toISOString().split('T')[0];
      setAllRows(prev => prev.map(r =>
        (r.TEMA === topicId && r.FRASE === todayPhrase)
          ? { ...r, USADA: 'TRUE', FECHA_USADA: today }
          : r
      ));
    }
  }, [phase, topicId, todayPhrase]);

  // Handle Automatic Scroll Effect for Monthly Overview
  useEffect(() => {
    if (phase === 'monthly-overview' && scrollContainerRef.current) {
      const container = scrollContainerRef.current;

      // Transition whoosh sound
      soundManager.playAirWhoosh();

      // Force start at bottom instantly
      container.scrollTop = container.scrollHeight + 1000; // Extra buffer to ensure bottom

      const duration = 2200; // Matched to the swoop sound length
      const delay = 1500; // Slight pause after entrance to show bottom content

      const timer = setTimeout(() => {
        const startPos = container.scrollTop;
        const startTime = performance.now();

        // Play the specific scroll swoosh
        soundManager.playScrollSwoosh();

        const animate = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);

          // Quintic ease-in-out: Starts slow, gets fast in middle, slows down at end
          const easing = progress < 0.5
            ? 16 * progress * progress * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 9) / 2;

          container.scrollTop = startPos * (1 - easing);

          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };
        requestAnimationFrame(animate);

        // Trigger winner expansion sound and layout change near the end of the scroll
        const expansionTimer = setTimeout(() => {
          setIsWinnerExpanded(true);
          soundManager.playWinnerExpansion();
        }, duration * 0.7);

        return () => clearTimeout(expansionTimer);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Handle Highlight Sequence after Winner Expansion
  useEffect(() => {
    if (isWinnerExpanded && phase === 'monthly-overview') {
      const winnerStats = getTopicMonthStats(topicId);
      const oldCount = winnerStats.used;
      
      // Sequence start
      const startTimer = setTimeout(() => {
        // 1. First, animate the count increase
        setIsCountIncreased(true);
        soundManager.playTick(); // Small pop sound for the count
        
        // 2. Wait for count animation to settle
        setTimeout(() => {
          let current = 0;
          const interval = setInterval(() => {
            // Highlight existing (already revealed) phrases
            if (current < oldCount) {
              setHighlightedIndex(current);
              soundManager.playTick();
              current++;
            } 
            // Finally highlight and unblur TODAY'S phrase
            else if (current === oldCount) {
              setHighlightedIndex(current);
              soundManager.playTransition();
              clearInterval(interval);
              
              // Auto-advance to next phase after a longer pause on the unblurred phrase
              setTimeout(() => {
                setPhase('candidate-reveal');
              }, 2500);
            }
          }, 450);
        }, 800);
      }, 1000);

      return () => clearTimeout(startTimer);
    }
  }, [isWinnerExpanded]);

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

  const injectEmojis = (text: string, tId: string) => {
    if (!text) return '';
    let result = text;
    
    const mapping: Record<string, Record<string, string>> = {
      'TIEMPO': { 'tiempo': '⏳', 'reloj': '⏰', 'vida': '🌳', 'días': '📅', 'momento': '✨' },
      'DINERO': { 'dinero': '💰', 'riqueza': '💎', 'rico': '💸', 'oro': '🥇', 'pobre': '🏚️' },
      'AMOR': { 'amor': '❤️', 'corazón': '💖', 'querer': '💌', 'amar': '💑', 'sentir': '✨' },
      'ANSIEDAD': { 'ansiedad': '🌀', 'calma': '🧘', 'miedo': '😨', 'paz': '🕊️', 'mente': '🧠' },
      'SALUD': { 'salud': '🍎', 'cuerpo': '💪', 'enfermedad': '🏥', 'alma': '✨', 'medicina': '💊' },
      'ÉXITO': { 'éxito': '🏆', 'triunfo': '👑', 'cima': '🏔️', 'logro': '🎯', 'ganar': '🥇' },
      'FELICIDAD': { 'felicidad': '😊', 'alegría': '🌟', 'sonrisa': '✨', 'feliz': '😄', 'gozo': '🌈' },
      'SOLEDAD': { 'soledad': '👤', 'silencio': '🤫', 'paz': '🕊️', 'solo': '🚶', 'universo': '🌌' }
    };

    const topicMap = mapping[tId] || {};
    // Sort keys by length descending to avoid partial matches (e.g., 'riqueza' before 'rico')
    Object.keys(topicMap).sort((a, b) => b.length - a.length).forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      result = result.replace(regex, topicMap[word]);
    });

    return result;
  };

  const truncatePhrase = (phrase: string, wordLimit = 6) => {
    if (!phrase) return '';
    const content = phrase.split(/[–—-]/)[0].trim();
    const words = content.split(/\s+/);
    let finalContent = content;
    if (words.length > wordLimit) {
      finalContent = words.slice(0, wordLimit).join(' ') + '...';
    }
    return finalContent;
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
      ref={scrollContainerRef}
      style={{
        maxWidth: '400px',
        width: '100%',
        padding: isScarcity ? '0 24px 100px' : '40px 24px 100px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        overflowY: isWinnerExpanded ? 'visible' : 'auto',
        overflowX: isWinnerExpanded ? 'visible' : 'hidden',
        height: '100%',
        scrollbarWidth: 'none',
        position: 'relative'
      }}
    >
      <h1
        className="main-title-gradient"
        style={{
          fontFamily: 'Outfit',
          fontWeight: 900,
          fontSize: '2rem',
          textTransform: 'uppercase',
          letterSpacing: '4px',
          textAlign: 'center',
          marginBottom: '10px'
        }}
      >
        Frases de {currentMonthName}
      </h1>

      <div
        style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}
      >
        {sortedTopics.map((topic) => {
          const stats = getTopicMonthStats(topic.id);
          const isWinner = topic.id === topicId;
          const showOtherTopics = !isWinnerExpanded || isScarcity;

          return (
            <motion.div
              key={topic.id}
              layout
              initial={false}
              animate={{
                opacity: (isWinner || showOtherTopics) ? 1 : 0,
                height: (isWinner || showOtherTopics) ? 'auto' : 0,
                marginBottom: (isWinner || showOtherTopics) ? 12 : 0,
                marginTop: (isWinner || showOtherTopics) ? 0 : 0,
                padding: (isWinner || showOtherTopics) ? 16 : 0,
                zIndex: (isWinner && isWinnerExpanded) ? 100 : 1,
                scale: (isWinner && isWinnerExpanded) ? 1.05 : 1,
                width: (isWinner && isWinnerExpanded) ? '112%' : '100%',
                x: (isWinner && isWinnerExpanded) ? '-6%' : '0%',
                boxShadow: (isWinner && isWinnerExpanded) 
                  ? `0 30px 60px rgba(0,0,0,0.6), 0 0 40px ${topic.color}40` 
                  : '0 0 0px rgba(0,0,0,0)',
                display: (isWinner || showOtherTopics) ? 'flex' : 'none'
              }}
              style={{
                flexDirection: 'column',
                gap: '10px',
                background: isWinner ? `${topic.color}15` : 'rgba(255,255,255,0.03)',
                border: isWinner ? `1px solid ${topic.color}50` : '1px solid rgba(255,255,255,0.05)',
                borderRadius: '24px',
                position: 'relative',
                overflow: (isWinner && isWinnerExpanded) ? 'visible' : 'hidden',
                // Make winner GROW tall
                minHeight: (isWinner && isWinnerExpanded) ? '60vh' : 'auto',
                justifyContent: (isWinner && isWinnerExpanded) ? 'center' : 'flex-start'
              }}
            >
              <motion.div layout style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: topic.color }} />
                  <span style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '0.9rem', color: 'white', letterSpacing: '1px' }}>
                    {topic.label}
                  </span>
                </div>
                <motion.div 
                  key={isCountIncreased ? 'new-count' : 'old-count'}
                  initial={{ scale: 1.2, color: topic.color }}
                  animate={{ scale: 1, color: isWinner ? topic.color : 'var(--text-muted)' }}
                  style={{ fontSize: '0.65rem', fontWeight: 900 }}
                >
                  {isWinner 
                    ? `${stats.used + (isCountIncreased ? 1 : 0)}/4 REVELADAS`
                    : stats.used === 4 ? 'COMPLETADO' : `${stats.used}/4 REVELADAS`
                  }
                </motion.div>
              </motion.div>

              <motion.div 
                layout
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: (isWinner && isWinnerExpanded) ? '1fr' : 'repeat(2, 1fr)', 
                  gap: '12px',
                  width: '100%'
                }}
              >
                {Array.from({ length: 4 }).map((_, slotIdx) => {
                  const isUsed = slotIdx < stats.used;
                  // The "today" slot is the one exactly at stats.used (e.g. if 0 used, slot 0 is today)
                  const isCurrentReveal = isWinner && slotIdx === stats.used && todayPhrase && !isScarcity;
                  const isUpcoming = slotIdx > stats.used;
                  const phrase = isUsed ? (stats.usedPhrases[slotIdx] || '') : (isCurrentReveal ? todayPhrase : '');
                  const author = (isUsed || isCurrentReveal) ? extractAuthor(phrase) : '';
                  const rawSummary = (isUsed || isCurrentReveal) ? truncatePhrase(phrase, 6) : '';
                  // Apply emojis ONLY to historical phrases (not today's reveal)
                  const summary = (isUsed && !isCurrentReveal) ? injectEmojis(rawSummary, topic.id) : rawSummary;
                  
                  const isHighlighted = isWinner && slotIdx === highlightedIndex;
                  const isFinalHighlight = isHighlighted && isCurrentReveal;
                  const isBlurred = isCurrentReveal && !isScarcity && (highlightedIndex < slotIdx);

                  return (
                    <motion.div
                      key={slotIdx}
                      layout
                      animate={{
                        borderColor: isFinalHighlight ? '#fbbf24' : isHighlighted ? '#10b981' : isCurrentReveal ? `${topic.color}80` : 'rgba(255,255,255,0.05)',
                        borderWidth: isFinalHighlight ? 4 : isHighlighted ? 3 : 1,
                        scale: isFinalHighlight ? [1, 1.15, 1.1] : isHighlighted ? 1.05 : 1,
                        boxShadow: isFinalHighlight 
                          ? '0 0 35px rgba(251, 191, 36, 0.5), inset 0 0 15px rgba(251, 191, 36, 0.2)' 
                          : isHighlighted ? '0 0 20px rgba(16, 185, 129, 0.3)' 
                          : 'none',
                      }}
                      transition={{
                        scale: isFinalHighlight ? { repeat: Infinity, duration: 0.6 } : { duration: 0.2 }
                      }}
                      style={{
                        minHeight: (isWinner && isWinnerExpanded) ? '80px' : '60px',
                        background: isFinalHighlight ? 'rgba(251, 191, 36, 0.1)' : isHighlighted ? 'rgba(16, 185, 129, 0.15)' : isCurrentReveal ? `${topic.color}25` : isUsed ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.02)',
                        borderRadius: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '12px 16px',
                        gap: '6px',
                        zIndex: isFinalHighlight ? 10 : 1
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {isUsed && !isCurrentReveal && <CheckCircle2 size={14} style={{ color: topic.color }} />}
                        {isCurrentReveal && <Sparkles size={14} style={{ color: topic.color }} />}
                        {isUpcoming && <Lock size={12} style={{ color: 'rgba(255,255,255,0.1)' }} />}
                        {isUsed && (
                          <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.4)', fontWeight: 900 }}>
                            {author.length > 15 ? author.substring(0, 14) + '..' : author}
                          </span>
                        )}
                      </div>

                      {isUsed && (
                        <motion.p 
                          initial={false}
                          animate={{
                            filter: isBlurred ? 'blur(8px)' : 'blur(0px)',
                            opacity: isBlurred ? 0.4 : 1,
                            scale: isBlurred ? 0.95 : 1
                          }}
                          style={{
                          fontSize: (isWinner && isWinnerExpanded) ? '0.75rem' : '0.6rem',
                          color: 'white',
                          lineHeight: '1.3',
                          textAlign: 'center',
                          margin: 0,
                          fontWeight: isCurrentReveal ? 700 : 400
                        }}>
                          {summary}
                        </motion.p>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );


  return (
    <div 
      className="phrase-screen-overlay" 
      style={{
        ...dynamicBackground,
        overflow: isWinnerExpanded ? 'visible' : 'hidden'
      }}
    >
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
            style={{ 
              width: '100%', 
              height: '100%', 
              overflow: isWinnerExpanded ? 'visible' : 'hidden',
              position: 'relative',
              zIndex: 10
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
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
