const { google } = require('googleapis');
const fs = require('fs');

async function publishPost() {
  const filePath = process.argv[2]; // e.g., posts/en/tmp/echo.html
  
  if (!filePath || !filePath.endsWith('.html')) {
    console.log('Skipping non-HTML file.');
    return;
  }

  // 1. Path Parsing
  const pathParts = filePath.split('/');
  
  // Exception handling for invalid folder structure
  if (pathParts.length < 3 || pathParts[0] !== 'posts') {
    console.error('❌ Invalid folder structure. Please use posts/.../filename.html format.');
    return;
  }

  // Automatically assign folder names as labels (tags), excluding language folders like 'en'
  // e.g., posts/en/tmp/echo.html -> labels: ['tmp']
  const labels = pathParts.slice(1, -1).filter(label => label !== 'en');
  const topic = labels[labels.length - 1] || 'General'; 
  const fileName = pathParts[pathParts.length - 1]; // e.g., 'echo.html'
  
  // 2. Read Content & Extract Title
  const content = fs.readFileSync(filePath, 'utf8');

  // Try to extract title from the first <h1> tag in the content (e.g. <h1>Hello</h1>)
  const h1Match = content.match(/<h1>(.*?)<\/h1>/i);
  let title;
  if (h1Match && h1Match[1]) {
    title = h1Match[1].trim();
  } else {
    // Fallback: generate title from filename if <h1> is not found (e.g., 'echo.html' -> 'ECHO')
    title = fileName.replace('.html', '').replace(/-/g, ' ').toUpperCase();
  }

  // 3. Authentication (OAuth2)
  const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET
  );
  oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN,
  });
  const blogger = google.blogger({ version: 'v3', auth: oauth2Client });

  // 4. Call Blogger API (using "resource" for the payload to prevent blank posts)
  try {
    const res = await blogger.posts.insert({
      blogId: process.env.BLOG_ID,
      resource: {
        title: title,
        content: content,
        labels: labels
      },
      isDraft: true // Publish as draft
    });
    console.log(`✅ [Publish Success] [${labels.join(', ')}] ${title} - URL: ${res.data.url}`);
  } catch (error) {
    console.error(`❌ [Publish Failed]`, error.message);
  }
}

publishPost();