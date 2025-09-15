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


// --- Scene for Ask ART ---
const artScene = new Scenes.WizardScene(
  'ART_SCENE',
  async (ctx) => {
    await ctx.reply('Выберите вариант:', Markup.keyboard([
      'ART ТРБ BAU', 
      'ART ТРБ Premium', 
    'ART ВЭД', 
    'ART БММБ Daily Banking для бизнеса',
    'ART БММБ Business Platform',
    'ART Кредитной ценности',
    'ART Индустриальной разработки',
    'ART CRM',
    'ART IT Run',
    'ART ML&AI',
    'ART DATA',
    'VS "ЦАГ"',
    'VS " Цифровой Факторинг"',
    'Интернет эквайринг',
    'VS «Класс. кредит-е ЮЛ и ИП»',
    'VS "Collection"',
    'Операционные процессы',
    'Сайт Банка',
  ]).resize());
    return ctx.wizard.next();
  },
  async (ctx) => {
    const option = ctx.message.text;
    if (![  'ART ТРБ BAU', 
    'ART ТРБ Premium', 
  'ART ВЭД', 
  'ART БММБ Daily Banking для бизнеса',
  'ART БММБ Business Platform',
  'ART Кредитной ценности',
  'ART Индустриальной разработки',
  'ART CRM',
  'ART IT Run',
  'ART ML&AI',
  'ART DATA',
  'VS "ЦАГ"',
  'VS " Цифровой Факторинг"',
  'Интернет эквайринг',
  'VS «Класс. кредит-е ЮЛ и ИП»',
  'VS "Collection"',
  'Операционные процессы',
  'Сайт Банка',].includes(option)) {
      return ctx.reply('Выберите вариант');
    }
    ctx.wizard.state.option = option;
    await ctx.reply('Задайте ваш вопрос:');
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
    await ctx.reply('Выберите вариант:', Markup.keyboard([
      'Правовой модуль - юрист в цифре',
       'Факторинг-эксперт - быстрые решения', 
       'Synergy Team - порядок вместо хаоса', 
       'Premium Digital Office - банкинг нового уровня',
       'FX TRB - премиум-сервис: быстро и удобно',
       'Лояльность ТРБ - забота, которую чувствуешь',
       'B-Invest - AI-инвестиционный помощник',
       'Контакт-центр & CRM - скорость + забота',
       'ЦК ВЭД & CRM - кастомный подход к каждому',
       'LLM-бот - умный помощник, который понимает',
       'Online Onboarding - лёгкий вход в бизнес',
       'Core Platform Team - база цифрового будущего',
       'Core Feature Team - лёгкое переключение компаний',
       'Переводы в тенге - просто и быстро',
       'Валютные договора - битва титанов',
       'Валютный контроль - скорость и гибкость',
       'Гос.сервисы - автоматические уведомления ',
       'Депозиты - капитализация без боли',
       'Конструктор кредитов - под клиента',
       'Сервис отказов - объяснит "почему"',
       'Скоринг решений - ПКБ BML',
       'AI оператор - ИИ работает, мы чилим',
      ]).resize());
    return ctx.wizard.next();
  },
  async (ctx) => {
    const option = ctx.message.text;
    if (![ 'Правовой модуль - юрист в цифре',
    'Факторинг-эксперт - быстрые решения', 
    'Synergy Team - порядок вместо хаоса', 
    'Premium Digital Office - банкинг нового уровня',
    'FX TRB - премиум-сервис: быстро и удобно',
    'Лояльность ТРБ - забота, которую чувствуешь',
    'B-Invest - AI-инвестиционный помощник',
    'Контакт-центр & CRM - скорость + забота',
    'ЦК ВЭД & CRM - кастомный подход к каждому',
    'LLM-бот - умный помощник, который понимает',
    'Online Onboarding - лёгкий вход в бизнес',
    'Core Platform Team - база цифрового будущего',
    'Core Feature Team - лёгкое переключение компаний',
    'Переводы в тенге - просто и быстро',
    'Валютные договора - битва титанов',
    'Валютный контроль - скорость и гибкость',
    'Гос.сервисы - автоматические уведомления ',
    'Депозиты - капитализация без боли',
    'Конструктор кредитов - под клиента',
    'Сервис отказов - объяснит "почему"',
    'Скоринг решений - ПКБ BML',
    'AI оператор - ИИ работает, мы чилим',].includes(option)) {
      return ctx.reply('Выберите вариант');
    }
    ctx.wizard.state.option = option;
    await ctx.reply('Задайте вопрос:');
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
feedbackScene.enter((ctx) => ctx.reply('Дайте вашу ОС:'));
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