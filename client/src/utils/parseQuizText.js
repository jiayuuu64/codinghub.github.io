export const parseQuizText = (quizText) => {
  const questionBlocks = quizText.trim().split(/\n(?=\d+\.\s)/);

  const parsedQuestions = questionBlocks.map((block) => {
    const lines = block.trim().split('\n');

    const questionLine = lines.find(line => /^\d+\./.test(line)) || '';
    const question = questionLine.replace(/^\d+\.\s*/, '');

    const options = ['A', 'B', 'C', 'D'].map(letter => {
      const line = lines.find(l => l.startsWith(letter + '.'));
      return line ? line.slice(3).trim() : '';
    });

    let answerLine = lines.find(line => /^Answer:/i.test(line));
    let rawAnswer = answerLine ? answerLine.replace(/^Answer:\s*/, '').trim() : '';

    // Check if rawAnswer exactly matches option text
    let finalAnswer = options.find(opt => opt.toLowerCase() === rawAnswer.toLowerCase());

    // If rawAnswer is a letter, map to option
    if (!finalAnswer && ['A', 'B', 'C', 'D'].includes(rawAnswer.toUpperCase())) {
      const index = ['A', 'B', 'C', 'D'].indexOf(rawAnswer.toUpperCase());
      finalAnswer = options[index];
    }

    // Fallback if still no match
    if (!finalAnswer) {
      finalAnswer = rawAnswer;
    }

    let explanationLine = lines.find(line => /^Explanation:/i.test(line));
    let explanation = explanationLine ? explanationLine.replace(/^Explanation:\s*/, '').trim() : '';

    return {
      question,
      options,
      answer: finalAnswer,
      explanation
    };
  });

  return parsedQuestions;
};