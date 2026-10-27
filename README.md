# Dhanwanthari Ayurveda Hospital, Kozhikode — demo website

A one-page static site: plain HTML, CSS and JavaScript with GSAP animations. No build step.
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
render.yaml             Render Blueprint (static site, headers)
```

## Preview locally

```
python -m http.server 8000 --directory public
```

Then open http://localhost:8000. Opening `public/index.html` directly also works, apart from the 404 page.

## Deploy on Render

1. Create an empty repository on GitHub (no README), for example `dhanwanthari-kozhikode`.
2. From this `site` folder:

   ```
   git init
   git add .
   git commit -m "Dhanwanthari Kozhikode demo site"
   git branch -M main
   git remote add origin https://github.com/<your-username>/dhanwanthari-kozhikode.git
   git push -u origin main
   ```

3. In Render: **New → Blueprint**, connect GitHub, pick the repository, then **Apply**.
   Render reads `render.yaml` and creates a free static site at `https://dhanwanthari-kozhikode.onrender.com`
   (Render adds a suffix if that name is taken).

   Without the Blueprint: **New → Static Site**, pick the repository, leave **Build Command** empty
   and set **Publish Directory** to `public`.

Every push to `main` redeploys automatically.

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
