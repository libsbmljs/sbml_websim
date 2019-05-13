// import { assert } from 'chai'
// import {}
// import sbml_websim from 'app/bundle'

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
    done()
  })
})
