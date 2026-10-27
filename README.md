# Dhanwanthari Ayurveda Hospital, Kozhikode — demo website (design A, Vaidyasala)

This is the `main` branch: design A, palm-leaf and brass with a herbal-compress film behind the headline.
The `concept-b` branch holds design B (Dhara), the dark oil-lamp design. Each branch is its own
one-page static site: plain HTML, CSS and JavaScript with GSAP animations, no build step.
Everything that gets published lives in `public/`.

```
public/
  index.html            the page
  404.html              shown by Render for any missing URL
  favicon.svg
  robots.txt            blocks search engines while this is a demo
  assets/css/styles.css
  assets/js/main.js     hero film controls + GSAP animations
  assets/img/           stand-in photos (Wikimedia Commons, credited in the footer)
  assets/video/         stand-in hero film (Pexels) + poster frame
  assets/og-image.jpg   link preview image for WhatsApp, Facebook, etc.
render.yaml             Render Blueprint for BOTH sites (identical on both branches)
```

## Preview locally

```
python -m http.server 8000 --directory public
```

Then open http://localhost:8000. Opening `public/index.html` directly also works, apart from the 404 page.

## Hosting on Render

`render.yaml` defines two static sites from this one repository
(https://github.com/Pranav-Conova/dhanwanthari-kozhikode):

| Branch | Render service | Design |
|---|---|---|
| `main` | `dhanwanthari-kozhikode` | A, Vaidyasala |
| `concept-b` | `dhanwanthari-kozhikode-dhara` | B, Dhara |

- **Blueprint not applied yet:** Render → **New → Blueprint** → pick this repo (branch `main`) → **Apply**. Both sites are created.
- **Blueprint already applied:** Render syncs `render.yaml` from `main` after each push and creates the new site. If it doesn't, open the Blueprint and click **Manual Sync**.
- **Without a Blueprint:** Render → **New → Static Site** → this repo → pick the branch, leave **Build Command** empty, **Publish Directory** `public`.

Render adds a suffix to the `.onrender.com` address if a name is taken.
Every push to `main` redeploys design A; every push to `concept-b` redeploys design B.

## Before it goes live for real

- [ ] **Allow search engines:** delete the `robots` meta tag in `index.html`, the `X-Robots-Tag` header in `render.yaml`, and switch `robots.txt` to `Allow: /`.
- [ ] **WhatsApp:** point the "Message us on WhatsApp" button at `https://wa.me/91XXXXXXXXXX` once the hospital confirms the number (search `TODO` in `index.html`).
- [ ] **Confirm details:** address (Rajamandir vs Rajasree Building, Chalappuram), phone, and doctors.
- [ ] **Replace stand-ins:** hospital photos (cleaned up with Gemini) in `assets/img/`, and the hospital's own or AI-made film in `assets/video/`. Keep the same file names, or update `index.html`.
- [ ] **Compress the film:** `herbal-compress-1080.mp4` is 11 MB. Aim for 4–6 MB, for example
  `ffmpeg -i in.mp4 -vf scale=1920:-2 -c:v libx264 -crf 28 -preset slow -an -movflags +faststart out.mp4`.
- [ ] **Link previews:** set `og:image` in `index.html` to the full URL, e.g. `https://<your-site>.onrender.com/assets/og-image.jpg`.
- [ ] **Custom domain:** add it in Render → Settings → Custom Domains.
- [ ] **Credits:** remove the stand-in photo and film credits from the footer once they're replaced.
