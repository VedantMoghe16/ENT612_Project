/**
 * Curated Indian textbook price database.
 * Covers the most common books a scrap dealer encounters.
 * Searched by keyword matching against title + publisher input.
 */

export interface BookRecord {
  /** Keywords that must ALL appear (substring) in the normalized input */
  must: string[];
  /** At least one of these must appear (optional reinforcement) */
  any?: string[];
  mrp: number;
  label: string;
}

// ─── Dataset ─────────────────────────────────────────────────────────────────
export const BOOK_DATABASE: BookRecord[] = [

  // ── NCERT ──────────────────────────────────────────────────────────────────
  { must: ['ncert', 'math'],         any: ['class 6', 'vi'],    mrp: 45,  label: 'NCERT Maths Class 6' },
  { must: ['ncert', 'math'],         any: ['class 7', 'vii'],   mrp: 50,  label: 'NCERT Maths Class 7' },
  { must: ['ncert', 'math'],         any: ['class 8', 'viii'],  mrp: 55,  label: 'NCERT Maths Class 8' },
  { must: ['ncert', 'math'],         any: ['class 9', 'ix'],    mrp: 60,  label: 'NCERT Maths Class 9' },
  { must: ['ncert', 'math'],         any: ['class 10', 'x'],    mrp: 65,  label: 'NCERT Maths Class 10' },
  { must: ['ncert', 'math'],         any: ['class 11', 'xi'],   mrp: 100, label: 'NCERT Maths Class 11' },
  { must: ['ncert', 'math'],         any: ['class 12', 'xii'],  mrp: 100, label: 'NCERT Maths Class 12' },

  { must: ['ncert', 'physics'],      any: ['class 11', 'xi'],   mrp: 85,  label: 'NCERT Physics Class 11' },
  { must: ['ncert', 'physics'],      any: ['class 12', 'xii'],  mrp: 85,  label: 'NCERT Physics Class 12' },
  { must: ['ncert', 'chemistry'],    any: ['class 11', 'xi'],   mrp: 80,  label: 'NCERT Chemistry Class 11' },
  { must: ['ncert', 'chemistry'],    any: ['class 12', 'xii'],  mrp: 80,  label: 'NCERT Chemistry Class 12' },
  { must: ['ncert', 'biology'],      any: ['class 11', 'xi'],   mrp: 85,  label: 'NCERT Biology Class 11' },
  { must: ['ncert', 'biology'],      any: ['class 12', 'xii'],  mrp: 80,  label: 'NCERT Biology Class 12' },
  { must: ['ncert', 'science'],      any: ['class 9', 'ix'],    mrp: 60,  label: 'NCERT Science Class 9' },
  { must: ['ncert', 'science'],      any: ['class 10', 'x'],    mrp: 60,  label: 'NCERT Science Class 10' },
  { must: ['ncert', 'history'],      any: ['class 12', 'xii'],  mrp: 75,  label: 'NCERT History Class 12' },
  { must: ['ncert', 'geography'],    any: ['class 12', 'xii'],  mrp: 75,  label: 'NCERT Geography Class 12' },
  { must: ['ncert', 'economics'],    any: ['class 12', 'xii'],  mrp: 75,  label: 'NCERT Economics Class 12' },
  { must: ['ncert', 'political'],                                mrp: 70,  label: 'NCERT Political Science' },
  { must: ['ncert', 'sociology'],                                mrp: 65,  label: 'NCERT Sociology' },
  { must: ['ncert', 'english'],      any: ['class 11', 'xi'],   mrp: 65,  label: 'NCERT English Class 11' },
  { must: ['ncert', 'english'],      any: ['class 12', 'xii'],  mrp: 65,  label: 'NCERT English Class 12' },
  { must: ['ncert', 'accountancy'],                              mrp: 80,  label: 'NCERT Accountancy' },
  { must: ['ncert', 'business'],                                 mrp: 75,  label: 'NCERT Business Studies' },

  // ── HC Verma ───────────────────────────────────────────────────────────────
  { must: ['concepts', 'physics', 'verma'],                              mrp: 440, label: 'HC Verma Concepts of Physics' },
  { must: ['hc verma'],                                                   mrp: 440, label: 'HC Verma' },
  { must: ['h.c. verma'],                                                 mrp: 440, label: 'HC Verma' },

  // ── RD Sharma ──────────────────────────────────────────────────────────────
  { must: ['rd sharma'],             any: ['class 10', 'x'],    mrp: 620, label: 'RD Sharma Class 10' },
  { must: ['rd sharma'],             any: ['class 11', 'xi'],   mrp: 780, label: 'RD Sharma Class 11' },
  { must: ['rd sharma'],             any: ['class 12', 'xii'],  mrp: 810, label: 'RD Sharma Class 12' },
  { must: ['r.d. sharma'],           any: ['class 10', 'x'],    mrp: 620, label: 'RD Sharma Class 10' },
  { must: ['r.d. sharma'],           any: ['class 11', 'xi'],   mrp: 780, label: 'RD Sharma Class 11' },
  { must: ['r.d. sharma'],           any: ['class 12', 'xii'],  mrp: 810, label: 'RD Sharma Class 12' },
  { must: ['rd sharma'],                                         mrp: 700, label: 'RD Sharma' },

  // ── RS Aggarwal ────────────────────────────────────────────────────────────
  { must: ['rs aggarwal'],           any: ['class 10', 'x'],    mrp: 500, label: 'RS Aggarwal Class 10' },
  { must: ['rs aggarwal'],           any: ['class 11', 'xi'],   mrp: 550, label: 'RS Aggarwal Class 11' },
  { must: ['rs aggarwal'],           any: ['class 12', 'xii'],  mrp: 580, label: 'RS Aggarwal Class 12' },
  { must: ['r.s. aggarwal'],                                     mrp: 520, label: 'RS Aggarwal' },
  { must: ['quantitative aptitude'], any: ['aggarwal', 'r.s.'], mrp: 695, label: 'RS Aggarwal Quantitative Aptitude' },

  // ── DC Pandey ──────────────────────────────────────────────────────────────
  { must: ['dc pandey'],             any: ['mechanics'],         mrp: 595, label: 'DC Pandey Mechanics' },
  { must: ['dc pandey'],             any: ['optics', 'waves'],   mrp: 595, label: 'DC Pandey Optics & Waves' },
  { must: ['dc pandey'],             any: ['electricity'],       mrp: 650, label: 'DC Pandey Electricity' },
  { must: ['dc pandey'],                                         mrp: 595, label: 'DC Pandey Physics' },

  // ── Arihant JEE / NEET ─────────────────────────────────────────────────────
  { must: ['arihant', 'jee', 'main'],                            mrp: 499, label: 'Arihant JEE Main' },
  { must: ['arihant', 'jee', 'advanced'],                        mrp: 595, label: 'Arihant JEE Advanced' },
  { must: ['arihant', 'neet'],                                   mrp: 499, label: 'Arihant NEET' },
  { must: ['arihant', 'physics'],    any: ['jee', 'neet'],       mrp: 450, label: 'Arihant Physics' },
  { must: ['arihant', 'chemistry'],  any: ['jee', 'neet'],       mrp: 450, label: 'Arihant Chemistry' },
  { must: ['arihant', 'biology'],    any: ['neet'],              mrp: 450, label: 'Arihant Biology' },
  { must: ['arihant', 'maths'],      any: ['jee'],               mrp: 450, label: 'Arihant Maths JEE' },
  { must: ['40 days', 'jee'],        any: ['arihant'],           mrp: 350, label: 'Arihant 40 Days JEE' },
  { must: ['40 days', 'neet'],       any: ['arihant'],           mrp: 350, label: 'Arihant 40 Days NEET' },
  { must: ['arihant'],                                           mrp: 395, label: 'Arihant publication' },

  // ── Disha ──────────────────────────────────────────────────────────────────
  { must: ['disha', 'jee'],                                      mrp: 395, label: 'Disha JEE' },
  { must: ['disha', 'neet'],                                     mrp: 395, label: 'Disha NEET' },
  { must: ['disha', 'upsc'],                                     mrp: 395, label: 'Disha UPSC' },
  { must: ['disha'],                                             mrp: 375, label: 'Disha publication' },

  // ── MTG ────────────────────────────────────────────────────────────────────
  { must: ['mtg', 'neet'],                                       mrp: 450, label: 'MTG NEET' },
  { must: ['mtg', 'jee'],                                        mrp: 450, label: 'MTG JEE' },
  { must: ['mtg', 'physics'],                                    mrp: 395, label: 'MTG Physics' },
  { must: ['mtg', 'chemistry'],                                  mrp: 395, label: 'MTG Chemistry' },
  { must: ['mtg', 'biology'],                                    mrp: 395, label: 'MTG Biology' },
  { must: ['mtg'],                                               mrp: 395, label: 'MTG publication' },

  // ── Cengage ────────────────────────────────────────────────────────────────
  { must: ['cengage', 'physics'],                                mrp: 795, label: 'Cengage Physics' },
  { must: ['cengage', 'chemistry'],                              mrp: 795, label: 'Cengage Chemistry' },
  { must: ['cengage', 'mathematics'], any: ['jee'],              mrp: 795, label: 'Cengage Mathematics JEE' },
  { must: ['cengage'],                                           mrp: 750, label: 'Cengage publication' },

  // ── Oswaal ─────────────────────────────────────────────────────────────────
  { must: ['oswaal'],                any: ['class 10', 'x'],    mrp: 325, label: 'Oswaal Class 10' },
  { must: ['oswaal'],                any: ['class 11', 'xi'],   mrp: 350, label: 'Oswaal Class 11' },
  { must: ['oswaal'],                any: ['class 12', 'xii'],  mrp: 375, label: 'Oswaal Class 12' },
  { must: ['oswaal'],                                           mrp: 325, label: 'Oswaal sample papers' },

  // ── S. Chand School ────────────────────────────────────────────────────────
  { must: ['s. chand', 'physics'],   any: ['class 11', 'xi'],   mrp: 420, label: 'S. Chand Physics 11' },
  { must: ['s. chand', 'physics'],   any: ['class 12', 'xii'],  mrp: 420, label: 'S. Chand Physics 12' },
  { must: ['s. chand', 'chemistry'],                             mrp: 395, label: 'S. Chand Chemistry' },
  { must: ['s. chand', 'math'],      any: ['class 9'],          mrp: 280, label: 'S. Chand Maths 9' },
  { must: ['s. chand', 'math'],      any: ['class 10'],         mrp: 295, label: 'S. Chand Maths 10' },
  { must: ['s. chand', 'biology'],                               mrp: 380, label: 'S. Chand Biology' },
  { must: ['s. chand'],                                          mrp: 350, label: 'S. Chand publication' },
  { must: ['schand'],                                            mrp: 350, label: 'S. Chand publication' },

  // ── S. Chand Engineering ───────────────────────────────────────────────────
  { must: ['s. chand', 'engineering', 'math'],                   mrp: 550, label: 'S. Chand Engineering Maths' },
  { must: ['higher engineering', 'math'],  any: ['grewal', 'b.s.'], mrp: 695, label: 'BS Grewal Engineering Maths' },
  { must: ['bs grewal'],                                         mrp: 695, label: 'BS Grewal Engineering Maths' },
  { must: ['b.s. grewal'],                                       mrp: 695, label: 'BS Grewal Engineering Maths' },

  // ── Laxmi Publications (Engineering) ──────────────────────────────────────
  { must: ['laxmi', 'data structure'],                           mrp: 395, label: 'Laxmi Data Structures' },
  { must: ['laxmi', 'operating system'],                         mrp: 395, label: 'Laxmi Operating Systems' },
  { must: ['laxmi', 'database'],                                 mrp: 375, label: 'Laxmi Database' },
  { must: ['laxmi', 'network'],                                  mrp: 395, label: 'Laxmi Networks' },
  { must: ['laxmi publications'],                                mrp: 395, label: 'Laxmi Publications' },

  // ── Technical Publications ─────────────────────────────────────────────────
  { must: ['technical publications'],                            mrp: 375, label: 'Technical Publications' },
  { must: ['technical pub'],                                     mrp: 375, label: 'Technical Publications' },

  // ── Tata McGraw Hill (TMH) ─────────────────────────────────────────────────
  { must: ['tata mcgraw', 'data structure'],                     mrp: 599, label: 'TMH Data Structures' },
  { must: ['tata mcgraw', 'algorithm'],                          mrp: 695, label: 'TMH Algorithms' },
  { must: ['introduction to algorithms'],                        mrp: 799, label: 'CLRS Algorithms (TMH)' },
  { must: ['cormen'],                                            mrp: 799, label: 'Introduction to Algorithms' },
  { must: ['tata mcgraw'],                                       mrp: 595, label: 'Tata McGraw Hill' },
  { must: ['tmh'],                                               mrp: 575, label: 'Tata McGraw Hill' },

  // ── Nirali Prakashan ───────────────────────────────────────────────────────
  { must: ['nirali'],                                            mrp: 345, label: 'Nirali Prakashan' },

  // ── Wiley / Wiley India ────────────────────────────────────────────────────
  { must: ['wiley', 'physics'],                                  mrp: 699, label: 'Wiley Physics' },
  { must: ['wiley', 'chemistry'],                                mrp: 699, label: 'Wiley Chemistry' },
  { must: ['wiley', 'math'],                                     mrp: 699, label: 'Wiley Maths' },
  { must: ['wiley'],                                             mrp: 650, label: 'Wiley publication' },

  // ── Pearson ────────────────────────────────────────────────────────────────
  { must: ['pearson', 'physics'],    any: ['jee', 'iit'],        mrp: 695, label: 'Pearson Physics JEE' },
  { must: ['pearson', 'chemistry'],  any: ['jee', 'iit'],        mrp: 695, label: 'Pearson Chemistry JEE' },
  { must: ['pearson', 'math'],       any: ['jee', 'iit'],        mrp: 695, label: 'Pearson Maths JEE' },
  { must: ['pearson'],                                           mrp: 599, label: 'Pearson publication' },

  // ── Oxford / Cambridge ────────────────────────────────────────────────────
  { must: ['oxford', 'university press'],                        mrp: 699, label: 'Oxford University Press' },
  { must: ['cambridge', 'university press'],                     mrp: 750, label: 'Cambridge University Press' },

  // ── UPSC / Civil Services ──────────────────────────────────────────────────
  { must: ['lucent', 'gk'],                                      mrp: 295, label: 'Lucent GK' },
  { must: ['lucent', 'general knowledge'],                       mrp: 295, label: 'Lucent General Knowledge' },
  { must: ['lucent'],                                            mrp: 280, label: 'Lucent publication' },
  { must: ['vajiram'],                                           mrp: 450, label: 'Vajiram & Ravi UPSC' },
  { must: ['vision ias'],                                        mrp: 500, label: 'Vision IAS material' },
  { must: ['spectrum', 'modern india'],                          mrp: 295, label: 'Spectrum Modern India' },
  { must: ['indian polity'],         any: ['laxmikanth'],        mrp: 595, label: 'M. Laxmikanth Indian Polity' },
  { must: ['laxmikanth'],                                        mrp: 595, label: 'M. Laxmikanth Indian Polity' },
  { must: ['ncert', 'history'],                                  mrp: 65,  label: 'NCERT History' },
  { must: ['bipin chandra'],                                     mrp: 450, label: 'Bipin Chandra History' },

  // ── Popular Fiction & Self-Help ────────────────────────────────────────────
  { must: ['atomic habits'],                                     mrp: 499, label: 'Atomic Habits' },
  { must: ['rich dad', 'poor dad'],                              mrp: 295, label: 'Rich Dad Poor Dad' },
  { must: ['ikigai'],                                            mrp: 250, label: 'Ikigai' },
  { must: ['sapiens'],                                           mrp: 699, label: 'Sapiens' },
  { must: ['thinking fast', 'slow'],                             mrp: 699, label: 'Thinking Fast and Slow' },
  { must: ['alchemist'],                                         mrp: 250, label: 'The Alchemist' },
  { must: ['five point', 'someone'], any: ['chetan', 'bhagat'],  mrp: 150, label: 'Five Point Someone' },
  { must: ['2 states'],              any: ['chetan', 'bhagat'],  mrp: 150, label: '2 States (Chetan Bhagat)' },
  { must: ['chetan bhagat'],                                     mrp: 175, label: 'Chetan Bhagat novel' },
  { must: ['harry potter'],          any: ['philosopher', 'stone', 'sorcerer'], mrp: 499, label: 'Harry Potter 1' },
  { must: ['harry potter'],                                      mrp: 499, label: 'Harry Potter' },
  { must: ['wings of fire'],         any: ['kalam', 'a.p.j'],   mrp: 200, label: 'Wings of Fire (Kalam)' },
  { must: ['wings of fire'],                                     mrp: 200, label: 'Wings of Fire' },
  { must: ['zero to one'],                                       mrp: 499, label: 'Zero to One' },
  { must: ['power of now'],                                      mrp: 349, label: 'The Power of Now' },
  { must: ['subtle art'],                                        mrp: 399, label: 'The Subtle Art of Not Giving a F*ck' },
  { must: ['deep work'],                                         mrp: 499, label: 'Deep Work' },

  // ── Common Engineering subjects ────────────────────────────────────────────
  { must: ['operating systems'],     any: ['tanenbaum', 'silberschatz'], mrp: 795, label: 'Operating Systems (standard)' },
  { must: ['computer networks'],     any: ['tanenbaum', 'forouzan'],     mrp: 795, label: 'Computer Networks (standard)' },
  { must: ['database system'],       any: ['korth', 'navathe'],          mrp: 795, label: 'Database Systems (standard)' },
  { must: ['software engineering'],  any: ['pressman', 'sommerville'],   mrp: 750, label: 'Software Engineering (standard)' },
  { must: ['digital electronics'],   any: ['floyd', 'tocci'],            mrp: 599, label: 'Digital Electronics' },
  { must: ['microprocessor'],        any: ['gaonkar', 'ramesh'],         mrp: 495, label: 'Microprocessors' },
  { must: ['signals and systems'],                                        mrp: 550, label: 'Signals and Systems' },
  { must: ['control systems'],                                            mrp: 525, label: 'Control Systems' },
  { must: ['fluid mechanics'],       any: ['modi', 'r.k. bansal'],       mrp: 595, label: 'Fluid Mechanics' },
  { must: ['strength of materials'], any: ['r.k. bansal'],               mrp: 595, label: 'Strength of Materials' },
  { must: ['thermodynamics'],        any: ['nag', 'p.k.', 'cengel'],     mrp: 650, label: 'Engineering Thermodynamics' },
  { must: ['machine design'],        any: ['shigley', 'vb bhandari'],    mrp: 650, label: 'Machine Design' },

  // ── CA / Commerce ──────────────────────────────────────────────────────────
  { must: ['icai', 'ca'],                                        mrp: 450, label: 'ICAI CA Study Material' },
  { must: ['ca foundation'],                                     mrp: 425, label: 'CA Foundation' },
  { must: ['ca inter'],                                          mrp: 500, label: 'CA Intermediate' },
  { must: ['ca final'],                                          mrp: 595, label: 'CA Final' },
  { must: ['mercantile law'],        any: ['bare act'],           mrp: 150, label: 'Mercantile Law' },

  // ── School guides / guides ─────────────────────────────────────────────────
  { must: ['golden', 'cbse'],        any: ['class 10'],          mrp: 280, label: 'Golden Guide CBSE 10' },
  { must: ['golden', 'cbse'],        any: ['class 12'],          mrp: 295, label: 'Golden Guide CBSE 12' },
  { must: ['together with'],         any: ['class 10'],          mrp: 295, label: 'Together With Class 10' },
  { must: ['together with'],         any: ['class 12'],          mrp: 325, label: 'Together With Class 12' },
  { must: ['full marks'],            any: ['class 10'],          mrp: 270, label: 'Full Marks Class 10' },
  { must: ['full marks'],            any: ['class 12'],          mrp: 295, label: 'Full Marks Class 12' },
  { must: ['xam idea'],              any: ['class 10'],          mrp: 295, label: 'Xam Idea Class 10' },
  { must: ['xam idea'],              any: ['class 12'],          mrp: 325, label: 'Xam Idea Class 12' },
  { must: ['evergreen'],             any: ['class 10'],          mrp: 260, label: 'Evergreen Class 10' },
  { must: ['evergreen'],             any: ['class 12'],          mrp: 280, label: 'Evergreen Class 12' },

];

// ─── Lookup ───────────────────────────────────────────────────────────────────

/**
 * Returns the best matching book record from the database, or null if no
 * record scores highly enough.
 */
export function lookupInDatabase(
  title: string,
  publisher: string | null,
  subject: string | null,
  classLevel: number | null,
): { mrp: number; label: string } | null {
  const hay = [title, publisher ?? '', subject ?? '', classLevel ? `class ${classLevel}` : '']
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9\s\.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  let bestScore = 0;
  let bestRecord: BookRecord | null = null;

  for (const record of BOOK_DATABASE) {
    // All `must` keywords must match
    if (!record.must.every(k => hay.includes(k))) continue;

    let score = record.must.length * 10;

    // Bonus for `any` matches
    if (record.any) {
      for (const k of record.any) {
        if (hay.includes(k)) { score += 5; break; }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestRecord = record;
    }
  }

  // Require at least 2 keyword hits to trust the match
  if (!bestRecord || bestScore < 20) return null;

  return { mrp: bestRecord.mrp, label: bestRecord.label };
}
