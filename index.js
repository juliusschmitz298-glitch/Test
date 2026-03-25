require('dotenv').config();
const { Client, GatewayIntentBits, Partials, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder, ChannelType, PermissionsBitField, ButtonBuilder, ButtonStyle, ActivityType } = require('discord.js');
const express = require('express');

// Setting up a dummy web server. Many hosts like Vercel/Render require the app to bind to a port, otherwise they crash.
const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Ticket Bot is Online!'));
app.listen(port, () => console.log(`[Web] Express server listening on port ${port}`));

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    partials: [Partials.Channel]
});

// Settings from .env
const PANEL_CHANNEL_ID = process.env.PANEL_CHANNEL_ID; 
const CATEGORIES = {
    support: process.env.CATEGORY_SUPPORT,
    purchase: process.env.CATEGORY_PURCHASE,
    giveaway: process.env.CATEGORY_GIVEAWAY
};

const BRAND_COLOR = '#2b2d31'; // A modern Discord-native dark theme color

client.once('ready', async () => {
    console.log(`[Discord] Logged in as ${client.user.tag}!`);
    client.user.setActivity('over your Tickets', { type: ActivityType.Watching });

    // Auto-setup the ticket panel in the specified channel on startup
    if (PANEL_CHANNEL_ID) {
        try {
            const channel = await client.channels.fetch(PANEL_CHANNEL_ID);
            if (channel) {
                // Fetch recent messages to avoid sending duplicate panels
                const messages = await channel.messages.fetch({ limit: 10 });
                const existingPanel = messages.find(m => m.author.id === client.user.id && m.embeds.length > 0 && m.components.length > 0);
                
                if (!existingPanel) {
                    await sendTicketPanel(channel);
                }
            }
        } catch (error) {
            console.error("[Discord] Could not fetch the panel channel. Make sure the ID is correct and I have permissions:");
        }
    }
});

// Admin manual command to spawn the panel just in case
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content === '!setup-tickets') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('You must be an Administrator to set up tickets.');
        }
        await sendTicketPanel(message.channel);
        await message.delete();
    }
});

async function sendTicketPanel(channel) {
    const embed = new EmbedBuilder()
        .setTitle('🎫  Welcome to the Support Center')
        .setDescription('Please select the appropriate category below to open a ticket. Our staff will be with you shortly.\n\n**Categories:**\n🛠️ **Support** - General help & questions\n💎 **Purchase** - Buying items or billing issues\n🎉 **Giveaway** - Claiming giveaway prizes')
        .setColor(BRAND_COLOR)
        .setFooter({ text: 'Tickets Powered by Discord Bot', iconURL: channel.client.user.displayAvatarURL() })
        .setTimestamp();

    const selectMenu = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('ticket_category_select')
                .setPlaceholder('Select a ticket category...')
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Support')
                        .setDescription('Need help with something?')
                        .setEmoji('🛠️')
                        .setValue('support'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Purchase')
                        .setDescription('Billing, store questions, and purchases')
                        .setEmoji('💎')
                        .setValue('purchase'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Giveaway')
                        .setDescription('Claim your prize')
                        .setEmoji('🎉')
                        .setValue('giveaway'),
                )
        );

    await channel.send({ embeds: [embed], components: [selectMenu] });
    console.log(`[Discord] Ticket panel sent in #${channel.name}`);
}

client.on('interactionCreate', async (interaction) => {
    // Handle Dropdown Menu Selection
    if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_category_select') {
        const selectedCategory = interaction.values[0];
        
        // Ensure channel names are valid for Discord
        const cleanName = interaction.user.username.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const channelName = `ticket-${cleanName}`;
        
        // Check if the user already has a ticket open
        const existingChannel = interaction.guild.channels.cache.find(c => c.name === channelName);
        if (existingChannel) {
            return interaction.reply({ content: `You already have an open ticket: ${existingChannel.toString()}`, ephemeral: true });
        }

        try {
            // Revert drop-down visual selection for the user
            await interaction.reply({ content: 'Creating your ticket...', ephemeral: true });

            // Create the ticket channel
            const parentId = CATEGORIES[selectedCategory];
            const ticketChannel = await interaction.guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: parentId || null,
                topic: `Ticket Owner: ${interaction.user.id} | Category: ${selectedCategory.toUpperCase()}`,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id, // @everyone role
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: interaction.user.id, // User who created the ticket
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.AttachFiles],
                    },
                    {
                        id: client.user.id, // The bot itself
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.ManageChannels],
                    }
                ],
            });

            // Greet the user within new ticket
            const welcomeEmbed = new EmbedBuilder()
                .setTitle(`${getEmoji(selectedCategory)}  ${selectedCategory.toUpperCase()} TICKET`)
                .setDescription(`Welcome ${interaction.user}!\n\nPlease describe your issue or inquiry in detail in this channel. Our support staff will be with you shortly.\n\n*Click the button below to close this ticket.*`)
                .setColor(BRAND_COLOR)
                .setThumbnail(interaction.user.displayAvatarURL())
                .setTimestamp();

            const controlRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('close_ticket')
                        .setLabel('Close Ticket')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('🔒'),
                    new ButtonBuilder()
                        .setCustomId('claim_ticket')
                        .setLabel('Claim (Staff)')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('📌')
                );

            await ticketChannel.send({ content: `${interaction.user} The staff has been notified.`, embeds: [welcomeEmbed], components: [controlRow] });

            await interaction.editReply({ content: `✅ Your ticket has been created: ${ticketChannel.toString()}` });
        } catch (error) {
            console.error('Error creating ticket:', error);
            await interaction.editReply({ content: '❌ There was an error creating the ticket. Please ensure I have "Manage Channels" permissions.' });
        }
    } 
    
    // Handle Buttons Inside the Ticket
    else if (interaction.isButton()) {
        if (interaction.customId === 'close_ticket') {
            await interaction.reply('🔒 This ticket will be closed and deleted in 5 seconds...');
            setTimeout(() => {
                interaction.channel.delete().catch(console.error);
            }, 5000);
        } else if (interaction.customId === 'claim_ticket') {
            // Only allow users with Manage Messages permission (Staff) to claim
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
                return interaction.reply({ content: 'You do not have permission to claim tickets.', ephemeral: true });
            }
            
            // Remove the claim button so no one else claims it
            const oldRow = interaction.message.components[0];
            const newRow = new ActionRowBuilder().addComponents(
                oldRow.components.find(c => c.customId === 'close_ticket')
            );

            await interaction.message.edit({ components: [newRow] }); 
            
            const claimEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setDescription(`✅ **Ticket claimed by ${interaction.user}**`);

            await interaction.reply({ embeds: [claimEmbed] });

            // Optionally rename the channel to show it's claimed
            const currentName = interaction.channel.name;
            if (currentName.startsWith('ticket-')) {
                await interaction.channel.setName(`claimed-${currentName.split('-')[1]}`).catch(console.error);
            }
        }
    }
});

function getEmoji(category) {
    if (category === 'support') return '🛠️';
    if (category === 'purchase') return '💎';
    if (category === 'giveaway') return '🎉';
    return '🎟️';
}

client.login(process.env.DISCORD_TOKEN);
