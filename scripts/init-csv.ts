import fs from 'fs';
import path from 'path';
import { PHRASES_DATA } from '../src/utils/phrasesParsed';

const csvPath = path.join(process.cwd(), 'database.csv');

// We want to create: TEMA, FRASE, USADA, FECHA_USADA
let csvContent = 'TEMA,FRASE,USADA,FECHA_USADA\n';

for (const [tema, frases] of Object.entries(PHRASES_DATA)) {
  for (const frase of frases) {
    // Escape quotes in the phrase to valid CSV format
    const escapedFrase = frase.replace(/"/g, '""');
    csvContent += `"${tema}","${escapedFrase}",FALSE,\n`;
  }
}

fs.writeFileSync(csvPath, csvContent, 'utf-8');
console.log(`Generated database.csv successfully! Added ${csvContent.split('\n').length - 2} phrases.`);
