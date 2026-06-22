<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:hero-dice-agent-rules -->
# HERO DICE AGENT RULES

## Работай экономно (Work Efficiently)
- Перед реализацией определи минимальный необходимый объем файлов
- Не просматривай весь проект, если задача явно не требует аудита всего приложения
- Сосредоточься только на задаче

## Локальные изменения
Если задача локальная:
- Измени только релевантные файлы
- Не выполняй рефакторинг за пределами задания
- Не меняй несвязанный UI
- Не меняй БД или игровую логику без явного разрешения

## Обнаружение сложности
Если обнаружишь, что изменение требует:
- Масштабного рефакторинга
- Миграции данных
- Изменения архитектуры

Тогда:
- Остановись
- Не реализуй workaround
- Верни краткое объяснение проблемы
- Предложи отдельный ANALYSIS TASK

## Отчёт о завершении (Report on Completion)
Всегда выведи:
- **Файлы**: какие файлы были изменены
- **Описание**: краткое описание изменений
- **Проверка**: прошёл ли build/lint

## Стиль коммуникации
- Не описывай долгий процесс работы
- Не выводи весь код, если не запрошено явно
- Будь лаконичен и ясен
<!-- END:hero-dice-agent-rules -->
