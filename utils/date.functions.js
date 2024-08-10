const ErrorResponse = require("./errorResponse")
const getMonthName = require('./getmonth')

// return string  date 
exports.returnStringDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0'); // "05"
    let  month = (date.getMonth() + 1).toString().padStart(2, '0'); // "01"
    const year = date.getFullYear().toString(); // "2024"
    month = getMonthName(month)
    return topshiriqSana = `${day}-${month} ${year}-йил`;
}
