# Hai Tien Stays

A room catalogue and enquiry site, initially for privately rented rooms at Flamingo Hải Tiến, Thanh Hóa. Guests send an enquiry and discuss the final price, availability and included services with the owner.

## Local preview and deployment

With Node.js 22 or newer installed, run `npm install`, then `npm run dev` from this directory. Open [http://localhost:3000](http://localhost:3000) to preview the pages and API together. The preview server loads local `.env` and `.env.local` files. Sending email and fetching live weather require the configured server credentials below. Opening the HTML directly is also suitable for a visual preview.

Import this repository into Vercel with the framework preset **Other**. There is no build step. Deploy the repository root, which contains the pages and `api/` directory. Configure the server environment variables before testing live enquiries. Then add the custom domain in the project's domain settings and apply the DNS records Vercel provides. [Vercel Functions](https://vercel.com/docs/functions), [custom domains](https://vercel.com/docs/domains/set-up-custom-domain).

## Catalogue and additional locations

`catalog.js` is the shared source for browser pages (`window.STAY_CATALOG`) and server functions (`require('../catalog')`). It replaces `rooms.json` and keeps room identities consistent with emails, maps and weather.

| Section | Fields |
| --- | --- |
| `site` | Public site name and the owner's tested `zaloUrl` |
| `properties` | Stable `id`, name, translated region/address/description, coordinates, timezone, Google Maps URL and optional `heroImage` |
| `rooms` | Stable `id`, `propertyId`, translated name/description, capacity, bed label, optional area, status, blocked dates, optional reference price, currency, images, optional panorama and amenities |

Add a property once, then associate its rooms through `propertyId`. A room inherits its property's map and weather coordinates. If a future room needs a separate pin, add `location: { latitude, longitude, address: { vi, en } }` to that room. The weather API resolves the location from the catalogue and does not accept visitor supplied coordinates. [Google Maps URLs](https://developers.google.com/maps/documentation/urls/get-started).

An optional property `heroImage` URL supplies the destination photo. Keep it separate from room gallery photos, and use owner supplied or appropriately licensed imagery when publishing the site.

Use `status: 'available'`, `'unavailable'` or `'unconfirmed'`. A room marked unavailable accepts no enquiries; an unconfirmed room requires an owner availability check. Date ranges use checkout as an exclusive endpoint:

```js
blockedDates: [{ start: '2026-11-18', end: '2026-11-21' }]
```

That range blocks the nights of 18–20 November; a new guest can arrive on 21 November. The server rejects an enquiry that overlaps a blocked range or exceeds the room's stated capacity. These dates are a simple owner maintained calendar, not a reservation system.

Set `referencePrice` to a nightly amount in `currency`, or leave it `null` to request a quote. The three supplied rooms are illustrative entries (`isDemo: true`) with stock photos, unconfirmed availability, no verified amenities and no published prices. Replace their photos, names, bed details and capacities with the owner's inventory before launch, then set `isDemo: false`. `panorama: null` hides the panorama view until an actual panoramic room image is provided.

The resort address is based on [Flamingo's official offers page](https://flamingoresorts.vn/en/flamingo-hai-tien/uu-dai/), which lists Linh Truong Beach Tourist Area, Hoang Tien Commune, Thanh Hoa. The resort pin at `19.8881207, 105.9626543` is from [Google's Flamingo Hải Tiến listing](https://www.google.com/travel/hotels/entity/CgsIpNbd5q_CyNWvARAB). It represents the resort, not a particular rental unit. The [official resort page](https://flamingoresorts.vn/flamingo-hai-tien/) is the source for the resort imagery used in the destination preview; room images remain illustrative.

## Enquiry email

`POST /api/enquiry` accepts JSON:

```json
{
  "roomId": "sea-studio",
  "name": "Customer name",
  "checkIn": "2026-11-18",
  "checkOut": "2026-11-21",
  "guests": 2,
  "requirements": "Customer's requests",
  "email": "customer@example.com",
  "contact": "Phone or Zalo contact",
  "website": ""
}
```

The API looks up the room and property by ID and sends their canonical names to the owner. It uses the visitor's email as `Reply-To`. The `website` field is a hidden bot trap and should remain empty.

Set these variables in Vercel Project Settings → Environment Variables, or a local `.env` file for development:

| Variable | Purpose |
| --- | --- |
| `SMTP_HOST` | Sending account's SMTP server |
| `SMTP_PORT` | SMTP port, usually 465 or 587 |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password or app password |
| `SMTP_FROM` | Sender address accepted by the SMTP account |
| `ENQUIRY_TO` | Owner's destination email address |
| `WEATHER_API_KEY` | Private WeatherAPI.com key |

Keep real values in the server environment, outside Git and the browser catalogue. `.env.example` contains placeholders. Port 465 uses implicit TLS; other ports require STARTTLS. Without valid SMTP settings, the form receives an unavailable response. No live email can be verified until the sending account and recipient are configured.

The personal Zalo contact is separate from email delivery. Set `site.zaloUrl` to the owner's contact URL after checking it on mobile and desktop. Opening Zalo cannot establish whether the visitor sent a chat message; submitting the enquiry form triggers the email.

## Weather API

`GET /api/weather?roomId=sea-studio&lang=vi` requests three forecast days for the room's resolved location. English is used unless `lang=vi`. The response includes `days`, each with `date`, `condition`, `conditionCode`, `maxC`, `minC` and `rainChance`. Successful responses are cached for 30 minutes on Vercel. Missing configuration or provider failures produce an unavailable response rather than fabricated weather. This is the upcoming forecast, independent of the selected stay dates. [WeatherAPI documentation](https://www.weatherapi.com/docs/).

## CMS path

The current catalogue is edited in the repository. A future Strapi setup can use **Property** and **Room** collection types, a Room → Property relation, repeatable date ranges, media fields for gallery/panorama and optional reference prices. An adapter should convert CMS responses into the same catalogue shape so the pages and enquiry API share one published source. Strapi provides collection types, relations, reusable components and localized content fields. [Strapi Content-type Builder](https://docs.strapi.io/cms/features/content-type-builder).

Host Strapi with a persistent database and media storage, alongside the Vercel frontend. When connecting it, both the public catalogue and enquiry validation must read the same current published data; changing only the browser would leave the server's room checks stale. The CMS and its authentication are not included in this prototype.
