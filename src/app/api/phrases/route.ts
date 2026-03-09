import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const CSV_FILE = path.join(process.cwd(), 'database.csv');

export interface PhraseRow {
  TEMA: string;
  FRASE: string;
  USADA: string; // 'TRUE' or 'FALSE'
  FECHA_USADA: string;
}

export async function GET() {
  if (!fs.existsSync(CSV_FILE)) {
    return NextResponse.json({ error: 'Database not found' }, { status: 404 });
  }

  const csvText = fs.readFileSync(CSV_FILE, 'utf-8');
  
  const results = Papa.parse<PhraseRow>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  return NextResponse.json({ rows: results.data });
}

export async function POST(req: Request) {
  try {
    const { tema, frase } = await req.json();

    if (!fs.existsSync(CSV_FILE)) {
      return NextResponse.json({ error: 'Database not found' }, { status: 404 });
    }

    const csvText = fs.readFileSync(CSV_FILE, 'utf-8');
    const results = Papa.parse<PhraseRow>(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    let found = false;
    const today = new Date().toISOString().split('T')[0];

    for (let i = 0; i < results.data.length; i++) {
      if (results.data[i].TEMA === tema && results.data[i].FRASE === frase) {
        // Mark as used
        results.data[i].USADA = 'TRUE';
        results.data[i].FECHA_USADA = today;
        found = true;
        break;
      }
    }

    if (found) {
      const newCsv = Papa.unparse(results.data);
      fs.writeFileSync(CSV_FILE, newCsv, 'utf-8');
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Phrase not found' }, { status: 404 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH() {
  try {
    if (!fs.existsSync(CSV_FILE)) {
      return NextResponse.json({ error: 'Database not found' }, { status: 404 });
    }

    const csvText = fs.readFileSync(CSV_FILE, 'utf-8');
    const results = Papa.parse<PhraseRow>(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    // Reset all phrases
    const resetData = results.data.map(row => ({
      ...row,
      USADA: 'FALSE',
      FECHA_USADA: ''
    }));

    const newCsv = Papa.unparse(resetData);
    fs.writeFileSync(CSV_FILE, newCsv, 'utf-8');

    return NextResponse.json({ success: true, message: 'All phrases reset' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
