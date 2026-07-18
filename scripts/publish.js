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

  // Automatically assign all folder names between 'posts' and the filename as labels (tags)
  // e.g., posts/en/tmp/echo.html -> ['en', 'tmp']
  const labels = pathParts.slice(1, -1);
  const topic = labels[labels.length - 1]; // innermost folder name (e.g., 'tmp')
  const fileName = pathParts[pathParts.length - 1]; // e.g., 'echo.html'
  
  // 2. Generate title from file name
  const title = fileName.replace('.html', '').replace(/-/g, ' ').toUpperCase();
  const content = fs.readFileSync(filePath, 'utf8');

  // 3. Authentication (OAuth2)
  const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET
  );
  oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN,
  });
  const blogger = google.blogger({ version: 'v3', auth: oauth2Client });

  // 4. Call Blogger API (automatically assign labels)
  try {
    const res = await blogger.posts.insert({
      blogId: process.env.BLOG_ID,
      requestBody: {
        title: title,
        content: content,
        labels: labels // 💡 Key: Automatically assign all folders in the path as blog labels!
      },
      isDraft: true // Publish as draft
    });
    console.log(`✅ [Publish Success] [${labels.join(', ')}] ${title} - URL: ${res.data.url}`);
  } catch (error) {
    console.error(`❌ [Publish Failed]`, error.message);
  }
}

publishPost();