/**
 * Easy Amharic Typing transliteration engine
 * Converts phonetic Latin keystrokes into Ge'ez (Amharic) characters.
 */

// Fidel mapping table (consonants x vowels)
// 1st order: ä / e, 2nd: u, 3rd: i, 4th: a, 5th: e/ie, 6th: (default consonant), 7th: o
const CONSONANT_MAP: Record<string, string[]> = {
  h: ['ሀ', 'ሁ', 'ሂ', 'ሃ', 'ሄ', 'ህ', 'ሆ'],
  hh: ['ሐ', 'ሑ', 'ሒ', 'ሓ', 'ሔ', 'ሕ', 'ሖ'],
  l: ['ለ', 'ሉ', 'ሊ', 'ላ', 'ሌ', 'ል', 'ሎ'],
  m: ['መ', 'ሙ', 'ሚ', 'ማ', 'ሜ', 'ም', 'ሞ'],
  s: ['ሰ', 'ሱ', 'ሲ', 'ሳ', 'ሴ', 'ስ', 'ሶ'],
  sz: ['ሠ', 'ሡ', 'ሢ', 'ሣ', 'ሤ', 'ሥ', 'ሦ'],
  r: ['ረ', 'ሩ', 'ሪ', 'ራ', 'ሬ', 'ር', 'ሮ'],
  sh: ['ሸ', 'ሹ', 'ሺ', 'ሻ', 'ሼ', 'ሽ', 'ሾ'],
  q: ['ቀ', 'ቁ', 'ቂ', 'ቃ', 'ቄ', 'ቅ', 'ቆ'],
  b: ['በ', 'ቡ', 'ቢ', 'ባ', 'ቤ', 'ብ', 'ቦ'],
  t: ['ተ', 'ቱ', 'ቲ', 'ታ', 'ቴ', 'ት', 'ቶ'],
  ch: ['ቸ', 'ቹ', 'ቺ', 'ቻ', 'ቼ', 'ች', 'ቾ'],
  n: ['ነ', 'ኑ', 'ኒ', 'ና', 'ኔ', 'ን', 'ኖ'],
  gn: ['ኘ', 'ኙ', 'ኚ', 'ኛ', 'ኜ', 'ኝ', 'ኞ'],
  ny: ['ኘ', 'ኙ', 'ኚ', 'ኛ', 'ኜ', 'ኝ', 'ኞ'],
  k: ['ከ', 'ኩ', 'ኪ', 'ካ', 'ኬ', 'ክ', 'ኮ'],
  w: ['ወ', 'ዉ', 'ዊ', 'ዋ', 'ዌ', 'ው', 'ዎ'],
  z: ['ዘ', 'ዙ', 'ዚ', 'ዛ', 'ዜ', 'ዝ', 'ዞ'],
  zh: ['ዠ', 'ዡ', 'ዢ', 'ዣ', 'ዤ', 'ዥ', 'ዦ'],
  y: ['የ', 'ዩ', 'ዪ', 'ያ', 'ዬ', 'ይ', 'ዮ'],
  d: ['ደ', 'ዱ', 'ዲ', 'ዳ', 'ዴ', 'ድ', 'ዶ'],
  j: ['ጀ', 'ጁ', 'ጂ', 'ጃ', 'ጄ', 'ጅ', 'ጆ'],
  g: ['ገ', 'ጉ', 'ጊ', 'ጋ', 'ጌ', 'ግ', 'ጎ'],
  tt: ['ጠ', 'ጡ', 'ጢ', 'ጣ', 'ጤ', 'ጥ', 'ጦ'],
  tch: ['ጨ', 'ጩ', 'ጪ', 'ጫ', 'ጬ', 'ጭ', 'ጮ'],
  pp: ['ጰ', 'ጱ', 'ጲ', 'ጳ', 'ጴ', 'ጵ', 'ጶ'],
  ts: ['ጸ', 'ጹ', 'ጺ', 'ጻ', 'ጼ', 'ጽ', 'ጾ'],
  tz: ['ፀ', 'ፁ', 'ፂ', 'ፃ', 'ፄ', 'ፅ', 'ፆ'],
  f: ['ፈ', 'ፉ', 'ፊ', 'ፋ', 'ፌ', 'ፍ', 'ፎ'],
  p: ['ፐ', 'ፑ', 'ፒ', 'ፓ', 'ፔ', 'ፕ', 'ፖ'],
  v: ['ቨ', 'ቩ', 'ቪ', 'ቫ', 'ቬ', 'ቭ', 'ቮ'],
};

// Standalone vowels: a, u, i, aa, ee, e, o
const VOWELS_MAP: Record<string, string> = {
  a: 'አ',
  u: 'ኡ',
  i: 'ኢ',
  aa: 'ኣ',
  ee: 'ኤ',
  e: 'እ',
  o: 'ኦ',
};

// Common punctuation
const PUNCTUATION_MAP: Record<string, string> = {
  ':': '፡',
  '::': '።',
  ',': '፣',
  ';': '፤',
  '?': '፧',
};

/**
 * Phonetically transliterates a Latin input string to Amharic Ge'ez script.
 */
export function transliterateToAmharic(input: string): string {
  if (!input) return '';

  let result = '';
  let i = 0;
  const text = input.toLowerCase();

  while (i < text.length) {
    // Check punctuation
    if (text.slice(i, i + 2) === '::') {
      result += PUNCTUATION_MAP['::'];
      i += 2;
      continue;
    }
    if (PUNCTUATION_MAP[text[i]]) {
      result += PUNCTUATION_MAP[text[i]];
      i++;
      continue;
    }

    // Check spaces & newlines & non-alphabetic
    if (!/[a-z]/.test(text[i])) {
      result += input[i];
      i++;
      continue;
    }

    // Try multi-char consonants: tch, sz, sh, ch, gn, ny, tt, pp, ts, tz, zh, hh
    let consKey = '';
    let consLen = 0;

    if (i + 3 <= text.length && CONSONANT_MAP[text.slice(i, i + 3)]) {
      consKey = text.slice(i, i + 3);
      consLen = 3;
    } else if (i + 2 <= text.length && CONSONANT_MAP[text.slice(i, i + 2)]) {
      consKey = text.slice(i, i + 2);
      consLen = 2;
    } else if (CONSONANT_MAP[text[i]]) {
      consKey = text[i];
      consLen = 1;
    }

    if (consKey) {
      const remaining = text.slice(i + consLen);
      let vowelOrder = 5; // 6th form default (sadis e.g. ስ, ል, ም)
      let vowelLen = 0;

      if (remaining.startsWith('ee')) {
        vowelOrder = 4; // 5th form (hamis: ሴ)
        vowelLen = 2;
      } else if (remaining.startsWith('aa')) {
        vowelOrder = 3; // 4th form (rabi: ሳ)
        vowelLen = 2;
      } else if (remaining.startsWith('a')) {
        vowelOrder = 3; // 4th form (rabi: ሳ)
        vowelLen = 1;
      } else if (remaining.startsWith('e')) {
        vowelOrder = 0; // 1st form (ge'ez: ሰ)
        vowelLen = 1;
      } else if (remaining.startsWith('u')) {
        vowelOrder = 1; // 2nd form (ka'eb: ሱ)
        vowelLen = 1;
      } else if (remaining.startsWith('i')) {
        vowelOrder = 2; // 3rd form (salis: ሲ)
        vowelLen = 1;
      } else if (remaining.startsWith('o')) {
        vowelOrder = 6; // 7th form (sabi: ሶ)
        vowelLen = 1;
      }

      const forms = CONSONANT_MAP[consKey];
      if (forms && forms[vowelOrder]) {
        result += forms[vowelOrder];
        i += consLen + vowelLen;
        continue;
      }
    }

    // Check standalone vowel
    if (i + 2 <= text.length && VOWELS_MAP[text.slice(i, i + 2)]) {
      result += VOWELS_MAP[text.slice(i, i + 2)];
      i += 2;
      continue;
    }
    if (VOWELS_MAP[text[i]]) {
      result += VOWELS_MAP[text[i]];
      i++;
      continue;
    }

    // Fallback if not matched
    result += input[i];
    i++;
  }

  return result;
}
