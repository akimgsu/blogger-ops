const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  STYLE_FILE_PATH: path.join(__dirname, '../styles/post-style.css'),
  REQUIRED_ENV: ['CLIENT_ID', 'CLIENT_SECRET', 'REFRESH_TOKEN', 'BLOG_ID']
};

/**
 * Validate that all required environment variables are present.
 */
function validateEnv() {
  const missing = CONFIG.REQUIRED_ENV.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.error(`❌ Error: Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

/**
 * Extract labels, title, and body content from the HTML post file.
 * @param {string} filePath - Path to the HTML post file
 * @returns {object} Parsed post data containing title, content, and labels
 */
function parsePostFile(filePath) {
  const pathParts = filePath.split('/');

  // Extract labels: directories under posts/ (excluding lang code 'en')
  const labels = pathParts.slice(1, -1)
    .map(name => name.trim().replace(/,/g, ''))
    .filter(name => name && name !== 'en');

  const fileContent = fs.readFileSync(filePath, 'utf8');

  // Extract title
  const titleMatch = fileContent.match(/<title>(.*?)<\/title>/i);
  const h1Match = fileContent.match(/<h1>(.*?)<\/h1>/i);
  const fileName = pathParts[pathParts.length - 1];
  const title = titleMatch
    ? titleMatch[1].trim()
    : (h1Match ? h1Match[1].trim() : fileName.replace('.html', '').replace(/-/g, ' ').toUpperCase());

  // Extract body content
  const bodyMatch = fileContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let postBodyContent = bodyMatch ? bodyMatch[1].trim() : fileContent;

  // Inject CSS styling if the stylesheet exists
  // if (fs.existsSync(CONFIG.STYLE_FILE_PATH)) {
  //   const cssContent = fs.readFileSync(CONFIG.STYLE_FILE_PATH, 'utf8');
  //   const styleTag = `\n<style>\n${cssContent}\n</style>\n`;
  //   postBodyContent = styleTag + postBodyContent;
  // }

  return { title, content: postBodyContent, labels };
}

/**
 * Initialize and authenticate the Blogger API client.
 * @returns {object} Authenticated Blogger client
 */
function getBloggerClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN
  });

  return google.blogger({
    version: 'v3',
    auth: oauth2Client
  });
}

/**
 * Main application runner.
 */
async function main() {
  validateEnv();

  const filePath = process.argv[2];
  if (!filePath) {
    console.error('❌ Error: No file path provided. Usage: node publish.js <path-to-html>');
    process.exit(1);
  }

  if (!filePath.endsWith('.html')) {
    console.error('❌ Error: File must be an HTML document.');
    process.exit(1);
  }

  try {
    console.log(`📖 Parsing post file: ${filePath}...`);
    const postData = parsePostFile(filePath);

    console.log(`🚀 Authenticating with Blogger API...`);
    const blogger = getBloggerClient();

    console.log(`Publishing: "${postData.title}" | Labels: [${postData.labels.join(', ')}]`);

    const response = await blogger.posts.insert({
      blogId: process.env.BLOG_ID,
      resource: {
        title: postData.title,
        content: postData.content,
        labels: postData.labels
      },
      isDraft: false
    });

    console.log(`✅ Success! Post published at: ${response.data.url}`);
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

main();