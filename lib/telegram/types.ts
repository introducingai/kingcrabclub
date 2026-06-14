export type TelegramChat = {
  id: number;
  type?: string;
  title?: string;
  username?: string;
};

export type TelegramMessage = {
  message_id: number;
  text?: string;
  chat: TelegramChat;
  date?: number;
};

export type TelegramUpdate = {
  update_id: number;
  message?: TelegramMessage;
  channel_post?: TelegramMessage;
};

export type TelegramSendMessageResponse = {
  ok: boolean;
  description?: string;
  result?: TelegramMessage;
};
