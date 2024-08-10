// return date 
exports.returnDate = (date) => {
    let part = date.split('.');
    let topshiriqSana = new Date(`${part[2]}-${part[1]}-${part[0]}`);
    if (isNaN(Date.parse(topshiriqSana)) || part.length !== 3 ) return false
    return topshiriqSana
}

// return string  date 
exports.returnLocalDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0'); // "05"
    let  month = (date.getMonth() + 1).toString().padStart(2, '0'); // "01"
    const year = date.getFullYear().toString(); // "2024"
    return   `${day}.${month}.${year}`;
}
