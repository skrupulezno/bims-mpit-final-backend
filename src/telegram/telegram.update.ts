import { Update, Start, Ctx } from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';

@Update()
export class TelegramUpdate {
  @Start()
  async start(@Ctx() ctx: Context) {
    return ctx.reply(
      'Добро пожаловать в LoryCRM!',
      Markup.inlineKeyboard([
        [
          Markup.button.webApp('LoryCRM', 'https://bims14.ru'),
        ]
      ])
    );
  }
}
