import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { TelegramUpdate } from './telegram.update';

@Module({
  imports: [
    TelegrafModule.forRoot({
      token: '7858685809:AAFwTD92e1mFi-F-3Oe42LgKeYgAUo9spQA'
    })
  ],
  providers: [TelegramUpdate],
})
export class TelegramModule {}
