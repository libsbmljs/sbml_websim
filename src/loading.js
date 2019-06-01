import { libsbml_promise, getLibsbmlReader } from './libsbml.js'
import { Websim, WebsimStoch } from './simulator.js'

export function loadFromSBML(sbml, stochastic=false, stochastic_inc=1) {
  return libsbml_promise.then(() => {
    const reader = getLibsbmlReader()
    const doc = reader.readSBMLFromString(sbml)
    if (!stochastic)
      return new Websim(doc)
    else
      return new WebsimStoch(doc, stochastic_inc)
  })
}

/**
 * Loads a simulator instance from a URL.
 * @param  {string} url The URL of the SBML file.
 * @return {Promise} A promise that resolves to the simulator instance.
 */
export function loadFromURL(url, stochastic=false, stochastic_inc=1) {
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
  }).then((sbml) => loadFromSBML(sbml, stochastic, stochastic_inc));
}

/**
 * Load from a file on disk. Node only.
 * @param  {string} filepath The path to the SBML file.
 * @return {Promise} A promise that resolves to the simulator instance.
 */
export function loadFromFile(filepath, stochastic=false, stochastic_inc=1) {
  const {promisify} = require('util')
  const fs = require('fs')
  return promisify(fs.readFile)(filepath).then((bytes) => loadFromSBML(bytes, stochastic, stochastic_inc))
}
