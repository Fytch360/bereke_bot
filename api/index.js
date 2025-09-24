require('dotenv').config();
const { Telegraf, Markup, session, Scenes } = require('telegraf');
const axios = require('axios');

const bot = new Telegraf(process.env.BOT_TOKEN);
const stage = new Scenes.Stage();

// Main menu keyboard
const mainMenu = Markup.keyboard([
  ['1) Задать вопрос командам в ART', 
  '2) Задать вопрос конкурсантам'],
  ['3) Оставить ОС по организации мероприятия',
  //  '4) Голосование за лучший ART'
  ]
]).resize();

// ART options (shared for questions and voting)
const artOptions = [
  'ART «Premium»', 
  'ART «BAU»',
  'ART «Кредитной ценности»',
  'ART «ВЭД»',
  'ART «Daily Banking для бизнеса»',
  'ART «Business Platform»',
  'VS «Цифровой Факторинг»',
  'VS «ЦАГ»',
 
];

// Konkurs options
const konkursOptions = [
  'Беззалоговый кэш кредит - Гуняшева Мила',
  'Cashback Crew - Рахимов Канат', 
  'FX - Байкенже Сабина', 
  'Контакт-центр и ART CRM - Ривкинд Илья и Зацепилова Алла',
  'Беззалоговый кэш кредит - Рсалиева Гульмира и Казахбаева Гульнара',
  'Беззалоговый кэш кредит - Гуняшева Мила',
  'Platform Team - Коряков Владилен',
  'Core Feature Team - Рахматулина Дана',
  'Депозиты для бизнеса - Торгаева Анастасия',
  'Переводы в тенге - Жокебаев Кайнар',
  'Гос.сервисы - Мухаметкалиева Айым',
  'Валютные договора - Баратова Марал',
  'ВЭД Team - Дамира Ержанова',
  'ART CRM и Операционный Блок - Самарина Снежана и Кузьминых Татьяна',

];

// --- Scene for Ask ART (questions) ---
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

// --- Scene for Ask Konkurs (questions) ---
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

// --- Scene for Feedback ---
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

// --- New Scene for Voting ART ---
// const voteArtScene = new Scenes.WizardScene(
//   'VOTE_ART_SCENE',
//   async (ctx) => {
//     await ctx.reply('Выберите лучший ART для голосования:', Markup.keyboard(artOptions).resize());
//     return ctx.wizard.next();
//   },
//   async (ctx) => {
//     const option = ctx.message.text;
//     if (!artOptions.includes(option)) {
//       await ctx.reply('Выберите вариант:', Markup.keyboard(artOptions).resize());
//       return; // Stay in this step
//     }
//     const user = ctx.from;
//     const data = {
//       userId: user.id,
//       username: user.username || 'N/A',
//       firstName: user.first_name || 'N/A',
//       option: option, // This is the vote
//       message: 'Vote', // Placeholder, since no custom message
//       type: 'VOTE_ART' // New type for n8n to branch to 'голосование' sheet
//     };
//     try {
//       await axios.post('https://fytch.app.n8n.cloud/webhook/telegram-bot-data', data);
//     } catch (error) {
//       console.error('Error sending to n8n:', error);
//     }
//     await ctx.reply('Спасибо за ваш голос!');
//     await ctx.reply('Вернуться в главное меню.', mainMenu);
//     return ctx.scene.leave();
//   }
// );
// stage.register(voteArtScene);

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
// bot.hears('4) Голосование за лучший ART', (ctx) => ctx.scene.enter('VOTE_ART_SCENE'));

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