const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'senderIndex.txt');

// Initialize index file if it doesn't exist
if (!fs.existsSync(indexPath)) {
    fs.writeFileSync(indexPath, '0');
}

function getCurrentIndex() {
    const index = parseInt(fs.readFileSync(indexPath, 'utf8'), 10);
    return index;
}

function updateIndex(senderEmailsLength) {
    let currentIndex = getCurrentIndex();
    currentIndex = (currentIndex + 1) % senderEmailsLength; // Increment and wrap around
    fs.writeFileSync(indexPath, currentIndex.toString());
}

module.exports = { getCurrentIndex, updateIndex };