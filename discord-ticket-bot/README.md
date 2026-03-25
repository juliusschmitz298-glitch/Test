# Discord Ticket Bot

A simple, fast Node.js Discord ticket bot using `discord.js` v14.

## Setup Instructions

1. **Install Node.js**: Ensure you have [Node.js](https://nodejs.org/) installed on your computer.
2. **Setup the App**: Open your terminal, navigate to this folder (`C:\Users\juliu\.gemini\antigravity\scratch\discord-ticket-bot`), and run:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   - Create a copy of `.env.example` and name it exactly `.env`.
   - Go to the [Discord Developer Portal](https://discord.com/developers/applications) to create a new Application, add a Bot, and copy the **Bot Token**.
   - Paste your Bot Token into the `.env` file for `DISCORD_TOKEN`.
   - *(Optional)* In Discord Server Settings, copy the ID of the Category where you want tickets to be created and paste it into `TICKET_CATEGORY_ID` in the `.env` file. (Make sure Developer Mode is enabled in your Discord App Settings -> Advanced, to right-click and copy IDs).
4. **Enable Intended Permissions (IMPORTANT)**:
   - On the Discord Developer Portal, go to the **Bot** tab.
   - Scroll down to **Privileged Gateway Intents**.
   - Enable **Message Content Intent** (and Server Members Intent if you want extended functionality later).
5. **Invite Your Bot**:
   - Go to the **OAuth2** -> **URL Generator** tab in the Developer portal.
   - Select scopes: `bot`
   - Select permissions: `Administrator`
   - Copy the generated URL and paste it in your browser to invite the bot to your server.
6. **Run the Bot**:
   - In your terminal, run:
   ```bash
   npm start
   ```

## Usage

In any channel on your server, simply type `!setup-tickets`. The bot will post a nice embed message with an "Open a Ticket" button, and then it will delete your command message. Users can click this button to automatically create temporary, private text-channels where they can talk to the admins!
