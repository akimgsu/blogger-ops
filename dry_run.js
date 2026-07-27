const fs = require('fs');
const filePath = process.argv[2];
const fileContent = fs.readFileSync(filePath, 'utf8');
const pathParts = filePath.split('/');
const labels = pathParts.slice(1, -1)
  .map(name => name.trim().replace(/,/g, ''))
  .filter(name => name && name !== 'en');

const titleMatch = fileContent.match(/<title>(.*?)<\/title>/i);
const h1Match = fileContent.match(/<h1>(.*?)<\/h1>/i);
const fileName = pathParts[pathParts.length - 1];
const title = titleMatch
  ? titleMatch[1].trim()
  : (h1Match ? h1Match[1].trim() : fileName.replace('.html', '').replace(/-/g, ' ').toUpperCase());

const bodyMatch = fileContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
let postBodyContent = bodyMatch ? bodyMatch[1].trim() : fileContent;

console.log({ title, labels, contentLen: postBodyContent.length });
