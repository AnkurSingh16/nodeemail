'use strict';
const axios = require('axios');
const pkg = require('../../../package.json');
const {
    mergeData,
    Response,
    ResponseError,
} = require('../../../helpers/helpers');

const API_KEY_PREFIX = 'SG.';
const SENDGRID_BASE_URL = 'https://api.sendgrid.com/';

class Client {
  constructor() {
    this.auth = '';

    this.defaultHeaders = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'sendgrid/' + pkg.version + ';nodejs',
    };

    this.defaultRequest = {
      baseUrl: SENDGRID_BASE_URL,
      url: '',
      method: 'GET',
      headers: {},
      maxContentLength: Infinity, // Don't limit the content length.
      maxBodyLength: Infinity,
    };
  }

  setApiKey(apiKey) {
    this.auth = 'Bearer ' + apiKey;
    this.setDefaultRequest('baseUrl', SENDGRID_BASE_URL);

    if (!this.isValidApiKey(apiKey)) {
      console.warn(`API key does not start with "${API_KEY_PREFIX}".`);
    }
  }


  isValidApiKey(apiKey) {
    return this.isString(apiKey) && apiKey.trim().startsWith(API_KEY_PREFIX);
  }


  isString(value) {
    return typeof value === 'string' || value instanceof String;
  }

  setDefaultRequest(key, value) {
    if (key !== null && typeof key === 'object') {
      // key is an object
      Object.assign(this.defaultRequest, key);
      return this;
    }

    this.defaultRequest[key] = value;
    return this;
  }

  createHeaders(data) {
    // Merge data with default headers.
    const headers = mergeData(this.defaultHeaders, data);

    // Add auth, but don't overwrite if header already set.
    if (typeof headers.Authorization === 'undefined' && this.auth) {
      headers.Authorization = this.auth;
    }

    return headers;
  }

  createRequest(data) {
    let options = {
      url: data.uri || data.url,
      baseUrl: data.baseUrl,
      method: data.method,
      data: data.body,
      params: data.qs,
      headers: data.headers,
    };

    // Merge data with default request.
    options = mergeData(this.defaultRequest, options);
    options.headers = this.createHeaders(options.headers);
    options.baseURL = options.baseUrl;
    delete options.baseUrl;

    return options;
  }

  request(data, cb) {
    data = this.createRequest(data);

    const promise = new Promise((resolve, reject) => {
      axios(data)
        .then(response => {
          return resolve([
            new Response(response.status, response.data, response.headers),
            response.data,
          ]);
        })
        .catch(error => {
          if (error.response) {
            if (error.response.status >= 400) {
              return reject(new ResponseError(error.response));
            }
          }
          return reject(error);
        });
    });

    // Throw an error in case a callback function was not passed.
    if (cb && typeof cb !== 'function') {
      throw new Error('Callback passed is not a function.');
    }

    if (cb) {
      return promise
        .then(result => cb(null, result))
        .catch(error => cb(error, null));
    }

    return promise;
  }
}

module.exports = Client;
