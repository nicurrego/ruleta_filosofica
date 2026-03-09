'use client';
import { useState } from 'react';
import Wheel from '../components/Wheel';
import WinnerModal from '../components/WinnerModal';
import { Shuffle } from 'lucide-react';

const DEFAULT_NAMES = [
  'Ali', 'Beatriz', 'Charles', 'Diya', 'Eric', 'Fatima', 'Gabriel', 'Hanna'
];

export default function Home() {
  const [namesText, setNamesText] = useState(DEFAULT_NAMES.join('\n'));
  const [winner, setWinner] = useState<string | null>(null);

  // Parse text into array of non-empty strings
  const names = namesText.split('\n').map(n => n.trim()).filter(n => n);

  const handleShuffle = () => {
    const shuffled = [...names].sort(() => Math.random() - 0.5);
    setNamesText(shuffled.join('\n'));
  };

  const handleRemoveWinner = () => {
    if (!winner) return;
    const newNames = names.filter(n => n !== winner);
    setNamesText(newNames.join('\n'));
    setWinner(null);
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>Spinner Wheel</h1>
        <p>A random choice generator</p>
      </header>
      
      <main className="main-content">
        <section className="wheel-section glass-container">
          <Wheel 
            names={names} 
            onSpinEnd={(w) => setWinner(w)} 
          />
        </section>

        <section className="sidebar-section glass-container">
          <div className="sidebar-header">
            <h2>Entries</h2>
            <div className="count-badge">{names.length}</div>
          </div>
          
          <textarea
            value={namesText}
            onChange={(e) => setNamesText(e.target.value)}
            placeholder={"Enter names here...\nOne name per line"}
            spellCheck={false}
          />
          
          <button 
            className="button button-primary"
            onClick={handleShuffle}
            disabled={names.length < 2}
          >
            <Shuffle size={18} /> Shuffle Names
          </button>
        </section>
      </main>

      {winner && (
        <WinnerModal 
          winner={winner} 
          onClose={() => setWinner(null)} 
          onRemove={handleRemoveWinner} 
        />
      )}
    </div>
  );
}
