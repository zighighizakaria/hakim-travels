export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <title>Cette page n'a pas pu se charger | تعذّر تحميل هذه الصفحة</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #fafaf7; color: #062b4f; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      p { color: #4b5563; margin: 0 0 1.5rem; }
      .ar { direction: rtl; margin-top: 1.75rem; padding-top: 1.75rem; border-top: 1px solid #e5e7eb; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.5rem 1rem; border-radius: 9999px; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #0754a5; color: #fff; }
      .secondary { background: #fff; color: #062b4f; border-color: #d1d5db; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Cette page n'a pas pu se charger</h1>
      <p>Un problème est survenu de notre côté. Vous pouvez actualiser la page ou revenir à l'accueil.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Réessayer</button>
        <a class="secondary" href="/">Accueil</a>
      </div>
      <div class="ar" lang="ar" dir="rtl">
        <h1>تعذّر تحميل هذه الصفحة</h1>
        <p>حدث خطأ من جانبنا. يمكنك تحديث الصفحة أو العودة إلى الصفحة الرئيسية.</p>
        <div class="actions">
          <button class="primary" onclick="location.reload()">إعادة المحاولة</button>
          <a class="secondary" href="/">الرئيسية</a>
        </div>
      </div>
    </div>
  </body>
</html>`;
}
