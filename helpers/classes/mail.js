'use strict';

/**
 * Dependencies
 */
const Personalization = require('./personalization');
const toSnakeCase = require('../helpers/to-snake-case');
const arrayToJSON = require('../helpers/array-to-json');

/**
 * Mail class
 */
class Mail {

  /**
   * Constructor
   */
  constructor(data) {

    //Initialize array and object properties
    this.personalizations = [];
    this.content = [];

    //Process data if given
    if (data) {
      this.fromData(data);
    }
  }


  /**
   * Build from data
   */
  fromData(data) {

    //Expecting object
    if (typeof data !== 'object') {
      throw new Error('Expecting object for Mail data');
    }

    console.log('data', data)
    //Extract properties from data
    const {
      to, from, subject, text, html, personalizations,
    } = data;
    console.log('from',from);

    //Set data
    this.setFrom(from);
    this.setSubject(subject);

    //Add contents from text/html properties
    this.addTextContent(text);
    this.addHtmlContent(html);

    //Using "to" property for personalizations
    if (personalizations) {
      this.setPersonalizations(personalizations);
    } else {
      //Single email (possibly with multiple recipients in the to field)
      this.addTo(to);
    }
  }

  /**
   * Set from email
   */
  setFrom(from) {
    if (this._checkProperty('from', from, [this._checkUndefined])) {
      if (typeof from !== 'string' && typeof from.email !== 'string') {
        throw new Error('String or address object expected for `from`');
      }
      let temp = this._createEmailAddress(from).toString();
      this.from = {'email' : temp};
      console.log('setting from', this.from)
    }
  }

  /**
   * Set subject
   */
  setSubject(subject) {
    this._setProperty('subject', subject, 'string');
  }

  /**
   * Add content
   */
  addContent(content) {
    console.log('content',content)
    if (this._checkProperty('content', content, [this._createTypeCheck('object')])) {
      this.content.push(content);
    }
  }

  /**
   * Add text content
   */
  addTextContent(text) {
    console.log('text',text);
    if (this._checkProperty('text', text, [this._checkUndefined, this._createTypeCheck('string')])) {
      this.addContent({
        value: text,
        type: 'text/plain',
      });
    }
  }

  /**
   * Add HTML content
   */
  addHtmlContent(html) {
    if (this._checkProperty('html', html, [this._checkUndefined, this._createTypeCheck('string')])) {
      this.addContent({
        value: html,
        type: 'text/html',
      });
    }
  }

  /**
   * Set personalizations
   */
  setPersonalizations(personalizations) {
    if (!this._doArrayCheck('personalizations', personalizations)) {
      return;
    }

    if (!personalizations.every(personalization => typeof personalization === 'object')) {
      throw new Error('Array of objects expected for `personalizations`');
    }

    //Clear and use add helper to add one by one
    this.personalizations = [];
    personalizations
      .forEach(personalization => this.addPersonalization(personalization));
  }

    /**
   * Add personalization
   */
  addPersonalization(personalization) {
    //Convert to class if needed
    if (!(personalization instanceof Personalization)) {
      personalization = new Personalization(personalization);
    }

    //Push personalization to array
    this.personalizations.push(personalization);
  }

  /**
   * Convenience method for quickly creating personalizations
   */
  addTo(to) {
    if (
      typeof to === 'undefined'
    ) {
      throw new Error('Provide to');
    }
    this.addPersonalization(new Personalization({to}));
  }

    /**
   * To JSON
   */
  toJSON() {

    //Extract properties from self
    const {
      from, subject, content, personalizations,
    } = this;

    //Initialize with mandatory values
    const json = {
      from, subject, personalizations: arrayToJSON(personalizations),
    };

    //Array properties
    if (Array.isArray(content) && content.length > 0) {
      json.content = arrayToJSON(content);
    }

    //Return as snake cased object
    return toSnakeCase(json, ['headers']);
  }

  /**************************************************************************
   * Static helpers
   ***/

  /**
   * Create a Mail instance from given data
   */
  static create(data) {

    //Array?
    if (Array.isArray(data)) {
      return data
        .filter(item => !!item)
        .map(item => this.create(item));
    }

    //Already instance of Mail class?
    if (data instanceof Mail) {
      return data;
    }

    //Create instance
    return new Mail(data);
  }

  /**************************************************************************
   * helpers for property-setting checks
   ***/

  /**
   * Perform a set of checks on the new property value. Returns true if all
   * checks complete successfully without throwing errors or returning true.
   */
  _checkProperty(propertyName, value, checks) {
    return !checks.some((e) => e(propertyName, value));
  }

  /**
   * Set a property with normal undefined and type-checks
   */
  _setProperty(propertyName, value, propertyType) {
    let propertyChecksPassed = this._checkProperty(
      propertyName,
      value,
      [this._checkUndefined, this._createTypeCheck(propertyType)]);

    if (propertyChecksPassed) {
      this[propertyName] = value;
    }

    return propertyChecksPassed;
  }

  /**
   * Fail if the value is undefined.
   */
  _checkUndefined(propertyName, value) {
    return typeof value === 'undefined';
  }

  /**
   * Create and return a function that checks for a given type
   */
  _createTypeCheck(propertyType) {
    return (propertyName, value) => {
      if (typeof value !== propertyType) {
        throw new Error(propertyType + ' expected for `' + propertyName + '`');
      }
    };
  }

  /**
   * Create a check out of a callback. If the callback
   * returns false, the check will throw an error.
   */
  _createCheckThatThrows(check, errorString) {
    return (propertyName, value) => {
      if (!check(value)) {
        throw new Error(errorString);
      }
    };
  }


  /**
   * Check that a value isn't undefined and is an array.
   */
  _doArrayCheck(propertyName, value) {
    return this._checkProperty(
      propertyName,
      value,
      [this._checkUndefined, this._createCheckThatThrows(Array.isArray, 'Array expected for`' + propertyName + '`')]);
  }

  /**
   * Create an EmailAddress instance from given data
   */
  _createEmailAddress(data) {

    //Array?
    if (Array.isArray(data)) {
      return data
        .filter(item => !!item)
        .map(item => this.create(item));
    }
 
    //not array
    return data;
  }


}

//Export class
module.exports = Mail;
