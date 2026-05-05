const fs = require('fs');
const path = require('path');

const src1 = 'C:\\Users\\plagu\\.gemini\\antigravity\\brain\\3f747c39-e065-4a45-aba1-1ad323ee2413\\mydna_glassy_bg_1776840533421.png';
const dest1 = path.join(__dirname, 'assets', 'hero_bg.png');

const src2 = 'C:\\Users\\plagu\\.gemini\\antigravity\\brain\\3f747c39-e065-4a45-aba1-1ad323ee2413\\abstract_glassy_texture_1776840549189.png';
const dest2 = path.join(__dirname, 'assets', 'texture_bg.png');

if (!fs.existsSync(path.join(__dirname, 'assets'))) {
    fs.mkdirSync(path.join(__dirname, 'assets'));
}

fs.copyFileSync(src1, dest1);
fs.copyFileSync(src2, dest2);
console.log('Images copied successfully.');
