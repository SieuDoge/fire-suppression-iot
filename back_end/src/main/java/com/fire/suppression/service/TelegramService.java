package com.fire.suppression.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

import jakarta.annotation.PostConstruct;
import java.util.Map;

@Service
@Slf4j
public class TelegramService extends TelegramLongPollingBot {

    @Value("${telegram.bot.username}")
    private String botUsername;

    @Value("${telegram.bot.token}")
    private String botToken;

    @Value("${telegram.chat.id}")
    private String chatId;

    private final MqttService mqttService;
    private final ObjectMapper objectMapper;

    public TelegramService(@Lazy MqttService mqttService, ObjectMapper objectMapper) {
        this.mqttService = mqttService;
        this.objectMapper = objectMapper;
    }

    @Override
    public String getBotUsername() {
        return botUsername;
    }

    @Override
    public String getBotToken() {
        return botToken;
    }

    @Override
    public void onUpdateReceived(Update update) {
        if (update.hasMessage() && update.getMessage().hasText()) {
            String messageText = update.getMessage().getText();
            long receivedChatId = update.getMessage().getChatId();

            log.info("Received message from Telegram chat {}: {}", receivedChatId, messageText);

            if (messageText.startsWith("/start")) {
                sendReply(receivedChatId, "Welcome to Fire Suppression Bot! Use /id to get chat ID or /control <action> <value>.");
            } else if (messageText.equals("/id")) {
                sendReply(receivedChatId, "Your Chat ID is: " + receivedChatId);
            } else if (messageText.startsWith("/control")) {
                handleControlCommand(messageText, receivedChatId);
            }
        }
    }

    private void handleControlCommand(String text, long replyToChatId) {
        String[] parts = text.split(" ");
        if (parts.length >= 3) {
            String action = parts[1];
            String value = parts[2];
            try {
                String payload = objectMapper.writeValueAsString(
                        Map.of("action", action, "value", value));
                mqttService.publish("fire/control", payload);
                sendReply(replyToChatId, "✅ Sent control command: " + action + "=" + value);
            } catch (Exception e) {
                sendReply(replyToChatId, "❌ Error: " + e.getMessage());
            }
        } else {
            sendReply(replyToChatId, "❌ Invalid command. Usage: /control <action> <value>");
        }
    }

    public void sendNotification(String message) {
        if (chatId == null || chatId.isEmpty() || chatId.equals("your_chat_id")) {
            log.warn("Telegram Chat ID not configured. Notification not sent: {}", message);
            return;
        }

        SendMessage sendMessage = new SendMessage();
        sendMessage.setChatId(chatId);
        sendMessage.setText(message);
        sendMessage.setParseMode("Markdown");

        try {
            execute(sendMessage);
            log.info("Sent Telegram notification: {}", message);
        } catch (TelegramApiException e) {
            log.error("Failed to send Telegram notification: {}", e.getMessage());
        }
    }
    
    @PostConstruct
    public void init() {
        log.info("Telegram Bot initialized with username: {}", botUsername);
    }

    /**
     * Gửi tin nhắn tới một chatId cụ thể (reply cho người nhắn bot)
     */
    private void sendReply(long targetChatId, String message) {
        SendMessage sendMessage = new SendMessage();
        sendMessage.setChatId(String.valueOf(targetChatId));
        sendMessage.setText(message);

        try {
            execute(sendMessage);
        } catch (TelegramApiException e) {
            log.error("Failed to send Telegram reply: {}", e.getMessage());
        }
    }
}
