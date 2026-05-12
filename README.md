# Security Events & Alerts

Демо-версия микросервисного приложения на NestJS для отслеживания событий безопасности. Система фиксирует неудачные попытки входа, определяет brute-force атаки и отправляет уведомления в Telegram через RabbitMQ.

## Быстрый старт

```powershell
# 1. Скопировать и заполнить конфиг
copy .env.example .env

# 2. Запустить
docker compose up --build
```

**Обязательные переменные в `.env`:**

```env
TELEGRAM_BOT_TOKEN=<токен от BotFather>
TELEGRAM_CHAT_ID=<@username канала или числовой ID>
JWT_SECRET=<произвольный секрет>
```

Миграции запускаются автоматически при старте.

## Сервисы

| Сервис               | Порт  | Описание                                       |
| -------------------- | ----- | ---------------------------------------------- |
| auth-service         | 4000  | Аутентификация, brute-force detection, события |
| notification-service | 4001  | Consumer RabbitMQ, отправка в Telegram         |
| PostgreSQL           | 5432  | Единая БД со схемами `auth` и `notification` (demo; в prod лучше отдельные инстансы) |
| RabbitMQ             | 5672  | Брокер сообщений                               |
| RabbitMQ Management  | 15672 | Веб-панель мониторинга очередей                |

## Стек

- **Backend:** NestJS, TypeScript, TypeORM
- **Message Broker:** RabbitMQ (`@golevelup/nestjs-rabbitmq`)
- **Database:** PostgreSQL 16
- **Auth:** JWT, Passport, bcrypt
- **API Docs:** Swagger (`@nestjs/swagger`)
- **Notifications:** Telegram Bot API
- **Infrastructure:** Docker, Docker Compose

## Команды

```powershell
# Сборка
pnpm build:auth              # Только auth-service
pnpm build:notification      # Только notification-service

# Локальный запуск (без Docker)
pnpm start:auth:dev          # auth-service с watch
pnpm start:notification:dev  # notification-service с watch

# Тесты
pnpm test                    # Все unit-тесты
pnpm test:cov                # С покрытием
pnpm test:e2e                # E2E тесты

# Docker
docker compose up --build    # Запустить всё
docker compose down -v       # Остановить и удалить volumes (полный сброс)
```

## API

Swagger UI: **http://localhost:4000/api/docs**

| Метод | Endpoint                       | Описание                      | Auth |
| ----- | ------------------------------ | ----------------------------- | ---- |
| POST  | `/auth/register`               | Регистрация                   | —    |
| POST  | `/auth/login`                  | Вход, получение JWT           | —    |
| GET   | `/auth/me`                     | Профиль текущего пользователя | JWT  |
| PATCH | `/auth/change-password`        | Смена пароля                  | JWT  |
| POST  | `/auth/simulate/suspicious-ip` | Симуляция подозрительного IP  | JWT  |
| GET   | `/health`                      | Health check                  | —    |

### Brute-force тест

Отправить 5+ раз логин с неверным паролем — аккаунт блокируется, событие публикуется в RabbitMQ, notification-service отправляет уведомление в Telegram.

## RabbitMQ

Management UI: **http://localhost:15672** (guest / guest)

### Топология

| Exchange                | Type   | Описание                         |
| ----------------------- | ------ | -------------------------------- |
| `security.events`       | topic  | Основной exchange для событий    |
| `security.events.retry` | topic  | Retry exchange (задержка 10 сек) |
| `security.events.dlx`   | fanout | Dead Letter Exchange             |

| Queue                          | Описание                                     |
| ------------------------------ | -------------------------------------------- |
| `security.notifications`       | Основная очередь → notification-service      |
| `security.notifications.retry` | Retry-очередь (TTL 10s → обратно в exchange) |
| `security.notifications.dlq`   | Dead Letter Queue (после 3 попыток)          |

### Routing Key

Формат: `security.<severity>`

| Routing Key         | Severity | Примеры событий        |
| ------------------- | -------- | ---------------------- |
| `security.low`      | LOW      | `password_changed`     |
| `security.medium`   | MEDIUM   | `suspicious_ip`        |
| `security.high`     | HIGH     | `brute_force_detected` |
| `security.critical` | CRITICAL | `account_locked`       |

## Telegram

Бот отправляет форматированные уведомления при каждом security-событии.

### Быстрое подключение к тестовой группе

1. Вступить: https://t.me/sec_events_demo
2. Указать в `.env`:

```env
TELEGRAM_BOT_TOKEN=по запросу
TELEGRAM_CHAT_ID=@sec_events_demo
```

### Создание собственного бота

1. [@BotFather](https://t.me/BotFather) → `/newbot` → получить токен
2. Создать канал/группу, добавить бота как администратора
3. Указать `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID` в `.env`

`TELEGRAM_CHAT_ID` — username канала (`@my_channel`) или числовой ID (`-1001234567890`).

## Структура проекта

```
sec-events-alerts/
├── apps/
│   ├── auth-service/         # Аутентификация, brute-force, события
│   └── notification-service/ # Consumer, Telegram-отправка
├── libs/
│   └── shared/               # Общие типы, константы, DTO
├── docker-compose.yml
└── Dockerfile                # Multi-stage, параметризован через ARG SERVICE_NAME
```

## TODO

- [ ] e2e тесты (например testconteiners)
- [ ] Rate limiting на эндпоинтах
- [ ] Graceful shutdown (корректное завершение обработки RabbitMQ-сообщений)
- [ ] Разделение БД per-service (отдельные PostgreSQL инстансы)
- [ ] Email как альтернативный канал уведомлений
- [ ] Dashboard для просмотра истории событий
- [ ] Линтер, Pre-commit hooks (husky + lint-staged)
