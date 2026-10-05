import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// 從同一份 Markdown 教材產生可公開部署的 HTML，避免兩份內容分別維護。
const guideFolder = dirname(fileURLToPath(import.meta.url));
const sourcePath = resolve(guideFolder, '把HTML公開到GitHubPages_新手教學.md');
const outputPath = resolve(guideFolder, 'index.html');
const markdownModule = process.argv[2]
  ? await import(pathToFileURL(resolve(process.argv[2])).href)
  : await import('marked');
const source = await readFile(sourcePath, 'utf8');
const contents = [];
let sectionNumber = 0;
let htmlBody = markdownModule.marked.parse(source, { gfm: true });
htmlBody = htmlBody.replace(/^<h1>[\s\S]*?<\/h1>\s*/, '');
htmlBody = htmlBody.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (original, level, title) => {
  const id = `section-${++sectionNumber}`;
  const label = title.replace(/<[^>]+>/g, '');
  if (level === '2') contents.push({ id, label });
  return `<h${level} id="${id}">${title}</h${level}>`;
});
htmlBody = htmlBody.replace(/<table>/g, '<div class="table-scroll" tabindex="0" role="region" aria-label="可左右捲動的對照表"><table>')
  .replace(/<\/table>/g, '</table></div>')
  .replace(/<a href="(https?:[^\"]+)"/g, '<a href="$1" target="_blank" rel="noopener noreferrer"')
  .replace(/<img /g, '<img loading="lazy" ');
const firstStep = contents.find((item) => item.label.startsWith('Step 1'));
const promptSection = contents.find((item) => item.label.startsWith('需要 AI 幫忙'));
const toc = contents.map((item) => `<a href="#${item.id}">${item.label}</a>`).join('\n');

const page = `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="已經做好 HTML 網頁？跟著 7 個步驟，用學校 Google 帳號登入 GitHub，上傳檔案並取得公開網址。附操作截圖與可複製的 AI 指令。">
  <meta name="theme-color" content="#14334a">
  <title>把 HTML 變成公開網址｜GitHub Pages 新手教學</title>
  <style>
    :root { color-scheme: light; --ink: #203447; --muted: #5b7083; --navy: #14334a; --teal: #087f83; --line: #dbe5ed; --surface: #f2f6f9; }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; scroll-padding-top: 28px; }
    body { margin: 0; background: #f6f8fb; color: var(--ink); font-family: system-ui, -apple-system, "Segoe UI", "Microsoft JhengHei", sans-serif; line-height: 1.85; }
    a { color: #076c9f; text-underline-offset: 3px; overflow-wrap: anywhere; }
    a:hover { color: var(--teal); }
    a:focus-visible, button:focus-visible, summary:focus-visible, [tabindex]:focus-visible { outline: 3px solid #e5a91e; outline-offset: 4px; }
    .skip { position: absolute; left: 20px; top: -100px; background: white; padding: 10px 16px; z-index: 5; }
    .skip:focus { top: 12px; }
    .masthead { background: var(--navy); color: white; }
    .masthead-inner { max-width: 1370px; padding: 14px 32px; margin: auto; display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; font-size: 14px; }
    .masthead a { color: white; }
    .hero { background: linear-gradient(125deg, #eaf5f6, #eef2fa); border-bottom: 1px solid var(--line); }
    .hero-inner { max-width: 1370px; margin: auto; padding: 48px 32px 42px; }
    .eyebrow { color: var(--teal); font-weight: 750; letter-spacing: .06em; font-size: 14px; margin: 0 0 8px; }
    h1 { color: var(--navy); font-size: clamp(1.9rem, 4.3vw, 3rem); line-height: 1.35; margin: 0 0 16px; max-width: 920px; }
    .hero p { max-width: 820px; margin: 8px 0; }
    .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 24px; }
    .button { display: inline-flex; padding: 10px 18px; border-radius: 8px; border: 1px solid var(--teal); background: var(--teal); color: white; text-decoration: none; font: inherit; font-weight: 650; cursor: pointer; }
    .button:hover { background: #096b6e; color: white; }
    .button.secondary { background: white; color: var(--navy); border-color: #bdcdd8; }
    .layout { max-width: 1370px; margin: auto; display: grid; grid-template-columns: 265px minmax(0, 1fr); gap: 28px; padding: 32px; align-items: start; }
    .toc { position: sticky; top: 24px; background: white; border: 1px solid var(--line); border-radius: 12px; padding: 16px; max-height: calc(100vh - 48px); overflow-y: auto; }
    .toc summary { color: var(--navy); font-weight: 750; cursor: pointer; }
    .toc nav { display: grid; margin-top: 12px; gap: 2px; }
    .toc nav a { display: block; padding: 7px 9px; border-radius: 6px; color: var(--muted); font-size: 14px; line-height: 1.5; text-decoration: none; }
    .toc nav a:hover, .toc nav a[aria-current="location"] { color: var(--teal); background: #eaf5f5; }
    main { min-width: 0; }
    article { min-width: 0; background: white; padding: 30px 38px 40px; border: 1px solid var(--line); border-radius: 12px; }
    article > :first-child { margin-top: 0; }
    h2 { color: var(--navy); font-size: clamp(1.3rem, 3vw, 1.65rem); line-height: 1.5; margin: 48px 0 18px; padding-top: 26px; border-top: 1px solid var(--line); }
    h3 { font-size: 1.14rem; color: #25516c; margin: 30px 0 12px; line-height: 1.6; }
    article details { margin: 18px 0; padding: 14px 18px; border: 1px solid var(--line); border-radius: 8px; background: #fbfcfd; }
    article summary { color: #25516c; font-weight: 650; line-height: 1.6; cursor: pointer; }
    article details[open] > summary { margin-bottom: 14px; }
    article details > :last-child { margin-bottom: 0; }
    p { margin: 14px 0; }
    li { margin: 9px 0; }
    ol, ul { padding-left: 1.65em; }
    strong { color: #163d56; }
    code { font-family: Consolas, "SFMono-Regular", monospace; font-size: .91em; background: #edf3f7; border-radius: 4px; padding: 2px 5px; overflow-wrap: anywhere; }
    pre { position: relative; max-width: 100%; overflow: auto; border: 1px solid #cfdde7; border-radius: 9px; background: #f2f6fa; padding: 20px; margin: 18px 0 24px; line-height: 1.75; }
    pre.has-copy { padding-top: 55px; }
    pre code { padding: 0; background: transparent; font-size: 14px; white-space: pre; }
    pre code.language-text { white-space: pre-wrap; overflow-wrap: anywhere; }
    .copy-code { position: absolute; right: 10px; top: 10px; font: inherit; font-size: 13px; padding: 4px 10px; border: 1px solid #bfd0db; border-radius: 5px; color: var(--navy); background: white; cursor: pointer; }
    .copy-code:hover { background: #e2eeee; }
    .table-scroll { max-width: 100%; overflow-x: auto; margin: 18px 0 24px; border: 1px solid var(--line); border-radius: 8px; }
    table { border-collapse: collapse; width: 100%; font-size: 15px; line-height: 1.7; }
    th { text-align: left; background: #edf4f7; color: var(--navy); }
    th, td { padding: 12px 14px; border-bottom: 1px solid var(--line); vertical-align: top; min-width: 145px; }
    tr:last-child td { border-bottom: 0; }
    tbody tr:nth-child(even) { background: #fbfcfd; }
    article img { display: block; width: 100%; height: auto; margin: 18px 0 26px; border: 1px solid #cddae3; border-radius: 8px; background: var(--surface); cursor: zoom-in; }
    .image-hint { color: var(--muted); font-size: 13px; margin-top: -18px; }
    .back-top { margin-top: 34px; display: inline-block; }
    footer { max-width: 1370px; margin: 0 auto; padding: 0 32px 32px; font-size: 13px; color: var(--muted); }
    .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); border: 0; }
    @media (max-width: 980px) { .layout { grid-template-columns: minmax(0, 1fr); gap: 20px; } .toc { position: static; max-height: none; } .toc nav { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 600px) { .hero-inner { padding: 30px 20px; } .masthead-inner { padding: 12px 20px; } .layout { padding: 20px 12px; } article { padding: 22px 18px 28px; } .toc nav { grid-template-columns: minmax(0, 1fr); } h2 { margin-top: 34px; } pre { padding: 14px; } footer { padding: 0 20px 24px; } }
    @media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
    @media print { .masthead, .toc, .hero-actions, .copy-code, .image-hint, .back-top { display: none; } body { background: white; font-size: 10pt; } .hero { background: white; } .hero-inner { padding: 0 0 20px; } .layout { display: block; padding: 0; } article { border: 0; padding: 0; } h2 { break-after: avoid; } img, table { break-inside: avoid; } pre { white-space: pre-wrap; overflow: visible; } pre code { white-space: pre-wrap; } .table-scroll { overflow: visible; } }
  </style>
</head>
<body id="top">
  <a class="skip" href="#guide">跳到教學內容</a>
  <div class="masthead"><div class="masthead-inner"><span>GitHub 基礎班 · 新手實作</span></div></div>
  <header class="hero"><div class="hero-inner">
    <p class="eyebrow">一份 HTML → 一個公開網址</p>
    <h1>把 HTML 變成公開網址<br>GitHub Pages 新手教學</h1>
    <p>跟著下面 7 個步驟，把做好的網頁分享給同仁、朋友或家長。</p>
    <div class="hero-actions"><a class="button" href="#${firstStep.id}">開始 Step 1</a><a class="button secondary" href="#${promptSection.id}">需要 AI 幫忙</a><button class="button secondary" type="button" id="share-guide">複製教學網址</button></div>
  </div></header>
  <div class="layout">
    <aside class="toc"><details open><summary>教學目錄</summary><nav aria-label="教學章節">${toc}</nav></details></aside>
    <main id="guide"><article>${htmlBody}<a class="back-top" href="#top">↑ 回到最上方</a></article></main>
  </div>
  <footer>內容與介面查核：2026-10-05。GitHub 介面可能調整，請對照英文按鈕名稱。</footer>
  <p id="copy-status" class="sr-only" role="status" aria-live="polite"></p>
  <script>
    const announce = document.getElementById('copy-status');
    if (matchMedia('(max-width: 980px)').matches) document.querySelector('.toc details').open = false;
    // 連到收合內容時，先展開它，讓讀者可以直接看到需要的指令。
    function revealSection(hash) {
      const target = document.getElementById(hash.slice(1));
      if (!target) return;
      for (let panel = target.closest('details'); panel; panel = panel.parentElement.closest('details')) panel.open = true;
      return target;
    }
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', () => revealSection(link.getAttribute('href')));
    });
    if (location.hash) revealSection(location.hash)?.scrollIntoView();
    window.addEventListener('hashchange', () => revealSection(location.hash));
    document.querySelectorAll('article input[type="checkbox"]').forEach((checkbox) => {
      checkbox.disabled = false;
      checkbox.setAttribute('aria-label', checkbox.parentElement.textContent.trim());
    });
    async function copyText(text, button, original) {
      try {
        await navigator.clipboard.writeText(text);
        button.textContent = '已複製 ✓';
        announce.textContent = '已複製，可以貼上使用。';
      } catch {
        button.textContent = '請選取文字後複製';
        announce.textContent = '請選取下方文字，再使用複製功能。';
      }
      setTimeout(() => { button.textContent = original; }, 2400);
    }
    document.querySelectorAll('pre > code').forEach((code) => {
      const pre = code.parentElement;
      pre.classList.add('has-copy');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'copy-code';
      button.textContent = '複製這段';
      let heading = pre.previousElementSibling;
      while (heading && !/^H[23]$/.test(heading.tagName)) heading = heading.previousElementSibling;
      const label = pre.closest('details')?.querySelector('summary') || heading;
      button.setAttribute('aria-label', label ? '複製：' + label.textContent : '複製下方完整文字或程式碼');
      button.addEventListener('click', () => copyText(code.textContent, button, '複製這段'));
      pre.prepend(button);
    });
    document.getElementById('share-guide').addEventListener('click', (event) => {
      copyText(location.href.split('#')[0], event.currentTarget, '複製教學網址');
    });
    document.querySelectorAll('article img').forEach((image) => {
      const link = document.createElement('a');
      link.href = image.src;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', '開啟大圖：' + image.alt);
      image.before(link);
      link.append(image);
      const hint = document.createElement('p');
      hint.className = 'image-hint';
      hint.textContent = '點圖片可開啟大圖，對照畫面上的按鈕。';
      link.after(hint);
    });
  </script>
</body>
</html>
`;
await writeFile(outputPath, page, 'utf8');
console.log(`已產生 ${outputPath}（${contents.length} 個主要章節）`);
