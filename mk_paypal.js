const apiCredentials = require('../auths/paypal/mike.json');
// console.log(apiCredentials)
const apiUrl = {
    sandbox: 'https://api-m.sandbox.paypal.com',
    live: 'https://api-m.paypal.com'
}
const endpoint = {
    invoices: '/v2/invoicing/invoices?total_required=true'
}