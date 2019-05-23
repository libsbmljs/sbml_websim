import { dexp } from 'probability-distributions'

export class GibsonProcess {
  constructor(reaction_evaluator) {
    this.reaction_evaluator = reaction_evaluator
    this.next_t = null
  }

  initialize(evaluator) {
    const t = evaluator=getCurrentTime()
    const last_t = this.last_t !== null ? this.last_t : t
    const delta_t = this._sampleNextTime()
    const ratio = this._calcRatio()
    if (delta_t !== null)
      this.next_t = ratio*(evaluator=getCurrentTime()-last_t) + t
    else
      this.next_t = null
  }

  _calcRatio(evaluator) {

  }

  _sampleNextTime(evaluator) {
    const p = this.reaction_evaluator.evaluateNow(evaluator, false, true, null)
    if (p > 0) {
      this.last_t = null
      return dexp(p)
    } else {
      // enter suspended state -- next time becomes infinity
      // reaction never occurs unless next time becomes non-zero
      // due to propensity change
      this.last_t = evaluator=getCurrentTime()
      return null
    }
  }

  compare(other) {
    if (this.next_t === null || other.next_t === null)
      throw new Error('Cannot compare because next_t is not set')
    if (this.next_t === -1) // -1 = infinity
      return other.next_t === -1 ? 0 : 1
    return this.next_t - other.next_t
  }
}

export class GibsonSolver {
  constructor(evaluator, model) {
    this.queue = new TineQueue(
      model.reactions.map((r) => ),
      (u,v) => u.compare(v)
    )
  }
}
