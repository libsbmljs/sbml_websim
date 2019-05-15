import { range } from 'lodash'
import { Solver } from 'odex'

// https://stackoverflow.com/questions/4852017/how-to-initialize-an-arrays-length-in-javascript

export class ODE {
  constructor(evaluator) {
    this.evaluator = evaluator
    this.solver = new Solver(evaluator.getNumIndepVars())
  }

  setAbsoluteTolerance(value) {
    this.solver.absoluteTolerance = value
  }

  setRelativeTolerance(value) {
    this.solver.relativeTolerance = value
  }

  solve(t_start, t_end) {
    this.solver.solve(this.f, t_start, evaluator.getIndepInitialVals(), t_end)
  }

  f() {
    // TODO: use static var?
    return this.solver.calcIndepRates()
  }

  calcReactionRates() {
    // https://stackoverflow.com/questions/5349425/whats-the-fastest-way-to-loop-through-an-array-in-javascript
    for(var k=0, N=this.reaction_ids.length; k<N; k++) {
      this.reaction_rates[k] = this.evaluator.evaluate(this.reaction_ids[k], false, true)
      console.log('reaction rate', this.reaction_ids[k], this.reaction_rates[k])
    }
  }
}
