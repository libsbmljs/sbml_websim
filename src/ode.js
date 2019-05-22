import { range } from 'lodash'
import { Solver } from 'odex'
import { sign as signjs } from 'mathjs'

// https://stackoverflow.com/questions/4852017/how-to-initialize-an-arrays-length-in-javascript

export function sign(v) {
  const r = signjs(v)
  return r === 0 ? 1 : r
}

export class ODE {
  constructor(evaluator) {
    this.evaluator = evaluator
    this.solver = new Solver(evaluator.getNumIndepVars())
    this.event_threshold = 0.001
  }

  setAbsoluteTolerance(value) {
    this.solver.absoluteTolerance = value
  }

  setRelativeTolerance(value) {
    this.solver.relativeTolerance = value
  }

  setEventThreshold(value) {
    this.event_threshold = value
  }

  _didTriggerChange(trigger_state) {
    const signed_triggers = this.evaluator.getTriggerStates()
      .map((v) => sign(v))
    const difference = signed_triggers
      .map((v,k) => (v-trigger_state[k]))
    return difference.some((d) => d !== 0)
  }

  _rootfind(trigger_state, n,x0,x1,y) {
    if (this._didTriggerChange(trigger_state)) {
      // trigger occurred in interval
      // find the time when the trigger occurred
      this.bisect((x0 - x1)/2, trigger_state)
      // finish
      this.solve(
        this.evaluator.getCurrentTime(),
        x1,
        this.evaluator.getTriggerStates()
          .map((v) => sign(v))
      )
    }
  }

  solve(t_start, t_end, trigger_state=null) {
    if (trigger_state !== null) {
      this.solver.solve(
        this.f.bind(this),
        t_start,
        this.evaluator.getIndepInitialVals(),
        t_end,
        this._rootfind.bind(this, trigger_state)
      )
    } else {
      this.solver.solve(
        this.f.bind(this),
        t_start,
        this.evaluator.getIndepInitialVals(),
        t_end)
    }
  }

  bisect(h, trigger_state) {
    const t_start = this.evaluator.getCurrentTime()
    const t_end = t_start+h
    this.solver.solve(this.f.bind(this), t_start, this.evaluator.getIndepInitialVals(), t_end)
    const next_h = this._didTriggerChange(trigger_state) ? -Math.abs(h)/2 : Math.abs(h)/2
    if (Math.abs(h) < this.event_threshold) {
      if (next_h > 0)
        // advance past the trigger
        this.solver.solve(this.f.bind(this), t_end, this.evaluator.getIndepInitialVals(), t_end+h)
      console.log('event triggered at', this.evaluator.getCurrentTime())
      this.evaluator.applyEventAssignments(
        this.evaluator.getTriggerStates().map((v) => sign(v))
      )
    } else {
      this.bisect(next_h, trigger_state)
    }
  }

  f(x, y) {
    // TODO: use static var?
    // x = time, y = indep. values
    this.evaluator.time = x
    for(var k=0, N=this.evaluator.getNumIndepVars(); k<N; k++)
      this.evaluator.setIndepValue(k, y[k])
    this.evaluator.updateReactionRates()
    // console.log(' rates at', this.evaluator.time, this.evaluator.calcIndepRates())
    return this.evaluator.calcIndepRates()
  }

}
