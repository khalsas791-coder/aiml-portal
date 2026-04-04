const fs = require('fs');

function optimizeFile(path) {
  let html = fs.readFileSync(path, 'utf8');
  let count = 0;
  
  // Regex to add loading="lazy" if not present
  html = html.replace(/<img(.*?)>/g, (match, attrs) => {
    if (!attrs.includes('loading="lazy"')) {
      count++;
      return `<img${attrs} loading="lazy">`;
    }
    return match;
  });

  fs.writeFileSync(path, html);
  console.log(`Optimized ${path}: added lazy loading to ${count} images.`);
}

optimizeFile('index.html');
