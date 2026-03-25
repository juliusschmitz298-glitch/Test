# Discord Ticket Bot (Ticket King Style)

A professional Node.js Discord ticket bot using `discord.js` v14 with an integrated Express server for 24/7 cloud deployment.

## Files to Upload to GitHub:
To deploy this bot, drag and drop the following 4 files into your GitHub repository:
1. `index.js`
2. `package.json`
3. `.env.example`
4. `README.md`

**🚨 DO NOT UPLOAD YOUR `.env` FILE! IT CONTAINS YOUR SECRET TOKEN! 🚨**

---

## 🚀 Step-by-Step Deployment on Render.com

Render is perfect for hosting Discord bots 24/7 for free!

1. **Connect GitHub to Render:**
   - Go to [Render.com](https://render.com/) and create a free account.
   - Click the **"New +"** button in the top right and select **"Web Service"**.
   - Under "Connect a repository", click **Connect GitHub** and authorize it.
   - Select your new `discord-ticket-bot` repository from the list.

2. **Configure the Web Service:**
   - **Name:** `my-ticket-bot`
   - **Region:** Choose the one closest to you (e.g., Frankfurt or Ohio)
   - **Branch:** `main`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

3. **Add Your Environment Variables (CRITICAL STEP):**
   - Scroll down on that same page and click **"Advanced"**.
   - Click **"Add Environment Variable"**.
   - Add the following keys and values EXACTLY as shown:
     - **Key:** `DISCORD_TOKEN` | **Value:** `MTQ4NjQ3NDcxNTI2OTgyODY2OQ.GRARru.eI5D08OHQr4WPuaMCGKMoRVLPFVqOe_SidRFs4`
     - **Key:** `PANEL_CHANNEL_ID` | **Value:** `1486473100651532379`
   - *(Optional)* If you have category IDs, add `CATEGORY_SUPPORT`, `CATEGORY_PURCHASE`, and `CATEGORY_GIVEAWAY` with their respective IDs too.

4. **Deploy!**
   - Click the **"Create Web Service"** button at the bottom.
   - Render will now download your code from GitHub, install the files (`npm install`), and boot up the bot (`npm start`).
   - Look at the console logs. Once it says `[Discord] Logged in as...`, your bot is online!

---

### How it Works:
- When the bot turns on, it will automatically post the Ticket King panel in channel `1486473100651532379`.
- Any user can click the dropdown menu to open a private ticket.
- Render will keep this Express web server running so your bot stays online indefinitely. (Free Render tiers spin down after 15 minutes of web inactivity, but you can ping your Render URL using a free service like UptimeRobot to keep it awake 24/7!).
