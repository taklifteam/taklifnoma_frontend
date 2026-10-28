# Taklifnoma — frontend (mijoz sayti)

React 19 + Vite + TypeScript. Node 22 (`nvm use`).

## Ishga tushirish

```sh
nvm use
npm install
cp .env.example .env   # odatda o'zgartirish shart emas
npm run dev            # http://localhost:5173
```

Backend lokalda ishlab turishi kerak. Brauzer so'rovlari `/api/...` ga ketadi, Vite ularni
`API_PROXY_TARGET` ga (backend'ning `HTTP_PORT` i) uzatadi — bitta domen, CORS kerak emas.
`VITE_API_URL` ni bo'sh qoldiring; u faqat API boshqa domenda bo'lgan holat uchun (to'liq manzil,
`/api` siz: `https://api.domen.uz`).

| Buyruq | Nima qiladi |
|---|---|
| `npm run dev` | lokal server |
| `npm run build` | tiplarni tekshiradi va `dist/` ga yig'adi |
| `npm run lint` | ESLint, qatlamlar orasidagi import qoidalari bilan |
| `npm test` | Vitest |
| `npm run gen:api` | `../taklifnoma_backend/api/docs/swagger.json` dan `src/shared/api/types.ts` ni qayta yaratadi |

Backend'da API o'zgarsa: backend'da `make swag-init`, keyin bu yerda `npm run gen:api`. Mos kelmagan
joylar `npm run build` da tip xatosi bo'lib chiqadi.

## Tuzilish

```
src/
├── app/          router, provider'lar, layout'lar (kirish sahifasi, kabinet)
├── pages/        har bir yo'l = bitta sahifa; faqat feature'larni yig'adi
├── features/     biznes bo'laklar
│   ├── auth/         login, register, logout, sessiyani tiklash, RequireAuth / GuestOnly
│   └── invitations/  kabinet API'si, yaratish ustasi (wizard/), forma tekshiruvi (draft.ts)
├── templates/    taklifnoma dizaynlari: registry.ts (renderer_key → komponent), TemplateView, lib/
├── shared/
│   ├── api/      client.ts (so'rov + token yangilash), errors.ts, types.ts (generatsiya)
│   ├── ui/       Button, maydonlar, Alert, Logo, LanguageSwitcher + ornaments/ (milliy bezaklar)
│   ├── styles/   tokens.css (ranglar, shriftlar), base.css
│   ├── i18n/     uz-Latn, uz-Cyrl, ru
│   └── lib/      telefon formatlash va boshqalar
└── test/         Vitest sozlamasi
```

Yo'llar: `/` — mening taklifnomalarim, `/invitations/new`, `/invitations/:id/edit` (kirganlar uchun);
`/preview/:templateCode` — andoza namunasi, `/:slug` — mehmon sahifasi (kirish shart emas).

Admin panel bilan umumiy (nusxa) fayllar — o'zgartirsangiz, ikkalasida ham yangilang:
`shared/ui/` dagi Dialog, ConfirmDialog, useModal, toast/, Badge, EmptyState, PageHeader, icons;
`templates/lib/eventDate.ts` va `features/invitations/draft.ts` (admin'da `shared/lib/eventDate.ts`,
`features/invitations/draft.ts`), `registry.ts` dagi `fieldOrder` (admin'da `features/invitations/fieldOrder.ts`).

## Yangi andoza qo'shish

Andoza ikki qismdan iborat: bu yerdagi dizayn (React komponent) va admin paneldagi katalog yozuvi
(nom, narx, tadbir turlari, matn maydonlari sxemasi).

1. `src/templates/<nom>/` — komponent. U `TemplateProps` oladi (`types.ts`): matnlar, sana va vaqt zonasi,
   joy, til, `mode` (`guest` — mehmon sahifasi, `preview` — kabinet va namuna: tugmalar ishlamaydi).
   Bo'sh maydon bloki chizilmaydi; matn faqat React orqali chiqadi; sana — `lib/eventDate.ts` bilan.
2. `src/templates/registry.ts` ga `'<nom>@1': { component, fieldOrder }` qo'shing. `fieldOrder` —
   formadagi maydonlar tartibi (admin'dagi `fieldOrder.ts` ga ham yozing).
3. Deploy qiling: dizayn saytda bo'lmasa, katalogdagi andoza "dizayn ochilmadi" deb ko'rinadi.
4. Admin panel → Andozalar → "Andoza qo'shish" (kod, nom, narx, tadbir turlari). So'ng "Versiyalar" →
   "Yangi versiya": renderer kaliti `<nom>@1`, kontent sxemasi va namuna matnlar → "E'lon qilish".
5. "Faollashtirish" — andoza mijozlar katalogida va `/preview/<kod>` da ko'rinadi.

**E'lon qilingan versiya o'zgarmaydi** (bazada trigger). Dizayn yoki maydonlar o'zgarsa — yangi
komponent kaliti (`<nom>@2`, eskisi registrda qoladi) va yangi versiya. Eski taklifnomalar o'z versiyasida
qoladi, yangilari joriy versiyani oladi.

## Qoidalar

1. Import yo'nalishi: `app → pages → features → shared`. `shared` yuqoriga import qilmaydi (ESLint).
2. Feature'ga faqat uning `index.ts` i orqali kiriladi: `@/features/auth`, `@/features/auth/api` emas (ESLint).
3. Server ma'lumoti faqat TanStack Query'da. Komponent state'iga nusxa olinmaydi.
4. Rang, shrift, radius — faqat `tokens.css` dagi o'zgaruvchilar.
5. Matnlar faqat i18n orqali, uchala tilda. Xato matni backend `code` i bo'yicha: `errorText(t, code, field)`.

## Auth

- Access token faqat xotirada, refresh token `localStorage` da (`taklifnoma.refresh_token`).
- Har so'rovga `Authorization: Bearer` o'zi qo'shiladi. 401 kelsa — refresh (bir vaqtda faqat bitta)
  va so'rov takrorlanadi. Refresh ham rad etilsa — sessiya yopiladi, foydalanuvchi `/login` ga.
- Ilova ochilganda refresh token bo'lsa, sessiya tiklanadi; shu paytda himoyalangan sahifalar kutadi.
- Chiqishda yoki sessiya tugaganda `endSession()`: "me" `null` bo'ladi (ochiq sahifalar darhol
  yangilanadi) va boshqa keshlangan ma'lumot o'chiriladi.
