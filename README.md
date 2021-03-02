
# Mail Service for the SendGrid v3 Web API

This is a NodeJs service which can be used to send simple emails using [SendGrid v3 API](https://sendgrid.com/docs/api-reference/).


# Installation
This code is not available on npm yet so please fork this repo to use it.
  

## Prerequisites

- Node.js version 6, 8 or >=10
- A Twilio SendGrid account (tip - perform sender authentication and provide your credit card details to avoid authorised access error).

  

## Obtain an API Key

Create an API key by visiting [Twilio SendGrid UI](https://app.sendgrid.com/settings/api_keys).

  

## Setup Environment Variables

Run the below code on your terminal at the root of your project to create the .env file to store your key and avoid sharing your key into your code.

  

```bash

echo  "export SENDGRID_API_KEY='YOUR_API_KEY'" > sendgrid.env

echo  "sendgrid.env" >> .gitignore

source ./sendgrid.env

```

# Usage

Use the below sample code to send a simple email, and modify the `to` and `from` variables:

 
```js

const mail = require('@sendgrid/mail');

mail.setApiKey(process.env.SENDGRID_API_KEY);

const  msg = {

to:  'test@example.com',

from:  'test@example.com', // Use the email address or domain you verified above

subject:  'sample email',

text:  'sample email using send grid and Node.js',

html:  '<strong>Enjoy using this service and leave a star to the repo if you like.</strong>',

};

//ES6

mail

.send(msg)

.then(() => {}, error  => {

console.error(error);

  

if (error.response) {

console.error(error.response.body)

}

});

//ES8

(async () => {

try {

await  mail.send(msg);

} catch (error) {

console.error(error);

  

if (error.response) {

console.error(error.response.body)

}

}

})();

```

  

Upon executing the above code, you (person in `to`) should receive an email in the inbox. 
