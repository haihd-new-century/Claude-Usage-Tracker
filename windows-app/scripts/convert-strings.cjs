const fs = require('fs');
const path = require('path');

function parseStrings(content) {
  const result = {};
  const lines = content.split('\n');
  const re = /^"([^"]+)"\s*=\s*"((?:[^"\\]|\\.)*)"\s*;/;
  for (const line of lines) {
    const match = line.match(re);
    if (match) {
      let value = match[2];
      let paramIdx = 0;
      value = value.replace(/%@/g, () => '{{value' + (paramIdx++) + '}}');
      value = value.replace(/%d/g, () => '{{count}}');
      value = value.replace(/\\"/g, '"');
      value = value.replace(/\\n/g, '\n');
      result[match[1]] = value;
    }
  }
  return result;
}

const langDirs = {
  'en': 'en.lproj',
  'de': 'de.lproj',
  'es': 'es.lproj',
  'fr': 'fr.lproj',
  'it': 'it.lproj',
  'ja': 'ja.lproj',
  'ko': 'ko.lproj',
  'pt': 'pt.lproj',
  'zh': 'zh-ch.lproj'
};

const rootDir = path.resolve(__dirname, '..', '..');
const outDir = path.join(rootDir, 'windows-app', 'src', 'i18n', 'locales');

for (const [lang, dir] of Object.entries(langDirs)) {
  const filePath = path.join(rootDir, 'Claude Usage', 'Resources', dir, 'Localizable.strings');
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const json = parseStrings(content);
    const outPath = path.join(outDir, lang + '.json');
    fs.writeFileSync(outPath, JSON.stringify(json, null, 2), 'utf-8');
    console.log(lang + ': ' + Object.keys(json).length + ' keys');
  } catch (e) {
    console.error('Error processing ' + lang + ': ' + e.message);
  }
}
console.log('Done!');
