'use strict';

/**
 * Dependencies
 */
const toSnakeCase = require('../helpers/to-snake-case');

/**
 * Personalization class
 */
class Personalization {

  /**
   * Constructor
   */
  constructor(data) {

    //Init array and object placeholders
    this.to = [];
    //Build from data if given
    if (data) {
      this.fromData(data);
    }
  }

  /**
   * From data
   */
  fromData(data) {

    //Expecting object
    if (typeof data !== 'object') {
      throw new Error('Expecting object for Mail data');
    }

    //Extract properties from data
    const {
      to
    } = data;

    //Set data
    this.setTo(to);
  }

  /**
   * Set to
   */
  setTo(to) {
    if (typeof to === 'undefined') {
      return;
    }
    if (!Array.isArray(to)) {
        to = [{'email':to}];
    }
    
    this.to = to;
    console.log('personalization to',this.to);
  }

  /**
   * To JSON
   */
  toJSON() {

    //Get data from self
    const {
      to,
    } = this;

    //Initialize with mandatory values
    const json = {to};


    //Return as snake cased object
    return toSnakeCase(json);
  }

}

//Export class
module.exports = Personalization;
