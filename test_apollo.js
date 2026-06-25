const https = require('https');

const apolloBody = {
    api_key: "FAKE_API_KEY_123",
    q_organization_name: "VNG",
    person_titles: ["Business Development", "Sales"],
    page: 1
};

const req = https.request({
    hostname: 'api.apollo.io',
    path: '/v1/mixed_people/search',
    method: 'POST',
    headers: { 
        'Content-Type': 'application/json'
    }
}, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log('Raw Response:', data));
});
req.write(JSON.stringify(apolloBody));
req.end();
