'use strict';

/**
 * Dependencies
 */
const {Client} = require('../../client');
const {classes: {Mail}} = require('../../helpers');

/**
 * Mail service class
 */
class MailService {

  /**
   * Constructor
   */
  constructor() {

    // Set client.
    this.setClient(new Client());
  }

  /**
   * Set client
   */
  setClient(client) {
    this.client = client;

    return this;
  }

  /**
   * SendGrid API key passthrough for convenience.
   */
  setApiKey(apiKey) {
    this.client.setApiKey(apiKey);

    return this;
  }

  /**
   * Send email
   */
  send(data, cb) {
    //Array? Send in parallel
    if (Array.isArray(data)) {

      //Create promise
      const promise = Promise.all(data.map(item => {
        return this.send(item);
      }));

      //Execute callback if provided
      if (cb) {
        promise
          .then(result => cb(null, result))
          .catch(error => cb(error, null));
      }

      //Return promise
      return promise;
    }

    //Send mail
    try {

      //Create Mail instance from data and get JSON body for request
      const mail = Mail.create(data);
      const body = mail.toJSON();

      //Create request
      const request = {
        method: 'POST',
        url: '/v3/mail/send',
        body,
      };

      console.log('request body',body)

      //Send
      return this.client.request(request, cb);
    } catch (error) {

      //Pass to callback if provided
      if (cb) {
        cb(error, null);
      }

      //Reject promise
      return Promise.reject(error);
    }
  }

}

//Export class
module.exports = MailService;
