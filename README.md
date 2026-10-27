# Dhanwanthari Ayurveda Hospital, Kozhikode — demo website (design B, Dhara)

This is the `concept-b` branch: the dark, cinematic design with an oil-lamp film behind the headline.
The `main` branch holds design A (Vaidyasala). Each branch is its own one-page static site:
plain HTML, CSS and JavaScript with GSAP animations, no build step. Everything published lives in `public/`.

```
public/
  index.html            the page
  404.html              shown by Render for any missing URL
  favicon.svg
  robots.txt            blocks search engines while this is a demo
  assets/css/styles.css
  assets/js/main.js     hero film controls + GSAP animations
  assets/img/           stand-in photos (Wikimedia Commons, credited in the footer)
  assets/video/         stand-in hero film (Pexels: "Serene Oil Lamp Flame in Darkness") + poster frame
  assets/og-image.jpg   link preview image for WhatsApp, Facebook, etc.
render.yaml             Render Blueprint for BOTH sites (identical on both branches)
```

## Preview locally

```
python -m http.server 8000 --directory public
```

Then open http://localhost:8000.

## Hosting on Render

`render.yaml` defines two static sites from this one repository:

| Branch | Render service | Design |
|---|---|---|
| `main` | `dhanwanthari-kozhikode` | A, Vaidyasala |
| `concept-b` | `dhanwanthari-kozhikode-dhara` | B, Dhara |

- **Blueprint not applied yet:** Render → **New → Blueprint** → pick this repo (branch `main`) → **Apply**. Both sites are created.
- **Blueprint already applied:** Render syncs `render.yaml` from `main` after each push and creates the new site. If it doesn't, open the Blueprint and click **Manual Sync**.
- **Without a Blueprint:** Render → **New → Static Site** → this repo → branch `concept-b`, leave **Build Command** empty, **Publish Directory** `public`.

Every push to `concept-b` redeploys design B; every push to `main` redeploys design A.

## Before it goes live for real

- [ ] **Allow search engines:** delete the `robots` meta tag in `index.html`, the `X-Robots-Tag` header in `render.yaml`, and switch `robots.txt` to `Allow: /`.
- [ ] **WhatsApp:** point the WhatsApp button at `https://wa.me/91XXXXXXXXXX` once the hospital confirms the number (search `TODO` in `index.html`).
- [ ] **Confirm details:** address (Rajamandir vs Rajasree Building, Chalappuram), phone, programme descriptions and the "From the Gulf" steps.
- [ ] **Replace stand-ins:** hospital photos (cleaned up with Gemini) in `assets/img/`, and the hospital's own or AI-made film in `assets/video/`.
- [ ] **Compress the film:** `lamp-flame-1080.mp4` is 12.6 MB. Aim for 4–6 MB, for example
  `ffmpeg -i in.mp4 -vf scale=1920:-2 -c:v libx264 -crf 28 -preset slow -an -movflags +faststart out.mp4`.
- [ ] **Link previews:** set `og:image` in `index.html` to the full URL, e.g. `https://<your-site>.onrender.com/assets/og-image.jpg`.
- [ ] **Credits:** remove the stand-in photo and film credits from the footer once they're replaced.
- [ ] **Google reviews:** the page shows the Google rating as checked on 27 Oct 2026 (4.8 from 16 reviews). To show real review cards, put a Google Maps Platform API key (Maps JavaScript API + Places API (New), restricted to the site's address) in `assets/js/reviews.js`, or paste real reviews word for word into `manualReviews` there. Never write reviews by hand.
- [ ] **Map:** the embed searches for the hospital by name. If the hospital sends its Google Maps link, swap the `q=` value in the map `iframe` for its exact place.
