require('dotenv').config();
const { Telegraf, Markup, session, Scenes } = require('telegraf');
const axios = require('axios');

const bot = new Telegraf(process.env.BOT_TOKEN);
const stage = new Scenes.Stage();

// Main menu keyboard
const mainMenu = Markup.keyboard([
  ['1) Задать вопрос командам в ART', '2) Задать вопрос конкурсантам'],
  ['3) Оставить ОС по организации мероприятия']
]).resize();

// ART options
const artOptions = [
  'ART «Индустриальной разработки»', 
  'ART «IT RUN»', 
  'ART «CRM»', 
  'ART «ML&AI»',
`VS «Классическое
  кредитование ЮЛ и ИП»`,
  'VS «Операционные процессы»',
  'VS «Операционные процессы»',
  'Внешний сайт',
];

// Konkurs options
const konkursOptions = [
  'Premium Digital Office - Кагдин Дмитрий',
  'Бизнес кредитование - Алихан Ботагоз', 
  'Кредитная фабрика - Андрюшин Кирилл', 
  'Классическое кредитование - Алейников Олег',
  'AI-оператор и CRM Premier - Подолян Евгений',
  'Synergy Team - Токмурзаева Ляззат',
  'Валютный контроль - Самарина Снежана',
];

// --- Scene for Ask ART ---
const artScene = new Scenes.WizardScene(
  'ART_SCENE',
  async (ctx) => {
    await ctx.reply('Выберите вариант:', Markup.keyboard(artOptions).resize());
    return ctx.wizard.next();
  },
  async (ctx) => {
    const option = ctx.message.text;
    if (!artOptions.includes(option)) {
      await ctx.reply('Выберите вариант:', Markup.keyboard(artOptions).resize());
      return; // Stay in this step
    }
    ctx.wizard.state.option = option;
    await ctx.reply('Задайте ваш вопрос:', Markup.forceReply());
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
      await axios.post('https://fytch.app.n8n.cloud/webhook/telegram-bot-data', data);
    } catch (error) {
      console.error('Error sending to n8n:', error);
    }
    await ctx.reply('Спасибо!');
    await ctx.reply('Вернуться в главное меню.', mainMenu);
    return ctx.scene.leave();
  }
);
stage.register(artScene);

// --- Scene for Ask Konkurs (similar to ART) ---
const konkursScene = new Scenes.WizardScene(
  'KONKURS_SCENE',
  async (ctx) => {
    await ctx.reply('Выберите вариант:', Markup.keyboard(konkursOptions).resize());
    return ctx.wizard.next();
  },
  async (ctx) => {
    const option = ctx.message.text;
    if (!konkursOptions.includes(option)) {
      await ctx.reply('Выберите вариант:', Markup.keyboard(konkursOptions).resize());
      return; // Stay in this step
    }
    ctx.wizard.state.option = option;
    await ctx.reply('Задайте вопрос:', Markup.forceReply());
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
      await axios.post('https://fytch.app.n8n.cloud/webhook/telegram-bot-data', data);
    } catch (error) {
      console.error('Error sending to n8n:', error);
    }
    await ctx.reply('Спасибо!');
    await ctx.reply('Вернуться в главное меню', mainMenu);
    return ctx.scene.leave();
  }
);
stage.register(konkursScene);

// --- Scene for Feedback (simple) ---
const feedbackScene = new Scenes.BaseScene('FEEDBACK_SCENE');
feedbackScene.enter((ctx) => ctx.reply('Дайте вашу ОС:', Markup.forceReply()));
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
    await axios.post('https://fytch.app.n8n.cloud/webhook/telegram-bot-data', data);
  } catch (error) {
    console.error('Error sending to n8n:', error);
  }
  await ctx.reply('Спасибо за ОС!');
  await ctx.reply('Вернуться в главное меню.', mainMenu);
  return ctx.scene.leave();
});
stage.register(feedbackScene);

// Middleware
bot.use(session());
bot.use(stage.middleware());

// Start command
bot.start((ctx) => ctx.reply(`🎊 Привет! Ты на Big Demo Day Bereke Bank 🚀
Здесь можно задать вопрос поездам или финалистам Делай Береке 3.0
Также по итогам мероприятия ты сможешь оставить обратную связь по организации. 
Каждый вопрос/отзыв = вклад в развитие Банка 💡`, mainMenu));

// Handle menu selections
bot.hears('1) Задать вопрос командам в ART', (ctx) => ctx.scene.enter('ART_SCENE'));
bot.hears('2) Задать вопрос конкурсантам', (ctx) => ctx.scene.enter('KONKURS_SCENE'));
bot.hears('3) Оставить ОС по организации мероприятия', (ctx) => ctx.scene.enter('FEEDBACK_SCENE'));

// Optional: Set webhook on startup (safe for cold starts)
bot.telegram.setWebhook(`https://bereke-bot.vercel.app/bot`);  // Your domain + /bot path

// Vercel serverless handler
module.exports = async (req, res) => {
  // Use Telegraf's built-in webhook callback (handles /bot path via vercel.json)
  const express = require('express');
  const app = express();
  app.use(express.json());
  app.use(bot.webhookCallback('/bot'));

  // For direct handling (alternative to Express if you want lighter)
  if (req.method === 'POST') {
    try {
      await bot.handleUpdate(req.body);
      res.status(200).send('OK');
    } catch (err) {
      console.error('Error handling update:', err);
      res.status(500).send('Internal Error');
    }
  } else {
    res.status(200).send('Telegram Bot is running via webhook!');
  }
};