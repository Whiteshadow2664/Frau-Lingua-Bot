const {
    AttachmentBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require("discord.js");
const { createCanvas } = require("canvas");

module.exports = {
    name: "stat",

    async execute(message, client) {

        // ---------- ROLE IDS ----------
        const germanRoleId = "1225361583857860699";
        const frenchRoleId = "1225361440869715979";
        const russianRoleId = "1303662239986876447";

        const nativeGermanId = "1271105524359893128";
        const nativeFrenchId = "1277560168959184961";
        const nativeRussianId = "1303662494367092736";

        const guild = message.guild;
        await guild.members.fetch();

        // ---------- LANGUAGE ROLE COUNTS ----------
        const germanCount = guild.members.cache.filter(m => m.roles.cache.has(germanRoleId)).size;
        const frenchCount = guild.members.cache.filter(m => m.roles.cache.has(frenchRoleId)).size;
        const russianCount = guild.members.cache.filter(m => m.roles.cache.has(russianRoleId)).size;

        // ---------- NATIVE ROLE COUNTS ----------
        const nativeGermanCount = guild.members.cache.filter(m => m.roles.cache.has(nativeGermanId)).size;
        const nativeFrenchCount = guild.members.cache.filter(m => m.roles.cache.has(nativeFrenchId)).size;
        const nativeRussianCount = guild.members.cache.filter(m => m.roles.cache.has(nativeRussianId)).size;

        // ---------- COLORS ----------
        const languageColors = {
            german: '#e67e22',
            french: '#0043ff',
            russian: '#3498db'
        };

        const nativeColors = {
            german: '#f4ed09',
            french: '#09ebf6',
            russian: '#7907ff'
        };

        // ---------- PIE CHART CREATOR ----------
        function createPieChart(data, labels, colorSet, filename) {
            const width = 600;
            const height = 600;
            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext("2d");

            ctx.clearRect(0, 0, width, height);

            const total = data.reduce((a, b) => a + b, 0);
            let start = -0.5 * Math.PI;
            const colors = Object.values(colorSet);

            // Draw pie slices with black border
            data.forEach((value, i) => {
                const slice = (value / total) * (Math.PI * 2);

                ctx.beginPath();
                ctx.moveTo(width / 2, height / 2);
                ctx.arc(width / 2, height / 2, 250, start, start + slice);
                ctx.closePath();

                ctx.fillStyle = colors[i];
                ctx.fill();

                ctx.lineWidth = 3; // border thickness
                ctx.strokeStyle = "#000000"; // black border
                ctx.stroke();

                start += slice;
            });

            // Draw legend box
            const legendX = 20;
            let legendY = 40;
            ctx.font = "bold 22px 'Times New Roman'";
            ctx.textAlign = "left";

            labels.forEach((label, i) => {
                // colored square
                ctx.fillStyle = colors[i];
                ctx.fillRect(legendX, legendY - 18, 30, 18);

                // label text
                ctx.fillStyle = "#ffffff";
                ctx.fillText(`${label}: ${data[i]}`, legendX + 40, legendY);

                legendY += 40;
            });

            return new AttachmentBuilder(canvas.toBuffer(), { name: filename });
        }

        // --- CHARTS ---
        const chart1 = createPieChart(
            [germanCount, frenchCount, russianCount],
            ["German", "French", "Russian"],
            languageColors,
            "language_roles.png"
        );

        const chart2 = createPieChart(
            [nativeGermanCount, nativeFrenchCount, nativeRussianCount],
            ["Native German", "Native French", "Native Russian"],
            nativeColors,
            "native_roles.png"
        );

        // ---------- BUTTONS ----------
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("prev")
                .setLabel("◀️")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId("next")
                .setLabel("▶️")
                .setStyle(ButtonStyle.Secondary)
        );

        // ---------- EMBEDS ----------
        const embed1 = new EmbedBuilder()
            .setTitle("📊 Language Roles Statistics")
            .setColor("#acf508")
            .setImage("attachment://language_roles.png");

        const embed2 = new EmbedBuilder()
            .setTitle("📊 Native Roles Statistics")
            .setColor("#acf508")
            .setImage("attachment://native_roles.png");

        let currentPage = 0;
        const pages = [
            { embed: embed1, files: [chart1] },
            { embed: embed2, files: [chart2] }
        ];

        // ---------- SEND FIRST PAGE ----------
        const msg = await message.reply({
            embeds: [pages[0].embed],
            files: pages[0].files,
            components: [row]
        });

        // ---------- COLLECTOR ----------
        const collector = msg.createMessageComponentCollector({ time: 30000 });

        collector.on("collect", async (interaction) => {
            if (interaction.user.id !== message.author.id) {
                return interaction.reply({ content: "This panel is not for you!", ephemeral: true });
            }

            currentPage = interaction.customId === "next"
                ? (currentPage + 1) % pages.length
                : (currentPage - 1 + pages.length) % pages.length;

            await interaction.update({
                embeds: [pages[currentPage].embed],
                files: pages[currentPage].files,
                components: [row]
            });
        });

        collector.on("end", async () => {
            const disabledRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("prev")
                    .setLabel("◀️")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true),

                new ButtonBuilder()
                    .setCustomId("next")
                    .setLabel("▶️")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true)
            );

            await msg.edit({ components: [disabledRow] });
        });
    }
};