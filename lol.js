var imgur = require('imgur');
imgur.uploadFile('test.png', 'iXUbfpc').then((json)=>{console.log(json.data.link)}).catch(function (err) {
        console.error(err.message);
    });
