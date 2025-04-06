const { MessageFlags } = require("discord.js");
const ticket = require("./ticket.js");

module.exports = (client) => {
  // Button interaction for creating a ticket
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === "create_ticket") {
      try {
        await ticket.createTicket(interaction);
      } catch (error) {
        console.error("❌ Error handling interaction:", error);

        if (!interaction.replied && !interaction.deferred) {
          try {
            await interaction.reply({
              content: "❌ An error occurred while processing your request.",
              ephemeral: true,
            });
          } catch (err) {
            console.error("❌ Failed to reply to interaction:", err);
          }
        }
      }
    }
  });

  // Reaction added (for ticket close)
  client.on("messageReactionAdd", async (reaction, user) => {
    if (user.bot) return;

    try {
      // Fetch partials safely
      if (reaction.partial) {
        await reaction.fetch().catch(() => null);
      }

      if (reaction.message.partial) {
        await reaction.message.fetch().catch(() => null);
      }

      // If message doesn't exist (deleted), exit
      if (!reaction.message || !reaction.message.id) return;

      await ticket.handleReactions(reaction, user);
    } catch (error) {
      console.error("❌ Error handling reaction:", error);
    }
  });
};