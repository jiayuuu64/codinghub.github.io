let cancelRequested = false;

export const speakText = (text) => {
  cancelRequested = false; 

  return new Promise((resolve) => {
    if (!window.speechSynthesis) return resolve(); // checks if the API exists

    const utterance = new SpeechSynthesisUtterance(text); // creates a "speech job"
    utterance.lang = 'en-US';
    utterance.pitch = 1;
    utterance.rate = 1;

    utterance.onend = resolve; // when reading finishes, promise fulfilled
    utterance.onerror = resolve;

    window.speechSynthesis.speak(utterance); // sends it to the browser to speak
  });
};

export const stopSpeaking = () => {
  cancelRequested = true;
  window.speechSynthesis.cancel();
};
