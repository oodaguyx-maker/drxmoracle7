import type { Character, ChatNode } from "./storage"

export function generateCharacterHTML(
  character: Character,
  gallery: Array<{ url: string; type: "image" | "video" }>,
  baseUrl: string,
): string {
  const galleryHTML =
    gallery.length > 0
      ? `
    <section class="gallery">
      <h2>Gallery</h2>
      <div class="gallery-grid">
        ${gallery
          .map((item, index) =>
            item.type === "video"
              ? `<video src="${item.url}" controls class="gallery-item" data-index="${index}"></video>`
              : `<img src="${item.url}" alt="${character.name} - Image ${index + 1}" class="gallery-item" data-index="${index}" onclick="openLightbox(${index})" />`,
          )
          .join("")}
      </div>
    </section>
    
    <!-- Lightbox -->
    <div id="lightbox" class="lightbox" onclick="closeLightbox()">
      <span class="close-btn">&times;</span>
      <button class="nav-btn prev" onclick="event.stopPropagation(); navigate(-1)">&#10094;</button>
      <div class="lightbox-content">
        <img id="lightbox-img" src="/placeholder.svg" alt="" />
        <video id="lightbox-video" src="" controls style="display:none;"></video>
      </div>
      <button class="nav-btn next" onclick="event.stopPropagation(); navigate(1)">&#10095;</button>
      <div class="counter"><span id="current-index">1</span> / <span id="total-count">${gallery.length}</span></div>
    </div>
  `
      : ""

  const tagsHTML =
    character.tags && character.tags.length > 0
      ? `<div class="tags">${character.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>`
      : ""

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${character.name} - Dreamweaver Oracle Engine</title>
  <meta name="description" content="${character.description}">
  <meta property="og:title" content="${character.name} - Character Profile">
  <meta property="og:description" content="${character.description}">
  <meta property="og:image" content="${character.avatar || baseUrl + "/icons/icon-512x512.jpg"}">
  <style>
    :root {
      --bg-primary: #0a0505;
      --bg-secondary: #1a0a0a;
      --bg-card: #120808;
      --text-primary: #f5e6d3;
      --text-secondary: #c9a86c;
      --accent-gold: #d4af37;
      --accent-crimson: #8b0000;
      --accent-dark-red: #5c0000;
      --border-color: #3d1a1a;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
      color: var(--text-primary);
      min-height: 100vh;
      line-height: 1.6;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    header {
      text-align: center;
      padding: 3rem 0;
      border-bottom: 2px solid var(--accent-gold);
      margin-bottom: 2rem;
    }
    
    .logo {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid var(--accent-gold);
      box-shadow: 0 0 30px rgba(212, 175, 55, 0.5);
      margin-bottom: 1rem;
    }
    
    .branding {
      color: var(--accent-gold);
      font-size: 0.9rem;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 0.5rem;
    }
    
    .avatar {
      width: 200px;
      height: 200px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid var(--accent-crimson);
      box-shadow: 0 0 40px rgba(139, 0, 0, 0.6);
      margin: 2rem 0;
    }
    
    h1 {
      font-size: 3rem;
      background: linear-gradient(180deg, var(--accent-gold), var(--text-secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 0.5rem;
    }
    
    .description {
      font-size: 1.2rem;
      color: var(--text-secondary);
      max-width: 600px;
      margin: 0 auto;
    }
    
    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      justify-content: center;
      margin-top: 1.5rem;
    }
    
    .tag {
      background: var(--accent-dark-red);
      color: var(--text-primary);
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.85rem;
      border: 1px solid var(--accent-crimson);
    }
    
    section {
      background: var(--bg-card);
      border-radius: 16px;
      padding: 2rem;
      margin-bottom: 2rem;
      border: 1px solid var(--border-color);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    }
    
    section h2 {
      color: var(--accent-gold);
      font-size: 1.5rem;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--border-color);
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    
    .info-item h3 {
      color: var(--text-secondary);
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 0.5rem;
    }
    
    .info-item p {
      color: var(--text-primary);
      white-space: pre-wrap;
    }
    
    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
    }
    
    .gallery-item {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
      border-radius: 12px;
      cursor: pointer;
      transition: transform 0.3s, box-shadow 0.3s;
      border: 2px solid var(--border-color);
    }
    
    .gallery-item:hover {
      transform: scale(1.05);
      box-shadow: 0 8px 24px rgba(139, 0, 0, 0.4);
    }
    
    /* Lightbox */
    .lightbox {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.95);
      z-index: 1000;
      justify-content: center;
      align-items: center;
    }
    
    .lightbox.active {
      display: flex;
    }
    
    .lightbox-content {
      max-width: 90vw;
      max-height: 90vh;
    }
    
    .lightbox-content img,
    .lightbox-content video {
      max-width: 100%;
      max-height: 85vh;
      border-radius: 8px;
    }
    
    .close-btn {
      position: absolute;
      top: 20px;
      right: 30px;
      font-size: 40px;
      color: var(--text-primary);
      cursor: pointer;
    }
    
    .nav-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: var(--accent-crimson);
      color: var(--text-primary);
      border: none;
      padding: 1rem;
      font-size: 1.5rem;
      cursor: pointer;
      border-radius: 50%;
    }
    
    .nav-btn.prev { left: 20px; }
    .nav-btn.next { right: 20px; }
    
    .counter {
      position: absolute;
      bottom: 20px;
      color: var(--text-secondary);
    }
    
    footer {
      text-align: center;
      padding: 2rem;
      color: var(--text-secondary);
      border-top: 1px solid var(--border-color);
    }
    
    footer a {
      color: var(--accent-gold);
      text-decoration: none;
    }
    
    @media (max-width: 768px) {
      h1 { font-size: 2rem; }
      .avatar { width: 150px; height: 150px; }
      .container { padding: 1rem; }
      section { padding: 1.5rem; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <img src="https://files.catbox.moe/4z7bjg.jpg" alt="Dreamweaver" class="logo" />
      <p class="branding">Dreamweaver Oracle Engine</p>
      ${character.avatar ? `<img src="${character.avatar}" alt="${character.name}" class="avatar" />` : ""}
      <h1>${character.name}</h1>
      <p class="description">${character.description}</p>
      ${tagsHTML}
    </header>
    
    <section class="details">
      <h2>Character Details</h2>
      <div class="info-grid">
        ${
          character.personality
            ? `
        <div class="info-item">
          <h3>Personality</h3>
          <p>${character.personality}</p>
        </div>
        `
            : ""
        }
        ${
          character.scenario
            ? `
        <div class="info-item">
          <h3>Scenario</h3>
          <p>${character.scenario}</p>
        </div>
        `
            : ""
        }
        ${
          character.first_mes
            ? `
        <div class="info-item">
          <h3>Opening Message</h3>
          <p>${character.first_mes}</p>
        </div>
        `
            : ""
        }
      </div>
    </section>
    
    ${galleryHTML}
    
    <footer>
      <p>Created with <a href="${baseUrl}">Dreamweaver Oracle Engine</a></p>
      <p>Exported on ${new Date().toLocaleDateString()}</p>
    </footer>
  </div>
  
  <script>
    let currentIndex = 0;
    const gallery = ${JSON.stringify(gallery)};
    
    function openLightbox(index) {
      currentIndex = index;
      updateLightbox();
      document.getElementById('lightbox').classList.add('active');
    }
    
    function closeLightbox() {
      document.getElementById('lightbox').classList.remove('active');
    }
    
    function navigate(direction) {
      currentIndex = (currentIndex + direction + gallery.length) % gallery.length;
      updateLightbox();
    }
    
    function updateLightbox() {
      const item = gallery[currentIndex];
      const img = document.getElementById('lightbox-img');
      const video = document.getElementById('lightbox-video');
      
      if (item.type === 'video') {
        img.style.display = 'none';
        video.style.display = 'block';
        video.src = item.url;
      } else {
        video.style.display = 'none';
        img.style.display = 'block';
        img.src = item.url;
      }
      
      document.getElementById('current-index').textContent = currentIndex + 1;
    }
    
    document.addEventListener('keydown', (e) => {
      if (!document.getElementById('lightbox').classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    });
  </script>
</body>
</html>`
}

export function generateLogsHTML(character: Character, nodes: ChatNode[]): string {
  const nodesHTML = nodes
    .map(
      (node) => `
    <div class="node">
      <h3 class="node-title">${node.title || node.name}</h3>
      <p class="node-meta">${node.messages.length} messages - Created: ${new Date(node.createdAt).toLocaleDateString()}</p>
      <div class="messages">
        ${node.messages
          .map(
            (msg) => `
          <div class="message ${msg.role}">
            <div class="message-header">
              <span class="speaker">${msg.role === "user" ? "You" : character.name}</span>
              <span class="timestamp">${new Date(msg.timestamp).toLocaleString()}</span>
            </div>
            <div class="message-content">${msg.content.replace(/\n/g, "<br>")}</div>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>
  `,
    )
    .join("")

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${character.name} - Chat Logs - Dreamweaver Oracle Engine</title>
  <style>
    :root {
      --bg-primary: #0a0505;
      --bg-secondary: #1a0a0a;
      --bg-card: #120808;
      --text-primary: #f5e6d3;
      --text-secondary: #c9a86c;
      --accent-gold: #d4af37;
      --accent-crimson: #8b0000;
      --border-color: #3d1a1a;
      --user-bg: #1a1a3a;
      --assistant-bg: #1a0a0a;
    }
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
      color: var(--text-primary);
      min-height: 100vh;
      line-height: 1.6;
    }
    
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    header {
      text-align: center;
      padding: 2rem 0;
      border-bottom: 2px solid var(--accent-gold);
      margin-bottom: 2rem;
    }
    
    .logo {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid var(--accent-gold);
      margin-bottom: 1rem;
    }
    
    h1 {
      color: var(--accent-gold);
      font-size: 2rem;
    }
    
    .subtitle {
      color: var(--text-secondary);
    }
    
    .stats {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin-top: 1rem;
    }
    
    .stat {
      text-align: center;
    }
    
    .stat-value {
      font-size: 1.5rem;
      font-weight: bold;
      color: var(--accent-gold);
    }
    
    .stat-label {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }
    
    .node {
      background: var(--bg-card);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      border: 1px solid var(--border-color);
    }
    
    .node-title {
      color: var(--accent-gold);
      font-size: 1.25rem;
      margin-bottom: 0.25rem;
    }
    
    .node-meta {
      color: var(--text-secondary);
      font-size: 0.85rem;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border-color);
    }
    
    .message {
      padding: 1rem;
      margin-bottom: 0.75rem;
      border-radius: 8px;
    }
    
    .message.user {
      background: var(--user-bg);
      margin-left: 2rem;
    }
    
    .message.assistant {
      background: var(--assistant-bg);
      border-left: 3px solid var(--accent-crimson);
      margin-right: 2rem;
    }
    
    .message-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }
    
    .speaker {
      font-weight: bold;
      color: var(--text-secondary);
    }
    
    .timestamp {
      font-size: 0.75rem;
      color: var(--text-secondary);
      opacity: 0.7;
    }
    
    .message-content {
      white-space: pre-wrap;
    }
    
    footer {
      text-align: center;
      padding: 2rem;
      color: var(--text-secondary);
      border-top: 1px solid var(--border-color);
    }
    
    footer a {
      color: var(--accent-gold);
      text-decoration: none;
    }
    
    @media (max-width: 768px) {
      .container { padding: 1rem; }
      .message.user { margin-left: 0.5rem; }
      .message.assistant { margin-right: 0.5rem; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <img src="https://files.catbox.moe/4z7bjg.jpg" alt="Dreamweaver" class="logo" />
      <h1>${character.name} - Chat Logs</h1>
      <p class="subtitle">Dreamweaver Oracle Engine</p>
      <div class="stats">
        <div class="stat">
          <div class="stat-value">${nodes.length}</div>
          <div class="stat-label">Conversations</div>
        </div>
        <div class="stat">
          <div class="stat-value">${nodes.reduce((sum, n) => sum + n.messages.length, 0)}</div>
          <div class="stat-label">Messages</div>
        </div>
      </div>
    </header>
    
    <main>
      ${nodesHTML}
    </main>
    
    <footer>
      <p>Exported from <a href="#">Dreamweaver Oracle Engine</a></p>
      <p>Generated on ${new Date().toLocaleString()}</p>
    </footer>
  </div>
</body>
</html>`
}

export function downloadHTML(html: string, filename: string): void {
  const blob = new Blob([html], { type: "text/html" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
