import { Evaluator } from './evaluator.js'
import { ODE, sign } from './ode.js'
import { GibsonSolver } from './nrm.js'

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
    this.ode.solve(t, t+duration, this.evaluator.getTriggerStates().map((v) => sign(v)))
  }

  simulateTo(t_end) {
    try {
      const t = this.evaluator.getCurrentTime()
      if (t_end === t)
        return
      if (t_end < t)
        throw new Error('simulateTo was called with t_end < current time')
      // bug?
      console.log('simulateTo', t, 'to', t_end)
      this.ode.solve(t, t_end, this.evaluator.getTriggerStates().map((v) => sign(v)))
    } catch(error) {
      console.log(error)
      throw error
    }
  }
}

export class WebsimStoch {
  constructor(doc) {
    this.evaluator = new Evaluator(doc)
    this.gibson = new GibsonSolver(this.evaluator, doc.getModel())
  }

  getCurrentTime() {
    return this.evaluator.getCurrentTime()
  }

  simulateFor(duration) {
    const t = this.evaluator.getCurrentTime()
    this.gibson.until(t+duration, this.evaluator.getTriggerStates().map((v) => sign(v)))
  }

  simulateTo(t_end) {
    const t = this.evaluator.getCurrentTime()
    if (t_end === t)
      return
    if (t_end < t)
      throw new Error('simulateTo was called with t_end < current time')
    this.gibson.until(t_end, this.evaluator.getTriggerStates().map((v) => sign(v)))
  }

  simulateGrid(t_start, t_end, n_rows) {
  }
}
