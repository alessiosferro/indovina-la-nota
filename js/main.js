import getRandomValue from './helpers/get-random-value.js';

new (class {
  toggleRecognition = false;

  constructor() {
    this.imageElement = document.getElementById('nota');
    this.playAgainButton = document.getElementById('play-again');
    this.resultElement = document.getElementById('result');
    this.micElement = document.getElementById('mic');
    this.micImage = document.getElementById('mic-image');
    this.scoreElement = document.getElementById('score');
    this.resultContainer = document.getElementById('result-container');
    this.score = Number.parseInt(this.scoreElement.innerText);

    window.SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    this.recognition = new window.SpeechRecognition();

    this.getNotes();
    this.addEventListeners();
  }

  addEventListeners() {
    document.addEventListener('click', e => {
      if (e.target.id !== 'play-again') return;

      this.resultContainer.style.opacity = '0';
      this.resultContainer.removeChild(e.target);
      this.updateDOM();
      this.recognition.start();
    });

    this.micElement.addEventListener('click', () => {
      this.toggleRecognition = !this.toggleRecognition;

      if (this.toggleRecognition) {
        this.stopped = false;
        this.recognition.start();
      } else {
        this.stopped = true;
        this.recognition.stop();
      }
    });

    this.recognition.addEventListener('nomatch', () =>
      this.recognition.start()
    );

    this.recognition.addEventListener('result', e => {
      this.result = this.onSpeak(e);
    });

    this.recognition.addEventListener('start', () => {
      this.micImage.src = 'assets/icons/mic.png';
      this.micImage.classList.add('mic-anim');
    });

    this.recognition.addEventListener('end', () => {
      if (!this.result && !this.stopped) this.recognition.start();

      this.micImage.src = 'assets/icons/mute.png';
      this.micImage.classList.remove('mic-anim');
    });
  }

  async getNotes() {
    let request = await fetch('db.json');
    let response = await request.json();

    this.note = response.note;

    this.updateDOM();
  }

  updateDOM() {
    this.nota = this.getRandomNote();
    this.imageElement.src = `assets/img/${this.nota.src}`;
  }

  getRandomNote = () => this.note[getRandomValue(this.note.length)];

  onSpeak(event) {
    const result = event.results[0][0].transcript;

    let { descrizione, alternativa } = this.nota;

    switch (true) {
      case descrizione === result:
      case alternativa === result:
        this.resultContainer.style.opacity = '1';
        this.resultElement.innerText = 'Esatto, hai indovinato!';

        let button = document.createElement('button');
        button.classList.add('btn', 'btn--primary');
        button.id = 'play-again';
        button.type = 'button';
        button.innerText = 'Prova ancora';
        this.resultContainer.insertAdjacentElement('beforeend', button);

        this.updateScore(5);
        return true;

      default:
        this.resultContainer.style.opacity = '1';
        this.resultElement.innerText = 'Non hai indovinato. Riprova!';
        setTimeout(() => (this.resultContainer.style.opacity = '0'), 1200);
    }

    return false;
  }

  updateScore(score) {
    this.score += score;
    this.scoreElement.innerText = this.score;
  }
})();
