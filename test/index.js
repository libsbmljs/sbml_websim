// import { assert } from 'chai'
// import {}
// import sbml_websim from '../src/index.js'
import { loadFromURL } from '../src/index.js'
import libsbml from 'libsbmljs_stable'

// describe('Basic Mocha String Test', function () {
//  it('should return number of charachters in a string', function () {
//         assert.equal("Hello".length, 5);
//     });
//
//  it('should return first charachter of the string', function () {
//         assert.equal("Hello".charAt(0), 'H');
//     });
// });

// describe('Loading', function () {
//   it('Loads an SBML file', (done) => {
//     assert.equal("Hello".length, 5);
//   })
// })

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000

describe('Loading', function () {
  it('Loads an SBML file', (done) => {
    expect("Hello".length).toEqual(5)
      // libsbml().then((libsbml) => {
      //   const reader = new libsbml.SBMLReader()
      //   libsbml.readSBMLFromURL('base/models/layout-glycolysis.xml').then((doc) => {
      //     done()
      //   })
      // })
    loadFromURL('http://localhost:9876/base/models/layout-glycolysis.xml').then((sim) => {
      console.log('loaded')
      done()
    }, (err) => {
      fail('Unable to load model')
    })
  })
})
