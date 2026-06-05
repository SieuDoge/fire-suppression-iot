package com.fire.suppression.config;

import com.fire.suppression.service.TelegramService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.telegram.telegrambots.meta.TelegramBotsApi;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;
import org.telegram.telegrambots.updatesreceivers.DefaultBotSession;

@Configuration
@Slf4j
public class TelegramBotConfig {

    @Value("${telegram.bot.token}")
    private String botToken;

    @Bean
    public TelegramBotsApi telegramBotsApi(TelegramService telegramService) throws TelegramApiException {
        if ("disabled".equals(botToken)) {
            log.warn("Telegram bot is disabled. Skipping registration.");
            return new TelegramBotsApi(DefaultBotSession.class);
        }
        TelegramBotsApi botsApi = new TelegramBotsApi(DefaultBotSession.class);
        botsApi.registerBot(telegramService);
        return botsApi;
    }
}