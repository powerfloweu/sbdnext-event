This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Önkéntes webhookok (Make / Google Sheet)

- `NEXT_PUBLIC_VOLUNTEER_WEBHOOK`: meglévő webhook (Make vagy más) az önkéntes adatokhoz.
- `NEXT_PUBLIC_VOLUNTEER_MAKE_WEBHOOK`: opcionális második webhook (pl. Google Sheet-szinkron Make-ben).

Beküldött payload (JSON):

- `timestamp`: ISO dátum-idő
- `name`: önkéntes neve
- `days`: tömb, elemei `2026-02-14` és/vagy `2026-02-15`
- `position`: kiválasztott pozíció
- `shirtCut`: "Női" vagy "Férfi"
- `shirtSize`: "XS"–"4XL"

Mindkét webhook, ha meg van adva, párhuzamosan kapja ugyanazt a payloadot. Ha egyik sincs megadva, a kliens ettől függetlenül sikeresnek jelzi a beküldést (nincs hiba, csak nem megy ki webhook).
