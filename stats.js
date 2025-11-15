const {
    AttachmentBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require("discord.js");

const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
require("chart.js/auto");

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

        // ---------- PIE CHART COLORS ----------
        const languageColors = ["#e67e22", "#0043ff", "#3498db"];
        const nativeColors = ["#f4ed09", "#09ebf6", "#7907ff"];

        // CREATE CANVAS
        const creator = new ChartJSNodeCanvas({
            width: 600,
            height: 600,
            backgroundColour: "transparent"
        });

        // PIE CHART GENERATOR
        async function generatePie(labels, data, colors) {
            const config = {
                type: "pie",
                data: {
                    labels,
                    datasets: [{
                        data,
                        backgroundColor: colors
                    }]
                },
                options: {
                    plugins: {
                        legend: {
                            labels: {
                                color: "white",
                                font: { size: 18 }
                            }
                        }
                    }
                }
            };

            return creator.renderToBuffer(config);
        }

        const img1 = await generatePie(
            ["German", "French", "Russian"],
            [germanCount, frenchCount, russianCount],
            languageColors
        );

        const img2 = await generatePie(
            ["Native German", "Native French", "Native Russian"],
            [nativeGermanCount, nativeFrenchCount, nativeRussianCount],
            nativeColors
        );

        const chart1 = new AttachmentBuilder(img1, { name: "language_roles.png" });
        const chart2 = new AttachmentBuilder(img2, { name: "native_roles.png" });

        // ---------- BUTTONS ----------
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("prev").setLabel("◀️").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("next").setLabel("▶️").setStyle(ButtonStyle.Secondary)
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

        const pages = [
            { embed: embed1, files: [chart1] },
            { embed: embed2, files: [chart2] }
        ];

        let page = 0;

        const msg = await message.reply({
            embeds: [pages[0].embed],
            files: pages[0].files,
            components: [row]
        });

        const collector = msg.createMessageComponentCollector({ time: 30000 });

        collector.on("collect", async interaction => {
            if (interaction.user.id !== message.author.id)
                return interaction.reply({ content: "Not for you.", ephemeral: true });

            page = interaction.customId === "next"
                ? (page + 1) % pages.length
                : (page - 1 + pages.length) % pages.length;

            await interaction.update({
                embeds: [pages[page].embed],
                files: pages[page].files,
                components: [row]
            });
        });

        collector.on("end", async () => {
            const disabled = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("prev").setLabel("◀️").setStyle(ButtonStyle.Secondary).setDisabled(true),
                new ButtonBuilder().setCustomId("next").setLabel("▶️").setStyle(ButtonStyle.Secondary).setDisabled(true)
            );

            await msg.edit({ components: [disabled] });
        });
    }
};