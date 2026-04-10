const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, 'dist');
if (!fs.existsSync(dist)) fs.mkdirSync(dist);

// Simplistic copier
const copyRecursiveSync = (src, dest) => {
  if (fs.statSync(src).isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest);
    fs.readdirSync(src).map(f => copyRecursiveSync(path.join(src, f), path.join(dest, f)));
  } else {
    fs.copyFileSync(src, dest);
  }
};

console.log("🛠 NEURAL BUILD ENGINE: Optimizing Assets...");
['css', 'js', 'assets', 'index.html', 'admin.html', 'sw.js'].forEach(f => {
    const src = path.join(__dirname, f);
    if(fs.existsSync(src)) {
        copyRecursiveSync(src, path.join(dist, f));
        
        // 🧪 NEURAL MINIFICATION
        if(f.endsWith('.css') || f.endsWith('.js') || f.endsWith('.html')) {
            const fullPath = path.join(dist, f);
            const files = fs.lstatSync(fullPath).isDirectory() 
                ? fs.readdirSync(fullPath).map(cf => path.join(fullPath, cf)) 
                : [fullPath];

            files.forEach(file => {
                if(fs.lstatSync(file).isFile()) {
                    let content = fs.readFileSync(file, 'utf8');
                    // Simple minifier regex
                    content = content.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '$1'); // Comments
                    content = content.replace(/\s+/g, ' '); // Whitespace
                    fs.writeFileSync(file, content);
                }
            });
        }
    }
});

console.log("⚡ Optimization Complete. Output: /dist");
