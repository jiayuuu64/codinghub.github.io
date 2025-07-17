export const speakText = (text) => {
  if (!window.speechSynthesis) return;
  const synth = window.speechSynthesis;
  synth.cancel(); // Stop any ongoing speech

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.pitch = 1;
  utterance.rate = 1;
  synth.speak(utterance);
};
