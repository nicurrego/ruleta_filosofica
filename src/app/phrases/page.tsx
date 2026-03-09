'use client';
import { useState, useEffect } from 'react';
import { ArrowLeft, Table2, ListOrdered, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';

const BASE_TOPICS = [
  { id: 'DINERO', color: '#10b981' }, 
  { id: 'AMOR', color: '#ef4444' }, 
  { id: 'ANSIEDAD', color: '#8b5cf6' }, 
  { id: 'SALUD', color: '#0ea5e9' }, 
  { id: 'EXITO', color: '#f59e0b' }, 
  { id: 'FELICIDAD', color: '#f43f5e' }, 
  { id: 'TIEMPO', color: '#64748b' }, 
  { id: 'SOLEDAD', color: '#0f172a' } 
];

const TOPIC_NAMES: Record<string, string> = {
  'DINERO': 'DINERO',
  'AMOR': 'AMOR',
  'ANSIEDAD': 'ANSIEDAD',
  'SALUD': 'SALUD',
  'EXITO': 'ÉXITO',
  'FELICIDAD': 'FELICIDAD',
  'TIEMPO': 'TIEMPO',
  'SOLEDAD': 'SOLEDAD'
};

type ViewMode = 'not_selected' | 'next_10';

interface PhraseRow {
  TEMA: string;
  FRASE: string;
  USADA: string;
  FECHA_USADA: string;
}

export default function PhrasesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('next_10');
  
  const [unusedPhrases, setUnusedPhrases] = useState<Record<string, string[]>>({});
  const [usedCount, setUsedCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
    let isMounted = true;

    async function loadData() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/phrases');
        const data = await res.json();
        
        if (data.rows && isMounted) {
          let usedTotal = 0;
          let totalAll = 0;
          const currentUnused: Record<string, string[]> = {};

          BASE_TOPICS.forEach(topic => {
            currentUnused[topic.id] = [];
          });

          for (const row of data.rows as PhraseRow[]) {
            const topic = row.TEMA;
            if (!currentUnused[topic]) continue;
            
            totalAll++;
            if (row.USADA === 'TRUE') {
              usedTotal++;
            } else {
              currentUnused[topic].push(row.FRASE);
            }
          }

          setUnusedPhrases(currentUnused);
          setUsedCount(usedTotal);
          setTotalCount(totalAll);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!isClient) return null;

  if (isLoading) {
    return (
      <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Loader2 className="animate-spin" size={48} color="white" />
      </div>
    );
  }

  const allDepleted = Object.values(unusedPhrases).every(list => list.length === 0);

  const maxRowsUnused = Math.max(...BASE_TOPICS.map(topic => (unusedPhrases[topic.id] || []).length));
  const rowCount = viewMode === 'next_10' ? Math.min(10, maxRowsUnused) : maxRowsUnused;

  return (
    <div className="app-container" style={{ maxWidth: '100%', padding: '20px', borderRadius: '0', display: 'flex', flexDirection: 'column' }}>
      
      <header className="phrases-dashboard-header glass-container" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link href="/">
            <button className="icon-action-button">
              <ArrowLeft size={20} /> <span style={{ fontFamily: 'Outfit' }}>Volver</span>
            </button>
          </Link>
          <div>
            <h1 className="main-title-gradient" style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '2rem' }}>
              Base de Datos
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>Tabla combinada ({totalCount} total)</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          <div className="stat-card" style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Usadas</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--success)' }}>{usedCount}</div>
          </div>
          <div className="stat-card" style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Restantes</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' }}>{totalCount - usedCount}</div>
          </div>
        </div>
      </header>

      <div className="tabs" style={{ display: 'flex', gap: '10px', marginBottom: '20px', maxWidth: '400px' }}>
        <button 
          className={`tab ${viewMode === 'next_10' ? 'active' : ''}`}
          onClick={() => setViewMode('next_10')}
          style={{ padding: '12px', fontSize: '1rem', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}
        >
          <ListOrdered size={18} /> Cola Próximas 10
        </button>
        <button 
          className={`tab ${viewMode === 'not_selected' ? 'active' : ''}`}
          onClick={() => setViewMode('not_selected')}
          style={{ padding: '12px', fontSize: '1rem', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}
        >
          <Table2 size={18} /> Todas las Restantes
        </button>
      </div>

      <div className="table-container glass-container" style={{ flex: 1, padding: 0, overflow: 'auto' }}>
        {allDepleted ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={48} style={{ margin: '0 auto 16px', color: 'var(--success)' }} />
            <h2 style={{ fontFamily: 'Outfit', fontSize: '2rem', color: 'white' }}>¡Todo usado!</h2>
            <p>Has utilizado todas las {totalCount} frases en la base de datos.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1200px', tableLayout: 'fixed' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
              <tr>
                {BASE_TOPICS.map(topic => {
                  const translatedTopic = TOPIC_NAMES[topic.id] || topic.id;
                  const available = (unusedPhrases[topic.id] || []).length;
                  
                  return (
                    <th key={topic.id} style={{ 
                      background: 'rgba(15, 10, 40, 0.95)', 
                      backdropFilter: 'blur(12px)',
                      padding: '16px', 
                      borderBottom: `2px solid ${topic.color}`,
                      textAlign: 'left',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: topic.color }}></div>
                        <span style={{ fontFamily: 'Outfit', fontWeight: 900, color: 'white', letterSpacing: '1px' }}>
                          {translatedTopic}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        {available} restantes
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rowCount }).map((_, rowIndex) => {
                const isNext = viewMode === 'next_10' && rowIndex === 0;
                
                return (
                  <tr key={rowIndex} style={{ 
                    background: isNext ? 'rgba(255,255,255,0.06)' : (rowIndex % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'),
                    transition: 'background 0.2s',
                  }}>
                    {BASE_TOPICS.map(topic => {
                      const topicList = unusedPhrases[topic.id] || [];
                      const phrase = topicList[rowIndex];
                      
                      return (
                        <td key={`${topic.id}-${rowIndex}`} style={{ 
                          padding: '16px', 
                          borderRight: '1px solid rgba(255,255,255,0.04)',
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                          verticalAlign: 'top',
                          position: 'relative'
                        }}>
                          {phrase ? (
                            <div style={{ position: 'relative' }}>
                              <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
                                {phrase}
                              </p>
                              {isNext && (
                                <span style={{ 
                                  display: 'inline-block',
                                  marginTop: '8px',
                                  background: topic.color, 
                                  color: '#000', 
                                  padding: '2px 6px', 
                                  borderRadius: '4px', 
                                  fontSize: '0.65rem', 
                                  fontWeight: 900 
                                }}>NEXT</span>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                              - Agotado -
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
