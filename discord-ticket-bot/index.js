require('dotenv').config();
const { Client, GatewayIntentBits, Partials, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionsBitField, EmbedBuilder } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel]
});

const TICKET_CATEGORY_ID = process.env.TICKET_CATEGORY_ID;

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    console.log('Bot is ready to manage tickets.');
});

// Listen for messages to setup the ticket panel
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // Command to create the panel: !setup-tickets
    if (message.content === '!setup-tickets') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('You must be an Administrator to set up tickets.');
        }

        const embed = new EmbedBuilder()
            .setTitle('Support Tickets')
            .setDescription('Click the button below to open a ticket!')
            .setColor('Blue');

        const button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('create_ticket')
                    .setLabel('Open a Ticket')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🎫')
            );

        await message.channel.send({ embeds: [embed], components: [button] });
        await message.delete();
    }
});

// Handle button interactions
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'create_ticket') {
        const channelName = `ticket-${interaction.user.username}`;
        
        // Check if the user already has a ticket open
        const existingChannel = interaction.guild.channels.cache.find(c => c.name === channelName.toLowerCase());
        if (existingChannel) {
            return interaction.reply({ content: `You already have an open ticket: ${existingChannel}`, ephemeral: true });
        }

        try {
            // Create the ticket channel
            const ticketChannel = await interaction.guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: TICKET_CATEGORY_ID || null,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id, // @everyone role
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: interaction.user.id, // User who clicked the button
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
                    },
                    {
                        id: client.user.id, // The bot itself
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.ManageChannels],
                    }
                ],
            });

            const welcomeEmbed = new EmbedBuilder()
                .setTitle('Ticket Opened')
                .setDescription(`Welcome to your ticket, ${interaction.user}! Support will be with you shortly.\n\nClick the button below to close this ticket.`)
                .setColor('Green');

            const closeButton = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('close_ticket')
                        .setLabel('Close Ticket')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('🔒')
                );

            await ticketChannel.send({ content: `${interaction.user}`, embeds: [welcomeEmbed], components: [closeButton] });

            await interaction.reply({ content: `Your ticket has been created: ${ticketChannel}`, ephemeral: true });
        } catch (error) {
            console.error('Error creating ticket:', error);
            await interaction.reply({ content: 'There was an error creating the ticket. Please ensure I have "Manage Channels" permissions.', ephemeral: true });
        }
    } else if (interaction.customId === 'close_ticket') {
        // You can uncomment the lines below to limit who can close tickets!
        /* 
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return interaction.reply({ content: 'You do not have permission to close tickets.', ephemeral: true });
        }
        */

        await interaction.reply('Ticket will be closed in 5 seconds...');
        setTimeout(() => {
            interaction.channel.delete().catch(console.error);
        }, 5000);
    }
});

client.login(process.env.DISCORD_TOKEN);
