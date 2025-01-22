// Russian Quiz Data
const RussianQuizData = {
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

// Russian Word of the Day Data
const RussianWordList = [
  { word: 'город', meaning: 'City', plural: 'города', indefinite: 'город', definite: 'город' },
  { word: 'яблоко', meaning: 'Apple', plural: 'яблоки', indefinite: 'яблоко', definite: 'яблоко' },
  { word: 'книга', meaning: 'Book', plural: 'книги', indefinite: 'книга', definite: 'книга' },
  { word: 'дом', meaning: 'House', plural: 'дома', indefinite: 'дом', definite: 'дом' },
  { word: 'стол', meaning: 'Table', plural: 'столы', indefinite: 'стол', definite: 'стол' },
  { word: 'чашка', meaning: 'Cup', plural: 'чашки', indefinite: 'чашка', definite: 'чашка' },
  { word: 'машина', meaning: 'Car', plural: 'машины', indefinite: 'машина', definite: 'машина' },
  { word: 'собака', meaning: 'Dog', plural: 'собаки', indefinite: 'собака', definite: 'собака' },
  { word: 'кошка', meaning: 'Cat', plural: 'кошки', indefinite: 'кошка', definite: 'кошка' },
  { word: 'дерево', meaning: 'Tree', plural: 'деревья', indefinite: 'дерево', definite: 'дерево' },
  { word: 'птица', meaning: 'Bird', plural: 'птицы', indefinite: 'птица', definite: 'птица' },
  { word: 'река', meaning: 'River', plural: 'реки', indefinite: 'река', definite: 'река' },
  { word: 'море', meaning: 'Sea', plural: 'море', indefinite: 'море', definite: 'море' },
  { word: 'горо́д', meaning: 'Town', plural: 'города', indefinite: 'город', definite: 'город' },
  { word: 'солнце', meaning: 'Sun', plural: 'солнца', indefinite: 'солнце', definite: 'солнце' },
  { word: 'небо', meaning: 'Sky', plural: 'неба', indefinite: 'небо', definite: 'небо' },
  { word: 'земля', meaning: 'Earth', plural: 'земли', indefinite: 'земля', definite: 'земля' },
  { word: 'человек', meaning: 'Person', plural: 'люди', indefinite: 'человек', definite: 'человек' },
  { word: 'женщина', meaning: 'Woman', plural: 'женщины', indefinite: 'женщина', definite: 'женщина' },
  { word: 'мужчина', meaning: 'Man', plural: 'мужчины', indefinite: 'мужчина', definite: 'мужчина' },
  { word: 'день', meaning: 'Day', plural: 'дни', indefinite: 'день', definite: 'день' },
  { word: 'ночь', meaning: 'Night', plural: 'ночи', indefinite: 'ночь', definite: 'ночь' },
  { word: 'время', meaning: 'Time', plural: 'время', indefinite: 'время', definite: 'время' },
  { word: 'работа', meaning: 'Work', plural: 'работы', indefinite: 'работа', definite: 'работа' },
  { word: 'школа', meaning: 'School', plural: 'школы', indefinite: 'школа', definite: 'школа' },
  { word: 'университет', meaning: 'University', plural: 'университеты', indefinite: 'университет', definite: 'университет' },
  { word: 'работник', meaning: 'Worker', plural: 'работники', indefinite: 'работник', definite: 'работник' },
  { word: 'студент', meaning: 'Student', plural: 'студенты', indefinite: 'студент', definite: 'студент' },
  { word: 'преподаватель', meaning: 'Teacher', plural: 'преподаватели', indefinite: 'преподаватель', definite: 'преподаватель' },
  { word: 'класс', meaning: 'Class', plural: 'классы', indefinite: 'класс', definite: 'класс' },
  { word: 'папа', meaning: 'Dad', plural: 'папы', indefinite: 'папа', definite: 'папа' },
  { word: 'мама', meaning: 'Mom', plural: 'мамы', indefinite: 'мама', definite: 'мама' },
  { word: 'ребёнок', meaning: 'Child', plural: 'дети', indefinite: 'ребёнок', definite: 'ребёнок' },
  { word: 'друг', meaning: 'Friend', plural: 'друзья', indefinite: 'друг', definite: 'друг' },
  { word: 'друзья', meaning: 'Friends', plural: 'друзья', indefinite: 'друзья', definite: 'друзья' },
  { word: 'отец', meaning: 'Father', plural: 'отцы', indefinite: 'отец', definite: 'отец' },
  { word: 'мать', meaning: 'Mother', plural: 'матери', indefinite: 'мать', definite: 'мать' },
  { word: 'сестра', meaning: 'Sister', plural: 'сестры', indefinite: 'сестра', definite: 'сестра' },
  { word: 'брат', meaning: 'Brother', plural: 'братья', indefinite: 'брат', definite: 'брат' },
  { word: 'зуб', meaning: 'Tooth', plural: 'зубы', indefinite: 'зуб', definite: 'зуб' },
  { word: 'глаз', meaning: 'Eye', plural: 'глаза', indefinite: 'глаз', definite: 'глаз' },
  { word: 'нос', meaning: 'Nose', plural: 'носы', indefinite: 'нос', definite: 'нос' },
  { word: 'рот', meaning: 'Mouth', plural: 'роты', indefinite: 'рот', definite: 'рот' },
  { word: 'рука', meaning: 'Hand', plural: 'руки', indefinite: 'рука', definite: 'рука' },
  { word: 'нога', meaning: 'Leg', plural: 'ноги', indefinite: 'нога', definite: 'нога' },
  { word: 'пальцы', meaning: 'Fingers', plural: 'пальцы', indefinite: 'пальцы', definite: 'пальцы' },
  { word: 'волосы', meaning: 'Hair', plural: 'волосы', indefinite: 'волосы', definite: 'волосы' },
  { word: 'ум', meaning: 'Mind', plural: 'умы', indefinite: 'ум', definite: 'ум' },
  { word: 'телефон', meaning: 'Phone', plural: 'телефоны', indefinite: 'телефон', definite: 'телефон' },
  { word: 'книга', meaning: 'Book', plural: 'книги', indefinite: 'книга', definite: 'книга' },
  { word: 'газета', meaning: 'Newspaper', plural: 'газеты', indefinite: 'газета', definite: 'газета' },
  { word: 'журнал', meaning: 'Magazine', plural: 'журналы', indefinite: 'журнал', definite: 'журнал' },
  { word: 'тетрадь', meaning: 'Notebook', plural: 'тетради', indefinite: 'тетрадь', definite: 'тетрадь' },
  { word: 'ручка', meaning: 'Pen', plural: 'ручки', indefinite: 'ручка', definite: 'ручка' },
  { word: 'карандаш', meaning: 'Pencil', plural: 'карандаши', indefinite: 'карандаш', definite: 'карандаш' },
  { word: 'письмо', meaning: 'Letter', plural: 'письма', indefinite: 'письмо', definite: 'письмо' },
  { word: 'письменность', meaning: 'Writing', plural: 'письменности', indefinite: 'письменность', definite: 'письменность' },
  { word: 'карта', meaning: 'Map', plural: 'карты', indefinite: 'карта', definite: 'карта' },
  { word: 'страна', meaning: 'Country', plural: 'страны', indefinite: 'страна', definite: 'страна' },
  { word: 'город', meaning: 'City', plural: 'города', indefinite: 'город', definite: 'город' },
  { word: 'деревня', meaning: 'Village', plural: 'деревни', indefinite: 'деревня', definite: 'деревня' },
  { word: 'площадь', meaning: 'Square', plural: 'площади', indefinite: 'площадь', definite: 'площадь' },
  { word: 'улица', meaning: 'Street', plural: 'улицы', indefinite: 'улица', definite: 'улица' },
  { word: 'магазин', meaning: 'Store', plural: 'магазины', indefinite: 'магазин', definite: 'магазин' },
  { word: 'ресторан', meaning: 'Restaurant', plural: 'рестораны', indefinite: 'ресторан', definite: 'ресторан' },
  { word: 'парк', meaning: 'Park', plural: 'парки', indefinite: 'парк', definite: 'парк' },
  { word: 'кино', meaning: 'Cinema', plural: 'кино', indefinite: 'кино', definite: 'кино' },
  { word: 'театр', meaning: 'Theater', plural: 'театры', indefinite: 'театр', definite: 'театр' },
  { word: 'музей', meaning: 'Museum', plural: 'музеи', indefinite: 'музей', definite: 'музей' },
  { word: 'выставка', meaning: 'Exhibition', plural: 'выставки', indefinite: 'выставка', definite: 'выставка' },
  { word: 'спорт', meaning: 'Sport', plural: 'спорт', indefinite: 'спорт', definite: 'спорт' },
  { word: 'игра', meaning: 'Game', plural: 'игры', indefinite: 'игра', definite: 'игра' },
  { word: 'футбол', meaning: 'Football', plural: 'футболы', indefinite: 'футбол', definite: 'футбол' },
  { word: 'баскетбол', meaning: 'Basketball', plural: 'баскетболы', indefinite: 'баскетбол', definite: 'баскетбол' },
  { word: 'тренировка', meaning: 'Training', plural: 'тренировки', indefinite: 'тренировка', definite: 'тренировка' },
  { word: 'чемпионат', meaning: 'Championship', plural: 'чемпионаты', indefinite: 'чемпионат', definite: 'чемпионат' },
  { word: 'победа', meaning: 'Victory', plural: 'победы', indefinite: 'победа', definite: 'победа' },
  { word: 'поражение', meaning: 'Defeat', plural: 'поражения', indefinite: 'поражение', definite: 'поражение' },
  { word: 'команда', meaning: 'Team', plural: 'команды', indefinite: 'команда', definite: 'команда' },
  { word: 'игрок', meaning: 'Player', plural: 'игроки', indefinite: 'игрок', definite: 'игрок' },
  { word: 'тренер', meaning: 'Coach', plural: 'тренеры', indefinite: 'тренер', definite: 'тренер' },
  { word: 'судья', meaning: 'Referee', plural: 'судьи', indefinite: 'судья', definite: 'судья' },
  { word: 'стадион', meaning: 'Stadium', plural: 'стадионы', indefinite: 'стадион', definite: 'стадион' },
  { word: 'площадка', meaning: 'Court', plural: 'площадки', indefinite: 'площадка', definite: 'площадка' },
  { word: 'экипировка', meaning: 'Equipment', plural: 'экипировки', indefinite: 'экипировка', definite: 'экипировка' },
  { word: 'мяч', meaning: 'Ball', plural: 'мячи', indefinite: 'мяч', definite: 'мяч' },
  { word: 'трофей', meaning: 'Trophy', plural: 'трофеи', indefinite: 'трофей', definite: 'трофей' },
  { word: 'праздник', meaning: 'Holiday', plural: 'праздники', indefinite: 'праздник', definite: 'праздник' },
  { word: 'новости', meaning: 'News', plural: 'новости', indefinite: 'новости', definite: 'новости' },
  { word: 'погода', meaning: 'Weather', plural: 'погоды', indefinite: 'погода', definite: 'погода' },
  { word: 'сезон', meaning: 'Season', plural: 'сезоны', indefinite: 'сезон', definite: 'сезон' },
  { word: 'климат', meaning: 'Climate', plural: 'климаты', indefinite: 'климат', definite: 'климат' },
  { word: 'экология', meaning: 'Ecology', plural: 'экологии', indefinite: 'экология', definite: 'экология' },
  { word: 'здоровье', meaning: 'Health', plural: 'здоровья', indefinite: 'здоровье', definite: 'здоровье' },
];

module.exports = { QuizData, frenchWordList };