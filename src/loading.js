import { libsbml_promise, getLibsbmlReader } from './libsbml.js'
import { Websim } from './simulator.js'

export function loadFromSBML(sbml) {
  console.log('start loadFromSBML')
  return libsbml_promise.then(() => {
    console.log('start loadFromSBML promise')
    // const reader = new getLibsbml().SBMLReader()
    const reader = getLibsbmlReader()
    const doc = reader.readSBMLFromString(sbml)
    return new Websim(doc)
  })
}

/**
 * Loads a simulator instance from a URL.
 * @param  {string} url The URL of the SBML file.
 * @return {Promise} A promise that resolves to the simulator instance.
 */
export function loadFromURL(url) {
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(xhr.response);
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      }
    };
    xhr.onerror = function () {
      console.log('error',this.status);
      reject({
        status: this.status,
        statusText: xhr.statusText
      });
    };
    xhr.send();
  }).then((sbml) => loadFromSBML(sbml));
}

/**
 * Load from a file on disk. Node only.
 * @param  {string} filepath The path to the SBML file.
 * @return {Promise} A promise that resolves to the simulator instance.
 */
export function loadFromFile(filepath) {
  const {promisify} = require('util')
  const fs = require('fs')
  return promisify(fs.readFile)(filepath).then((bytes) => loadFromSBML(bytes))
}
