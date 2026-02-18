const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
const assetsDir = path.join(__dirname, 'assets');

// Clean dist directory
if (fs.existsSync(distDir)) {
    console.log('Cleaning existing dist directory...');
    fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir);

// Files to copy
const filesToCopy = [
    'index.html',
    'style.css',
    'app.js',
    'app2.js',
    'app3.js',
    'package.json'
];

console.log('Copying files...');
filesToCopy.forEach(file => {
    const src = path.join(__dirname, file);
    const dest = path.join(distDir, file);
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log(`- Copied ${file}`);
    } else {
        console.warn(`- Warning: ${file} not found`);
    }
});

// Copy assets folder
if (fs.existsSync(assetsDir)) {
    console.log('Copying assets...');
    fs.mkdirSync(path.join(distDir, 'assets'), { recursive: true });

    function copyDir(src, dest) {
        fs.mkdirSync(dest, { recursive: true });
        let entries = fs.readdirSync(src, { withFileTypes: true });

        for (let entry of entries) {
            let srcPath = path.join(src, entry.name);
            let destPath = path.join(dest, entry.name);

            entry.isDirectory() ? copyDir(srcPath, destPath) : fs.copyFileSync(srcPath, destPath);
        }
    }

    copyDir(assetsDir, path.join(distDir, 'assets'));
    console.log('- Copied assets folder');
}

console.log('Build complete! Your production files are in the "dist" directory.');
