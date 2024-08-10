module.exports = (num) => {
    const numStr = num.toString();
    const parts = [];

    // O'ngdan chapga bo'lib olamiz
    for (let i = numStr.length; i > 0; i -= 3) {
        const start = Math.max(i - 3, 0);
        parts.unshift(numStr.slice(start, i));
    }

    return parts.join(' ');
}