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
    try {
      loadFromURL('http://localhost:9876/base/models/repressilator.xml').then((sim) => {
        try {
          expect("Hello".length).toEqual(5)
          expect(sim.evaluator.evaluate('ATP', true, true)).toEqual(3)
          expect(sim.evaluator.evaluate('ATP', true, false)).toEqual(3)
          console.log('ATP amt', sim.evaluator.evaluate('ATP', true, false))
        } catch(error) {
          fail(error)
          console.log(error.stack)
        } finally {
          done()
        }
      }, (err) => {
        fail('Unable to load model')
      })
    } catch(error) {
      fail(error)
      console.log(error.stack)
    }
  })
})
