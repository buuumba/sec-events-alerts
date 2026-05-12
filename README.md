# Security Events & Alerts

Демо-версия микросервисного приложения на NestJS для отслеживания событий безопасности. Система фиксирует неудачные попытки входа, определяет возможные brute-force атаки и отправляет уведомления в Telegram через RabbitMQ.

## Архитектура

| Сервис                 | Порт  | Описание                                                                         |
| ---------------------- | ----- | -------------------------------------------------------------------------------- |
| auth-service           | 4000  | Аутентификация, brute-force detection, события                                   |
| notification-service   | 4001  | Потребление событий, отправка в Telegram                                         |
| PostgreSQL             | 5435  | Единая БД, схемы `auth` и `notification` (demo; в prod лучше отдельные инстансы) |
| RabbitMQ               | 5672  | Брокер сообщений                                                                 |
| RabbitMQ Management UI | 15672 | Веб-панель мониторинга очередей                                                  |

## Стек

- **Backend:** NestJS, TypeScript, TypeORM
- **Message Broker:** RabbitMQ (`@golevelup/nestjs-rabbitmq`)
- **Database:** PostgreSQL 16
- **Auth:** JWT, Passport, bcrypt
- **API Docs:** Swagger (`@nestjs/swagger`)
- **Notifications:** Telegram Bot API
- **Infrastructure:** Docker, Docker Compose

## Запуск проекта

### Предварительные требования

- Docker и Docker Compose
- Telegram-бот и чат для получения уведомлений (см. раздел [Telegram](#telegram))

### 1. Настроить `.env`

```powershell
copy .env.example .env
```

Заполнить обязательные переменные:

```env
TELEGRAM_BOT_TOKEN=<токен от BotFather>
TELEGRAM_CHAT_ID=<id канала или чата, например @my_channel>
JWT_SECRET=<произвольный секрет>
```

### 2. Запустить

```powershell
docker compose up --build
```

Команда поднимет PostgreSQL, RabbitMQ и оба сервиса. Миграции запускаются автоматически при старте.

### 3. Проверить

- **Swagger UI:** http://localhost:4000/api/docs
- **Health auth:** http://localhost:4000/health
- **Health notification:** http://localhost:4001/health
- **RabbitMQ Management:** http://localhost:15672 (guest / guest)

### Полный сброс

```powershell
docker compose down -v
docker compose up --build
```

---

## Тестирование API

Все эндпоинты доступны через **Swagger UI** (`http://localhost:4000/api/docs`) или Postman.

### Регистрация

```
POST http://localhost:4000/auth/register
Content-Type: application/json

{
  "email": "test@test.com",
  "password": "Password123!"
}
```

Ответ: `{ "accessToken": "eyJ..." }`

### Логин

```
POST http://localhost:4000/auth/login
Content-Type: application/json

{
  "email": "test@test.com",
  "password": "Password123!"
}
```

### Профиль (требуется JWT)

```
GET http://localhost:4000/auth/me
Authorization: Bearer <accessToken>
```

### Смена пароля (требуется JWT)

```
PATCH http://localhost:4000/auth/change-password
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "currentPassword": "Password123!",
  "newPassword": "NewPassword456!"
}
```

### Brute-force тест

Отправить 5+ раз логин с неверным паролем. После превышения порога аккаунт блокируется, событие публикуется в RabbitMQ и notification-service отправляет уведомление в Telegram:

```
POST http://localhost:4000/auth/login
Content-Type: application/json

{
  "email": "test@test.com",
  "password": "wrong-password"
}
```

### Симуляция подозрительного IP (требуется JWT)

```
POST http://localhost:4000/auth/simulate/suspicious-ip
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "ip": "185.220.101.42"
}
```

Немедленно генерирует событие `suspicious_ip` → уведомление в Telegram. Удобно для быстрой проверки без ожидания brute-force.

---

## RabbitMQ

**Management UI:** http://localhost:15672 — логин `guest` / `guest`

Здесь можно посмотреть состояние exchanges, очередей и live message rates после вызова эндпоинтов.

### Топология

| Exchange                | Type   | Описание                         |
| ----------------------- | ------ | -------------------------------- |
| `security.events`       | topic  | Основной exchange для событий    |
| `security.events.retry` | topic  | Retry exchange (задержка 10 сек) |
| `security.events.dlx`   | fanout | Dead Letter Exchange             |

| Queue                          | Описание                                      |
| ------------------------------ | --------------------------------------------- |
| `security.notifications`       | Основная очередь → notification-service       |
| `security.notifications.retry` | Retry-очередь (TTL 10s → обратно в exchange)  |
| `security.notifications.dlq`   | Dead Letter Queue (после 3 неудачных попыток) |

### Routing Key

Формат: `security.<severity>` — routing key формируется по уровню критичности события, а не по типу:

| Routing Key         | Severity | Примеры событий        |
| ------------------- | -------- | ---------------------- |
| `security.low`      | LOW      | `password_changed`     |
| `security.medium`   | MEDIUM   | `suspicious_ip`        |
| `security.high`     | HIGH     | `brute_force_detected` |
| `security.critical` | CRITICAL | `account_locked`       |

Consumer подписан на wildcard `security.*` - получает события всех уровней.

## Telegram

Бот отправляет форматированные уведомления при каждом security-событии.

### Быстрое подключение к существующей демо-группе

Чтобы не создавать собственного бота, можно подключиться к уже существующей тестовой группе:

1. Вступить в группу: https://t.me/sec_events_demo
2. В `.env` указать готовые креды:

```env
TELEGRAM_BOT_TOKEN=по запросу
TELEGRAM_CHAT_ID=@sec_events_demo
```

3. Запустить проект и вызвать любой эндпоинт — уведомления появятся в группе.

### Создание собственного бота

1. Написать [@BotFather](https://t.me/BotFather) → `/newbot` → получить токен
2. Создать канал или группу в Telegram
3. Добавить бота как администратора
4. Указать `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID` в `.env`

`TELEGRAM_CHAT_ID` может быть:

- Username канала: `@my_channel`
- Числовой ID чата: `-1001234567890` (получить через [@userinfobot](https://t.me/userinfobot))

---

## Структура проекта

```
sec-events-alerts/
├── apps/
│   ├── auth-service/         # Аутентификация, brute-force, события
│   └── notification-service/ # Consumer, Telegram-отправка
├── libs/
│   └── shared/               # Общие типы, константы, конфиги
├── docker-compose.yml
├── Dockerfile                # Multi-stage, параметризован через ARG

```

---

## минимальный TODO

- [ ] Unit/E2E тесты (Jest)
- [ ] Rate limiting на эндпоинтах
- [ ] Разделение БД per-service (отдельные PostgreSQL инстансы)
- [ ] Graceful shutdown с корректным завершением текущих сообщений RabbitMQ
- [ ] Email-уведомления как альтернативный канал доставки
- [ ] Dashboard для просмотра истории событий безопасности
- [ ] Pre-commit линтер (husky + lint-staged)
