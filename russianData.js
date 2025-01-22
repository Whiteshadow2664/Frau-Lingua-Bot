// Russian Quiz Data
const russianQuizData = {
    A1: [
        {
            word: "Дом",
            options: ["House", "Tree", "Car", "Dog"],
            correct: "House"
        },
        {
            word: "Кошка",
            options: ["Cat", "Mouse", "Bird", "Horse"],
            correct: "Cat"
        }
    ],
    A2: [
        {
            word: "Дружба",
            options: ["Friendship", "Love", "Anger", "Sadness"],
            correct: "Friendship"
        }
    ],
    B1: [
        {
            word: "Свобода",
            options: ["Freedom", "Justice", "Peace", "Honor"],
            correct: "Freedom"
        }
    ],
    B2: [
        {
            word: "Прогресс",
            options: ["Progress", "Decline", "Start", "Stop"],
            correct: "Progress"
        }
    ],
    C1: [
        {
            word: "Гармония",
            options: ["Harmony", "Chaos", "Peace", "Disagreement"],
            correct: "Harmony"
        }
    ],
    C2: [
        {
            word: "Совершенство",
            options: ["Perfection", "Imperfection", "Mediocrity", "Excellence"],
            correct: "Perfection"
        }
    ]
};

// Russian Word of the Day Data
const russianWordList = [
    {
        word: "Собака",
        meaning: "Dog",
        plural: "Собаки",
        indefinite: "одна",
        definite: "та"
    },
    {
        word: "Книга",
        meaning: "Book",
        plural: "Книги",
        indefinite: "одна",
        definite: "та"
    },
    {
        word: "Море",
        meaning: "Sea",
        plural: "Моря",
        indefinite: "одно",
        definite: "то"
    }
];

module.exports = { russianQuizData, russianWordList };