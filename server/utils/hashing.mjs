// server/utils/hashing.mjs
import crypto from 'crypto';

export const norm = (s = '') => s.toLowerCase().replace(/\s+/g, ' ').trim();

// turn "same idea w/ different numbers/names" into the same template
export const templateNormalize = (s = '') =>
  norm(s)
    .replace(/\b\d+(\.\d+)?\b/g, '<NUM>') // numbers -> <NUM>
    // keep some keywords; everything else that looks like an identifier -> <VAR>
    .replace(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g, (m) => {
      const keep = new Set([
        'if','else','for','while','return','function',
        'int','str','float','boolean','true','false',
        'list','dict','tuple','sql','select','where','group','by','and','or','not'
      ]);
      return keep.has(m) ? m : '<VAR>';
    });

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

export const questionHash = (q) => sha256(norm(q || ''));
export const templateHash = (q) => sha256(templateNormalize(q || ''));
