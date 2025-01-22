// German Quiz Data
const germanQuizData = {
    A1: [
        {
            word: "Haus",
            options: ["House", "Tree", "Car", "Dog"],
            correct: "House"
        },
        {
            word: "Katze",
            options: ["Cat", "Mouse", "Bird", "Horse"],
            correct: "Cat"
        }
    ],
    A2: [
        {
            word: "Freundschaft",
            options: ["Friendship", "Love", "Anger", "Sadness"],
            correct: "Friendship"
        }
    ],
    B1: [
        {
            word: "Freiheit",
            options: ["Freedom", "Justice", "Peace", "Honor"],
            correct: "Freedom"
        }
    ],
    B2: [
        {
            word: "Fortschritt",
            options: ["Progress", "Decline", "Start", "Stop"],
            correct: "Progress"
        }
    ],
    C1: [
        {
            word: "Harmonie",
            options: ["Harmony", "Chaos", "Peace", "Disagreement"],
            correct: "Harmony"
        }
    ],
    C2: [
        {
            word: "Perfektion",
            options: ["Perfection", "Imperfection", "Mediocrity", "Excellence"],
            correct: "Perfection"
        }
    ]
};

// German Word of the Day Data
const germanWordList = [
    {
        word: "Hund",
        meaning: "Dog",
        plural: "Hunde",
        indefinite: "ein",
        definite: "der"
    },
    {
        word: "Buch",
        meaning: "Book",
        plural: "Bücher",
        indefinite: "ein",
        definite: "das"
    },
    {
        word: "Meer",
        meaning: "Sea",
        plural: "Meere",
        indefinite: "ein",
        definite: "das"
    }
];

module.exports = { germanQuizData, germanWordList };