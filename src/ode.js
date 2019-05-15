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
    this.solver.solve(this.f.bind(this), t_start, this.evaluator.getIndepInitialVals(), t_end)
  }

  f(x, y) {
    // TODO: use static var?
    // x = time, y = indep. values
    this.evaluator.time = x
    for(var k=0, N=this.evaluator.getNumIndepVars(); k<N; k++) {
      this.evaluator.setIndepValue(k, y[k])
    }
    this.evaluator.updateReactionRates()
    console.log(' rates at', this.evaluator.time, this.evaluator.calcIndepRates())
    return this.evaluator.calcIndepRates()
  }

  // calcReactionRates() {
  //   // https://stackoverflow.com/questions/5349425/whats-the-fastest-way-to-loop-through-an-array-in-javascript
  //   for(var k=0, N=this.reaction_ids.length; k<N; k++) {
  //     this.reaction_rates[k] = this.evaluator.evaluate(this.reaction_ids[k], false, true)
  //     console.log('reaction rate', this.reaction_ids[k], this.reaction_rates[k])
  //   }
  // }
}
