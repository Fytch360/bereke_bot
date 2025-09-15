require('dotenv').config();
const { Telegraf, Markup, session, Scenes } = require('telegraf');
const axios = require('axios'); // Install with `npm install axios` for HTTP requests to n8n
//***** */
const express = require('express');
const app = express();
app.use(express.json());
app.use(bot.webhookCallback('/bot'));
app.listen(3000, () => console.log('Server running'));
bot.telegram.setWebhook('https://bereke-bot.vercel.app');


const bot = new Telegraf(process.env.BOT_TOKEN);
const stage = new Scenes.Stage();

// Main menu keyboard
const mainMenu = Markup.keyboard([
  ['1) Ask ART', '2) Ask Konkurs'],
  ['3) Feedback']
]).resize();

// --- Scene for Ask ART ---
const artScene = new Scenes.WizardScene(
  'ART_SCENE',
  async (ctx) => {
    await ctx.reply('Choose an option:', Markup.keyboard(['A', 'B', 'C', 'D']).resize());
    return ctx.wizard.next();
  },
  async (ctx) => {
    const option = ctx.message.text;
    if (!['A', 'B', 'C', 'D'].includes(option)) {
      return ctx.reply('Please choose A, B, C, or D.');
    }
    ctx.wizard.state.option = option;
    await ctx.reply('Enter your custom text:');
    return ctx.wizard.next();
  },
  async (ctx) => {
    const message = ctx.message.text;
    const user = ctx.from;
    const data = {
      userId: user.id,
      username: user.username || 'N/A',
      firstName: user.first_name || 'N/A',
      option: ctx.wizard.state.option,
      message: message,
      type: 'ART'
    };
    // Send to n8n webhook (replace with your n8n URL later)
    try {
      await axios.post('YOUR_N8N_WEBHOOK_URL_HERE', data);
    } catch (error) {
      console.error('Error sending to n8n:', error);
    }
    await ctx.reply('Thank you!');
    await ctx.reply('Back to main menu.', mainMenu);
    return ctx.scene.leave();
  }
);
stage.register(artScene);

// --- Scene for Ask Konkurs (similar to ART) ---
const konkursScene = new Scenes.WizardScene(
  'KONKURS_SCENE',
  async (ctx) => {
    await ctx.reply('Choose an option:', Markup.keyboard(['A', 'B', 'C', 'D']).resize());
    return ctx.wizard.next();
  },
  async (ctx) => {
    const option = ctx.message.text;
    if (!['A', 'B', 'C', 'D'].includes(option)) {
      return ctx.reply('Please choose A, B, C, or D.');
    }
    ctx.wizard.state.option = option;
    await ctx.reply('Enter your custom text:');
    return ctx.wizard.next();
  },
  async (ctx) => {
    const message = ctx.message.text;
    const user = ctx.from;
    const data = {
      userId: user.id,
      username: user.username || 'N/A',
      firstName: user.first_name || 'N/A',
      option: ctx.wizard.state.option,
      message: message,
      type: 'KONKURS'
    };
    try {
      await axios.post('YOUR_N8N_WEBHOOK_URL_HERE', data);
    } catch (error) {
      console.error('Error sending to n8n:', error);
    }
    await ctx.reply('Thank you!');
    await ctx.reply('Back to main menu.', mainMenu);
    return ctx.scene.leave();
  }
);
stage.register(konkursScene);

// --- Scene for Feedback (simple) ---
const feedbackScene = new Scenes.BaseScene('FEEDBACK_SCENE');
feedbackScene.enter((ctx) => ctx.reply('Enter your feedback:'));
feedbackScene.on('text', async (ctx) => {
  const message = ctx.message.text;
  const user = ctx.from;
  const data = {
    userId: user.id,
    username: user.username || 'N/A',
    firstName: user.first_name || 'N/A',
    message: message,
    type: 'FEEDBACK'
  };
  try {
    await axios.post('YOUR_N8N_WEBHOOK_URL_HERE', data);
  } catch (error) {
    console.error('Error sending to n8n:', error);
  }
  await ctx.reply('Thank you for your feedback!');
  await ctx.reply('Back to main menu.', mainMenu);
  return ctx.scene.leave();
});
stage.register(feedbackScene);

// Middleware
bot.use(session());
bot.use(stage.middleware());

// Start command
bot.start((ctx) => ctx.reply('Welcome! Choose an option:', mainMenu));

// Handle menu selections
bot.hears('1) Ask ART', (ctx) => ctx.scene.enter('ART_SCENE'));
bot.hears('2) Ask Konkurs', (ctx) => ctx.scene.enter('KONKURS_SCENE'));
bot.hears('3) Feedback', (ctx) => ctx.scene.enter('FEEDBACK_SCENE'));

// Launch bot (polling for local testing)
bot.launch();
console.log('Bot is running...');