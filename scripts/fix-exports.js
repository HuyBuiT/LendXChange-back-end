// scripts/fix-exports.js
const fs = require('fs');
const path = require('path');

const targetDir = process.argv[2];
if (!targetDir) {
  console.error('Please provide target directory path');
  process.exit(1);
}

const fullPath = path.resolve(process.cwd(), targetDir);
if (!fs.existsSync(fullPath)) {
  console.error('Directory not found:', fullPath);
  process.exit(1);
}

function removeExports(filePath) {
  const pkg = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  delete pkg.exports;
  fs.writeFileSync(filePath, JSON.stringify(pkg, null, 2));
  console.log('Fixed:', filePath);
}

const files = fs.readdirSync(fullPath);
files.forEach(file => {
  const pkgPath = path.join(fullPath, file);
  console.log(pkgPath);
  if (fs.existsSync(pkgPath) && file == 'package.json') {
    removeExports(pkgPath);
  }
});