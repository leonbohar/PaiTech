# PaiTech – Dev & Ai Consulting — אתר החברה

אתר סטטי (HTML/CSS/JS, בלי שלב build) לדומיין **pai-tech-consulting.com**, שמתארח ב־Cloudflare Pages.

## מבנה

```
public/                 ← כל מה שמתפרסם באתר (תיקיית הפלט של Cloudflare Pages)
  index.html            דף הבית
  contact.html          דף צור קשר (נגיש גם בכתובת /contact)
  404.html              דף "לא נמצא"
  assets/css|js|img     עיצוב, סקריפטים, תמונות ולוגו
  _headers              כותרות אבטחה ו־cache
  robots.txt, sitemap.xml
functions/api/contact.js  ← Cloudflare Pages Function ששולחת את טופס צור קשר למייל (דרך Resend)
tools/fetch-images.sh     ← מוריד את התמונות המקוריות מ־Framer לתוך public/assets/img
```

## תמונות

ארבע התמונות (תמונת לאון, איורי ה־AI ותמונת השיטה) מופיעות בקוד כקבצים מקומיים ב־`public/assets/img/`.
כל עוד הקבצים לא נמצאים שם, הדפדפן טוען אותם אוטומטית מה־CDN של Framer.
כדי לא להיות תלויים בפרויקט Framer, הריצו פעם אחת `bash tools/fetch-images.sh` ובצעו commit לקבצים.

## טופס צור קשר

הטופס שולח בקשת POST אל `/api/contact`. הפונקציה בודקת את השדות, מסננת בוטים (honeypot)
ושולחת מייל אל `info@pai-tech-consulting.com` עם Reply-To של הפונה.

משתני סביבה ב־Cloudflare Pages:

| שם | חובה | תיאור |
|---|---|---|
| `RESEND_API_KEY` | כן (Secret) | מפתח API של Resend |
| `CONTACT_TO` | לא | כתובת היעד (ברירת מחדל: info@pai-tech-consulting.com) |
| `CONTACT_FROM` | לא | כתובת השולח (ברירת מחדל: `PaiTech Website <website@pai-tech-consulting.com>`) |

אם המפתח לא הוגדר, הטופס מציג למבקר הודעה ידידותית עם כתובת המייל לפנייה ישירה.

## פריסה ל־Cloudflare Pages

1. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → בחירת הריפו `PaiTech`.
2. הגדרות build:
   - Production branch: `main`
   - Framework preset: `None`
   - Build command: ריק
   - Build output directory: `public`
3. **Save and Deploy**.
4. בפרויקט → **Custom domains** → הוספת `pai-tech-consulting.com` ואז גם `www.pai-tech-consulting.com`
   (כשהדומיין מנוהל באותו חשבון Cloudflare, רשומות ה־DNS נוצרות אוטומטית).

## קבלת מיילים ל־info@ (Cloudflare Email Routing)

Dashboard → הדומיין → **Email** → **Email Routing** → הפעלה → יצירת כתובת `info@pai-tech-consulting.com`
שמעבירה לתיבת הדואר הפרטית (צריך לאשר את תיבת היעד בלינק שנשלח אליה).

## שליחת הטופס (Resend)

1. פתיחת חשבון ב־resend.com → **Domains** → הוספת `pai-tech-consulting.com` והוספת רשומות ה־DNS שהוא מציג ב־Cloudflare.
2. **API Keys** → יצירת מפתח עם הרשאת Sending בלבד.
3. בפרויקט ה־Pages → **Settings** → **Variables and Secrets** → הוספת `RESEND_API_KEY` כ־Secret (Production) → פריסה מחדש.

## הרצה מקומית

```bash
npx wrangler pages dev public   # כולל את פונקציית הטופס
# או בלי הטופס:
python3 -m http.server -d public 8000
```
