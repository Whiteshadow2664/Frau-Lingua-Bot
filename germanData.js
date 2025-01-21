// Quiz Data for German
const germanQuizData = {
  A1: [
    { word: "Haus", meaning: "House", options: ["A: Apple", "B: House", "C: Dog", "D: Cat"], correct: "🇧" },
    { word: "Katze", meaning: "Cat", options: ["A: Rabbit", "B: Cat", "C: Dog", "D: Bird"], correct: "🇧" }
  ],
  A2: [
    { word: "Freundschaft", meaning: "Friendship", options: ["A: Friendship", "B: Love", "C: Anger", "D: Sadness"], correct: "🇦" }
  ],
  B1: [
    { word: "Freiheit", meaning: "Freedom", options: ["A: Freedom", "B: Justice", "C: Peace", "D: Honor"], correct: "🇦" }
  ],
  B2: [
    { word: "Fortschritt", meaning: "Progress", options: ["A: Progress", "B: Decline", "C: Start", "D: Stop"], correct: "🇦" }
  ],
  C1: [
    { word: "Harmonie", meaning: "Harmony", options: ["A: Harmony", "B: Chaos", "C: Peace", "D: Disagreement"], correct: "🇦" }
  ],
  C2: [
    { word: "Perfektion", meaning: "Perfection", options: ["A: Perfection", "B: Imperfection", "C: Mediocrity", "D: Excellence"], correct: "🇦" }
  ]
};

// Word of the Day Data for German
const germanWordList = [
  { word: "Hund", meaning: "Dog", plural: "Hunde", indefinite: "ein", definite: "der" },
  { word: "Buch", meaning: "Book", plural: "Bücher", indefinite: "ein", definite: "das" },
  { word: "Meer", meaning: "Sea", plural: "Meere", indefinite: "ein", definite: "das" }
];

module.exports = { germanQuizData, germanWordList };