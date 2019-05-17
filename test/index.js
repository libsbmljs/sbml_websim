
import { loadFromURL } from '../src/index.js'
import libsbml from 'libsbmljs_stable'

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000

describe('Main', function () {
  it('Tests the repressilator model', (done) => {
    try {
      loadFromURL('http://localhost:9876/base/models/repressilator.xml').then((sim) => {
        try {
          // initial reaction rates
          expect(sim.evaluator.evaluate('Reaction1', true, true)).toBe(0)
          expect(sim.evaluator.evaluate('Reaction2', true, true)).toBeCloseTo(6.931, 3)
          expect(sim.evaluator.evaluate('Reaction5', true, true)).toBeCloseTo(138.629, 3)
          expect(sim.evaluator.evaluate('Reaction10', true, true)).toBe(30)
          expect(sim.evaluator.evaluate('Reaction11', true, true)).toBe(30)
          expect(sim.evaluator.evaluate('Reaction12', true, true)).toBe(30)

          // initial species values
          expect(sim.evaluator.evaluate('Y',  true, true)).toBe(20)

          // initial rates
          expect(sim.evaluator.evaluateIndepRate('PY',  true, true)).toBeCloseTo(138.63, 2)
          expect(sim.evaluator.evaluateIndepRate('Y',  true, true)).toBeCloseTo(23.07, 2)
          expect(sim.evaluator.evaluateIndepRate('X',  true, true)).toBe(30)
          expect(sim.evaluator.evaluateIndepRate('Z',  true, true)).toBe(30)

          // test results of simulation
          sim.simulateFor(100)
          // console.log('X at 100', sim.evaluator.evaluate('X', false, true))
          expect(sim.evaluator.evaluate('X', false, true)).toBeCloseTo(7.35, 2)
          expect(sim.evaluator.evaluate('Y', false, true)).toBeCloseTo(3.48, 2)
          expect(sim.evaluator.evaluate('Z', false, true)).toBeCloseTo(0.19, 2)
          expect(sim.evaluator.evaluate('PX', false, true)).toBeCloseTo(289, 0)
          expect(sim.evaluator.evaluate('PY', false, true)).toBeCloseTo(1038, 0)
          expect(sim.evaluator.evaluate('PZ', false, true)).toBeCloseTo(114, 0)
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

  it('Tests the glycolysis model', (done) => {
    try {
      loadFromURL('http://localhost:9876/base/models/layout-glycolysis.xml').then((sim) => {
        try {
          // initial reaction rates
          expect(sim.evaluator.evaluate('J0', true, true)).toBe(50)
          expect(sim.evaluator.evaluate('J9', true, true)).toBe(84)
          for (const r of ['J1', 'J2', 'J3', 'J4', 'J5', 'J6', 'J7', 'J8', 'J10'])
            expect(sim.evaluator.evaluate(r, true, true)).toBe(0)

          // initial species values
          expect(sim.evaluator.evaluate('Glucose',  true, true)).toBe(0)
          expect(sim.evaluator.evaluate('ATP',  true, true)).toBe(3)
          expect(sim.evaluator.evaluate('ADP',  true, true)).toBe(1)
          expect(sim.evaluator.evaluate('NAD',  true, true)).toBe(0.5)
          expect(sim.evaluator.evaluate('NADH', true, true)).toBe(0.5)
          // console.log('ATP amt', sim.evaluator.evaluate('ATP', true, false))

          // initial rates
          expect(sim.evaluator.evaluateIndepRate('Glucose',  true, true)).toBe(50)
          expect(sim.evaluator.evaluateIndepRate('ATP',  true, true)).toBe(-84)
          expect(sim.evaluator.evaluateIndepRate('ADP',  true, true)).toBe(84)
          expect(() => sim.evaluator.evaluateIndepRate('External_glucose',  true, true)).toThrow() // boundary


          // test results of simulation
          sim.simulateFor(0.2)
          expect(sim.evaluator.evaluate('Glucose', false, true)).toBeCloseTo(6.69, 2)
          expect(sim.evaluator.evaluate('fructose_1_6_bisphosphate', false, true)).toBeCloseTo(1.38, 2)
          expect(sim.evaluator.evaluate('glyceraldehyde_3_phosphate', false, true)).toBeCloseTo(0.16, 2)
          expect(sim.evaluator.evaluate('glycerate_3_phosphate', false, true)).toBeCloseTo(0.06, 2)
          expect(sim.evaluator.evaluate('pyruvate', false, true)).toBeCloseTo(1.23, 2)
          expect(sim.evaluator.evaluate('Acetyladehyde', false, true)).toBeCloseTo(0.01, 2)
          expect(sim.evaluator.evaluate('External_acetaldehyde', false, true)).toBeCloseTo(0.01, 2)
          expect(sim.evaluator.evaluate('ATP', false, true)).toBeCloseTo(0.004, 3)
          expect(sim.evaluator.evaluate('ADP', false, true)).toBeCloseTo(4.00, 2)
          expect(sim.evaluator.evaluate('NAD', false, true)).toBeCloseTo(0.41, 2)
          expect(sim.evaluator.evaluate('NADH', false, true)).toBeCloseTo(0.59, 2)
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

  it('Tests compartment math', (done) => {
    try {
      loadFromURL('http://localhost:9876/base/models/comp_test.xml').then((sim) => {
        try {
          // initial reaction rates
          expect(sim.evaluator.evaluate('J0', true, true)).toBe(100)
          expect(sim.evaluator.evaluate('J1', true, true)).toBe(0)

          // initial species values
          expect(sim.evaluator.evaluate('A', true, true)).toBe(10)
          expect(sim.evaluator.evaluate('B', true, true)).toBe(0)
          expect(sim.evaluator.evaluate('C', true, true)).toBe(0)

          // initial rates
          expect(sim.evaluator.evaluateIndepRate('A',  true, true)).toBe(-100)
          expect(sim.evaluator.evaluateIndepRate('B',  true, true)).toBe(50)
          expect(sim.evaluator.evaluateIndepRate('C',  true, true)).toBe(0)

          // test results of simulation
          sim.simulateFor(1)
          expect(sim.evaluator.evaluate('A', false, true)).toBeCloseTo(0.30, 2)
          expect(sim.evaluator.evaluate('B', false, true)).toBeCloseTo(0.59, 2)
          expect(sim.evaluator.evaluate('C', false, true)).toBeCloseTo(4.26, 2)
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

  it('Tests function evaluations', (done) => {
    try {
      loadFromURL('http://localhost:9876/base/models/func_test.xml').then((sim) => {
        try {
          // initial reaction rates
          expect(sim.evaluator.evaluate('J0', true, true)).toBe(200)

          // initial species values
          expect(sim.evaluator.evaluate('S1', true, true)).toBe(10)
          expect(sim.evaluator.evaluate('S2', true, true)).toBe(0)

          // initial rates
          expect(sim.evaluator.evaluateIndepRate('S1',  true, true)).toBe(-200)
          expect(sim.evaluator.evaluateIndepRate('S2',  true, true)).toBe(200)

          // test results of simulation
          sim.simulateFor(1)
          expect(sim.evaluator.evaluate('S1', false, true)).toBeCloseTo(4.29, 2)
          expect(sim.evaluator.evaluate('S2', false, true)).toBeCloseTo(5.71, 2)
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

  it('Tests variable parameters', (done) => {
    try {
      loadFromURL('http://localhost:9876/base/models/param_test.xml').then((sim) => {
        try {
          // initial reaction rates
          expect(sim.evaluator.evaluate('J0', true, true)).toBe(10)

          // initial species values
          expect(sim.evaluator.evaluate('S', true, true)).toBe(10)
          expect(sim.evaluator.evaluate('k', true, true)).toBe(1)

          // initial rates
          expect(sim.evaluator.evaluateIndepRate('S',  true, true)).toBe(-10)
          expect(sim.evaluator.evaluateIndepRate('k',  true, true)).toBe(-1)

          // test results of simulation
          sim.simulateFor(10)
          expect(sim.evaluator.evaluate('S', false, true)).toBeCloseTo(3.68, 2)
          expect(sim.evaluator.evaluate('k', false, true)*10e3).toBeCloseTo(1, 0)
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

  it('Tests the COPASI repressilator model', (done) => {
    try {
      loadFromURL('http://localhost:9876/base/models/repressilator-copasi.xml').then((sim) => {
        try {
          // initial reaction rates
          expect(sim.evaluator.evaluate('Reaction1', true, true)).toBe(0)
          expect(sim.evaluator.evaluate('Reaction2', true, true)).toBeCloseTo(6.931, 3)
          expect(sim.evaluator.evaluate('Reaction5', true, true)).toBeCloseTo(138.629, 3)
          expect(sim.evaluator.evaluate('Reaction10', true, true)).toBe(30)
          expect(sim.evaluator.evaluate('Reaction11', true, true)).toBe(30)
          expect(sim.evaluator.evaluate('Reaction12', true, true)).toBe(30)

          // initial species values
          expect(sim.evaluator.evaluate('Y',  true, true)).toBe(20)

          // initial rates
          expect(sim.evaluator.evaluateIndepRate('PY',  true, true)).toBeCloseTo(138.63, 2)
          expect(sim.evaluator.evaluateIndepRate('Y',  true, true)).toBeCloseTo(23.07, 2)
          expect(sim.evaluator.evaluateIndepRate('X',  true, true)).toBe(30)
          expect(sim.evaluator.evaluateIndepRate('Z',  true, true)).toBe(30)

          // test results of simulation
          sim.simulateFor(100)
          // console.log('X at 100', sim.evaluator.evaluate('X', false, true))
          expect(sim.evaluator.evaluate('X', false, true)).toBeCloseTo(7.35, 2)
          expect(sim.evaluator.evaluate('Y', false, true)).toBeCloseTo(3.48, 2)
          expect(sim.evaluator.evaluate('Z', false, true)).toBeCloseTo(0.19, 2)
          expect(sim.evaluator.evaluate('PX', false, true)).toBeCloseTo(289, 0)
          expect(sim.evaluator.evaluate('PY', false, true)).toBeCloseTo(1038, 0)
          expect(sim.evaluator.evaluate('PZ', false, true)).toBeCloseTo(114, 0)
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
