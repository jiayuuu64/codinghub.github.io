// src/utils/parseQuizText.js

export const parseQuizText = (quizText) => {
  const questionBlocks = quizText.trim().split(/\n(?=\d+\.\s)/); // Split on lines like "1. ", "2. ", etc.

  const parsedQuestions = questionBlocks.map((block) => {
    const lines = block.trim().split('\n');

    const questionLine = lines.find(line => /^\d+\./.test(line)) || '';
    const question = questionLine.replace(/^\d+\.\s*/, '');

    const options = ['A', 'B', 'C', 'D'].map(letter => {
      const line = lines.find(l => l.startsWith(letter + '.'));
      return line ? line.slice(3).trim() : '';
    });

    const answerLine = lines.find(line => /^Answer:/i.test(line));
    const answer = answerLine ? answerLine.split(':')[1].trim() : '';

    return { question, options, answer, explanation: '' };
  });

  return parsedQuestions;
};