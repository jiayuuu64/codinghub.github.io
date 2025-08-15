const norm = (s) => (s || '').toLowerCase().replace(/\s+/g, ' ').trim();
const canonical = (s) => norm(s).replace(/^["'`]|["'`]$/g, '').replace(/[.,;:!?]$/g, '');

export const parseQuizText = (quizText = '') => {
  const blocks = quizText.replace(/\r\n/g, '\n').trim().split(/\n(?=\d+\.\s)/);

  const parsed = blocks.map((block) => {
    const lines = block.trim().split('\n');

    // Topic (optional)
    const topicLine = lines.find((l) => /^Topic:/i.test(l));
    const topic = topicLine ? topicLine.replace(/^Topic:\s*/i, '').trim() : 'Mixed';

    // Question
    const qLine = lines.find((l) => /^\d+\.\s*/.test(l)) || '';
    const question = qLine.replace(/^\d+\.\s*/, '').trim();

    // Options
    const optRegex = /^([A-D])[\.\)]\s*(.+)$/i;
    const found = { A: '', B: '', C: '', D: '' };
    lines.forEach((l) => {
      const m = l.match(optRegex);
      if (m) found[m[1].toUpperCase()] = (m[2] || '').trim();
    });
    const options = ['A','B','C','D'].map((L) => found[L] || '');

    // Answer
    const ansMatch = block.match(/^\s*(Answer|Correct\s*Answer):\s*(.+)$/im);
    let rawAnswer = ansMatch ? ansMatch[2].trim() : '';
    const canonAnswer = canonical(rawAnswer);
    let finalAnswer = options.find((opt) => canonical(opt) === canonAnswer) || '';
    if (!finalAnswer && /^[A-D]$/i.test(canonAnswer)) {
      const idx = 'ABCD'.indexOf(canonAnswer.toUpperCase());
      if (idx >= 0) finalAnswer = options[idx] || '';
    }
    if (!finalAnswer) finalAnswer = rawAnswer;

    // Explanation
    const expMatch = block.match(/^\s*Explanation:\s*(.+)$/im);
    const explanation = expMatch ? expMatch[1].trim() : '';

    return { topic, question, options, answer: finalAnswer, explanation };
  });

  return parsed.filter((q) => q.question && q.options.filter(Boolean).length === 4);
};