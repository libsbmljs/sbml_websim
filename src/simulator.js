import { Evaluator } from './evaluator.js'
import { ODE } from './ode.js'

export class Websim {
  constructor(doc) {
    this.evaluator = new Evaluator(doc)
    this.ode = new ODE(this.evaluator)
  }

  setAbsoluteTolerance(value) {
    this.ode.setAbsoluteTolerance(value)
  }

  setRelativeTolerance(value) {
    this.ode.setRelativeTolerance(value)
  }

  getCurrentTime() {
    return this.evaluator.getCurrentTime()
  }

  simulateFor(duration) {
    const t = this.evaluator.getCurrentTime()
    return this.ode.solve(t, t+duration)
  }
}
