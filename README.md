🏥 MedService Frontend
<p align="center"> <b>Платформа аналитики отзывов и управления клиентской обратной связью</b><br/> Built with Next.js 14 • TypeScript • Tailwind • Zustand </p>
🚀 О проекте

MedService Frontend — это современный интерфейс аналитической системы для медицинских сетей.

Система позволяет:

анализировать отзывы пациентов

отслеживать NPS и среднюю оценку

управлять статусами запросов

контролировать жалобы

работать с филиалами в едином интерфейсе

Проект построен с использованием App Router архитектуры Next.js 14
и спроектирован с учётом масштабируемости под реальный backend.

✨ Основной функционал
📊 Аналитика

KPI-панель (запросы, отзывы, жалобы, рейтинг)

Динамика NPS

Удовлетворённость

Графики

Аналитика по филиалам

Выбор филиала через глобальный store

💬 Отзывы и запросы

Раздел включает:

✅ Опубликованные отзывы

🚨 Перехваченные жалобы

📌 Статусы запросов

Фильтрацию по площадкам (Яндекс, Google, 2GIS и др.)

Табличное отображение данных

⚙ Настройки

Профиль пользователя

Заготовка под системные параметры

Подготовка к интеграции авторизации

🧠 Архитектура

Проект использует:

Next.js App Router

Zustand для глобального состояния (филиалы)

Модульную структуру страниц

Единый layout с Sidebar + Header + Footer

Чистое разделение UI / логики

📁 Структура проекта
MEDSERVICE-FRONTEND
│
├── public/
│   ├── Icons/                 # SVG иконки сайдбара
│   └── images/
│
├── src/
│   ├── app/
│   │   ├── (app)/
│   │   │   ├── analytics/
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── reviews-and-requests/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── intercepted-complaints/
│   │   │   │   ├── published-reviews/
│   │   │   │   └── request-statuses/
│   │   │   │
│   │   │   └── settings/
│   │   │
│   │   ├── (auth)/            # login / auth
│   │   └── (standalone)/
│   │       └── branches/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   └── Brand.tsx
│   │
│   ├── lib/
│   │   ├── api.ts
│   │   ├── branchesStore.ts
│   │   ├── date.ts
│   │   └── cn.ts
│   │
│   └── types/
│       └── analytics.ts
│
├── package.json
├── next.config.ts
└── README.md

🧩 Технологический стек
Технология	Назначение
Next.js 14	Framework
React 18	UI
TypeScript	Типизация
Tailwind CSS	Стили
Zustand	Глобальное состояние
App Router	Роутинг
⚡ Локальный запуск
npm install
npm run dev


Открыть:

http://localhost:3000

🔮 Roadmap

🔐 Подключение полноценной авторизации

🌐 Интеграция backend API

📊 Реальные графики через chart library

📥 Экспорт отчётов

📈 Улучшение производительности списков

🎨 Дизайн-токены и UI system

👨‍💻 Автор

Frontend архитектура и реализация:
MedService Team

<p align="center"> <sub>Made with ❤️ using Next.js</sub> </p> ```
