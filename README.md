# Solo Leveling Mini

A clean Telegram Mini App starter built with Next.js, React, Tailwind CSS,
shadcn-style components, and `@telegram-apps/sdk-react`.

## Getting Started

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
In development, the Telegram environment is mocked when the app is opened
outside Telegram.

## Telegram

- Client SDK setup lives in `instrumentation-client.ts`, `init.ts`, and `mockEnv.ts`.
- Server-side init data parsing lives in `lib/telegram-validator.tsx`.
- Raw init data is stored in `localStorage.tma` by `components/app-wrapper.tsx`.

## Scripts

- `npm run dev` starts Next.js.
- `npm run build` creates a production build.
- `npm run lint` runs ESLint.
