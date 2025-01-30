const { EmbedBuilder } = require('discord.js');

module.exports = (client) => {
    client.on('messageCreate', async (message) => {
        // Check if the message is from a DM (message.guild === null means it's a DM)
        if (message.guild === null) {
            // Don't respond if the message is from a bot
            if (message.author.bot) return;

            // Create an embed with information about the bot
            const embed = new EmbedBuilder()
                .setTitle('About Frau Lingua - Your Language Learning Companion')
                .setDescription(
                    'Welcome to Frau Lingua, the custom-built Discord bot designed specifically for the LinguaLounge community. Whether you\'re learning German, French, or Russian, Frau Lingua is here to make your language learning experience engaging, interactive, and fun!\n\n' +

                    '**What is Frau Lingua?**\n' +
                    'Frau Lingua is your friendly and interactive language assistant on the LinguaLounge server. It provides a variety of features to help you learn and practice German, French, and Russian, including quizzes, vocabulary building tools, study resources, and more. With Frau Lingua by your side, you\'ll stay motivated and track your progress as you master your language skills.\n\n' +

                    '**Key Features**\n' +
                    '**1. Interactive Quizzes**\n' +
                    'Command: !quiz\n' +
                    'Test your knowledge with language quizzes in German, French, and Russian. Select your desired language and level, answer five timed questions, and get a detailed result to help you improve. Perfect for learners of all levels! Bonus points are awarded for perfect scores, and your rankings are tracked in the server leaderboard.\n\n' +

                    '**2. Word of the Day**\n' +
                    'Stay motivated and expand your vocabulary with the Word of the Day feature. Every day, Frau Lingua sends a new word in each language at specific times, helping you learn a new word each day.\n' +
                    '• German: Sent at <t:1737673200:t> (your timezone)\n' +
                    '• French: Sent at <t:1737673200:t> (your timezone)\n' +
                    '• Russian: Sent at <t:1737669600:t> (your timezone)\n\n' +

                    '**3. Study Resources**\n' +
                    'Command: !resources\n' +
                    'Access a collection of useful study materials to enhance your learning. From websites to books and online tools, Frau Lingua provides a variety of resources for German, French, and Russian learners.\n\n' +

                    '**4. Suggestions & Feedback**\n' +
                    'Command: !suggestion\n' +
                    'Share your ideas or suggestions for improving the server with the moderators. Frau Lingua makes it easy to contribute to the growth of LinguaLounge.\n\n' +

                    '**5. Reporting Issues**\n' +
                    'Command: !ticket\n' +
                    'Need to report an issue or a user? Frau Lingua allows you to submit a ticket to the moderators so they can handle it quickly and efficiently.\n\n' +

                    '**6. Leaderboard**\n' +
                    'Command: !leaderboard\n' +
                    'Want to see how you\'re doing compared to others? The leaderboard tracks quiz results and ranks users by their performance in each language and level. Special bonus points are given for perfect scores!\n\n' +

                    '**Why Choose Frau Lingua?**\n' +
                    'Frau Lingua is more than just a bot—it\'s a language-learning assistant designed to keep you engaged and motivated as you learn German, French, or Russian. With daily vocabulary, quizzes, study resources, and a feedback system, Frau Lingua provides all the tools you need to improve your language skills in a fun and interactive way.\n\n' +

                    '**Start Learning with Frau Lingua Today!**\n' +
                    'Ready to begin? Type !quiz to start your first quiz, or use !resources, !suggestion, or !ticket for more features. Frau Lingua is here to support your language learning journey every step of the way!\n\n' +
                    'Happy learning, and good luck!'
                )
                .setColor('#acf508') // Set embed color to #acf508
                .setFooter({ text: 'Frau Lingua - Your Language Learning Companion' });

            try {
                await message.channel.send({ embeds: [embed] });
            } catch (error) {
                console.error('Error responding to DM:', error);
            }
        }
    });
};