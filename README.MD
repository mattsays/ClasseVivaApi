# ClasseViva API

ClasseViva API is a library that helps you comunicating with the Spaggiari's website

It can be used in your web app or your mobile application as you prefer

## Installation
To install this library you will need [npm](https://www.npmjs.com)
```bash
npm install classeviva-api --save
```

## Sample Usage

```js
var classeviva = require('classeviva-api')

classeviva.login('user_id', 'password').then(user => {
    user.grades().then(grades => {
        console.log(grades)
    }).catch(() => {
        console.log("Can't obtain grades")
    })
}).catch(() => {
    console.log("Can't connect to ClasseViva server")
})
```
## License
[MIT](https://choosealicense.com/licenses/mit/)
