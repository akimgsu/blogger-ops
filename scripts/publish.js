const { google } = require('googleapis');
const fs = require('fs');

async function publishPost() {
  const filePath = process.argv[2];
  if (!filePath || !filePath.endsWith('.html')) return;

  const pathParts = filePath.split('/');
  if (pathParts[0] !== 'posts' || pathParts.length < 3) {
    console.error('Error: File path must start with "posts/" and have a category folder.');
    process.exit(1);
  }

  // Extract metadata (labels, title) from file path and content
  const labels = pathParts.slice(1, -1)
    .map(name => name.trim().replace(/,/g, ''))
    .filter(name => name && name !== 'en');

  const content = fs.readFileSync(filePath, 'utf8');
  const titleMatch = content.match(/<title>(.*?)<\/title>/i);
  const h1Match = content.match(/<h1>(.*?)<\/h1>/i);
  const fileName = pathParts[pathParts.length - 1];
  const title = titleMatch 
    ? titleMatch[1].trim() 
    : (h1Match ? h1Match[1].trim() : fileName.replace('.html', '').replace(/-/g, ' ').toUpperCase());

  console.log(`Publishing: ${filePath} | Title: "${title}" | Labels: [${labels.join(', ')}]`);

  // Initialize Blogger client
  const auth = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET);
  auth.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });
  const blogger = google.blogger({ version: 'v3', auth });

  // Post to Blogger
  try {
    const res = await blogger.posts.insert({
      blogId: process.env.BLOG_ID,
      resource: { title, content, labels },
      isDraft: false
    });
    console.log(`Success: ${res.data.url}`);
  } catch (err) {
    console.error(`❌ Failure:`, err.message);
    if (err.response && err.response.data && err.response.data.error) {
      console.error(`Error Details:`, JSON.stringify(err.response.data.error, null, 2));
      const details = err.response.data.error.details;
      if (details) {
        for (const detail of details) {
          if (detail.links) {
            for (const link of detail.links) {
              console.error(`👉 Action Required: ${link.description} - ${link.url}`);
            }
          }
        }
      }
    }
    process.exit(1);
  }
}

publishPost();