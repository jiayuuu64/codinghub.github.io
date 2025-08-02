let cancelRequested = false;

export const speakText = (text) => {
  cancelRequested = false; 

  return new Promise((resolve) => {
    if (!window.speechSynthesis) return resolve();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.pitch = 1;
    utterance.rate = 1;

    utterance.onend = resolve;
    utterance.onerror = resolve;

    window.speechSynthesis.speak(utterance);
  });
};

export const stopSpeaking = () => {
  cancelRequested = true;
  window.speechSynthesis.cancel();
};
