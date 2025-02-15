const { EmbedBuilder } = require('discord.js');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to update moderator XP
module.exports.updateModRank = async (userId, username, guild) => {
    try {
        const moderatorRole = guild.roles.cache.find(role => role.name.toLowerCase() === 'moderator');
        if (!moderatorRole) return;

        const member = guild.members.cache.get(userId);
        if (!member || !member.roles.cache.has(moderatorRole.id)) return;

        const roleAssignedAt = member.roles.cache.get(moderatorRole.id).createdAt;

        const { data, error } = await supabase
            .from('mod_rank')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (data) {
            await supabase
                .from('mod_rank')
                .update({ xp: data.xp + 1 })
                .eq('user_id', userId);
        } else {
            await supabase
                .from('mod_rank')
                .insert([{ user_id: userId, username, xp: 1, joined_at: roleAssignedAt }]);
        }
    } catch (err) {
        console.error('Error updating moderator XP:', err);
    }
};

// Function to fetch and display moderator leaderboard
module.exports.execute = async (message) => {
    try {
        const { data: leaderboardData, error } = await supabase
            .from('mod_rank')
            .select('username, xp, joined_at, (xp::float / NULLIF(EXTRACT(DAY FROM NOW() - joined_at), 0)) as avg_xp')
            .order('xp', { ascending: false })
            .limit(10);

        if (error) throw error;
        if (!leaderboardData.length) return message.channel.send('No moderator activity recorded yet.');

        const topUser = leaderboardData[0]; // Get the top-ranked user
        const cheerMessage = `🎉 **${topUser.username} is leading the charge! Keep up the great work!** 🚀`;

        const leaderboardEmbed = new EmbedBuilder()
            .setTitle('Moderator Leaderboard')
            .setColor('#acf508')
            .setDescription(
                leaderboardData.map(
                    (row, index) => `**#${index + 1}** | **${row.username}** - **XP:** ${row.xp} | **AVG:** ${row.avg_xp?.toFixed(2) ?? '0.00'}`
                ).join('\n') + `\n\n${cheerMessage}\n\n**XP** = Total XP | **AVG** = Average XP per day`
            );

        message.channel.send({ embeds: [leaderboardEmbed] });

    } catch (error) {
        console.error('Error fetching moderator leaderboard:', error);
        message.channel.send('An error occurred while retrieving the moderator leaderboard.');
    }
};