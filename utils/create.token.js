const axios = require('axios')

module.exports = async () => {
    const base_url = process.env.ESKIZ_BASE_URL
    const api = `${base_url}auth/login`
    const eskiz_email = process.env.ESKIZ_EMAIL
    const eskiz_password = process.env.ESKIZ_PASSWORD
    try {
        const body = {
            email: eskiz_email,
            password: eskiz_password
        }
        const {data} = await axios.post(api, body)
        return data;
        
    } catch (error) {
        console.log(error)
    }
}