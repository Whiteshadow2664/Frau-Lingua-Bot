// French Quiz Data
const frenchQuizData = {
    A1: [
        {
            word: "Maison",
            options: ["House", "Tree", "Car", "Dog"],
            correct: "House"
        },
        {
            word: "Chat",
            options: ["Cat", "Mouse", "Bird", "Horse"],
            correct: "Cat"
        }
    ],
    A2: [
        {
            word: "Amitié",
            options: ["Friendship", "Love", "Anger", "Sadness"],
            correct: "Friendship"
        }
    ],
    B1: [
        {
            word: "Liberté",
            options: ["Freedom", "Justice", "Peace", "Honor"],
            correct: "Freedom"
        }
    ],
    B2: [
        {
            word: "Progrès",
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
            word: "Perfection",
            options: ["Perfection", "Imperfection", "Mediocrity", "Excellence"],
            correct: "Perfection"
        }
    ]
};

// French Word of the Day Data
const frenchWordList = [
    {
        word: "Chien",
        meaning: "Dog",
        plural: "Chiens",
        indefinite: "un",
        definite: "le"
    },
    {
        word: "Livre",
        meaning: "Book",
        plural: "Livres",
        indefinite: "un",
        definite: "le"
    },
    {
        word: "Mer",
        meaning: "Sea",
        plural: "Mers",
        indefinite: "une",
        definite: "la"
    }
];

module.exports = { frenchQuizData, frenchWordList };