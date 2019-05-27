import { dexp } from 'probability-distributions'
import { sign } from './ode.js'

export class GibsonProcess {
  constructor(reaction_evaluator, reaction, evaluator) {
    this.reaction_evaluator = reaction_evaluator
    this.dependencies = reaction_evaluator.tree.dependencies()
    this.next_t = null
    this.reactant_ids =
      reaction.getNumReactants()).map((k) => reaction.getReactant(k).getSpecies())
    this.product_ids  =
      reaction.getNumProducts()).map((k) => reaction.getProduct(k).getSpecies())
    this.initialize(evaluator)
  }

  initialize(evaluator) {
    const p = this.reaction_evaluator.evaluateNow(evaluator, false, true, null)
    this.last_t = evaluator.getCurrentTime()
    this.p_old = p
    this.next_t = dexp(p) + evaluator.getCurrentTime()
  }

  update(evaluator) {
    const t = evaluator.getCurrentTime()
    const p = this.reaction_evaluator.evaluateNow(evaluator, false, true, null)
    const ratio = p > 0 ? this.p_old/p : null
    const delta_t = ratio !== 0 ? this.next_t-t : this.next_t-this.last_t

    if (ratio !== null) {
      this.last_t = t
      this.p_old = p
      this.next_t = ratio*delta_t + t
    } else {
      // if ratio = null, enter suspended state -- next time becomes infinity
      // reaction never occurs unless next time becomes non-zero
      // due to propensity change
      this.p_old = 0
      this.next_t = null
    }
  }

  updateIfChanged(evaluator, changed_quantities) {
    if (changed_quantities.some((q) => this.dependencies.includes(q)))
      this.update(evaluator)
  }

  compare(other) {
    if (this.next_t === null) // -1 = infinity
      return other.next_t === null ? 0 : 1
    return this.next_t - other.next_t
  }

  nextTime() {
    return this.next_t
  }

  apply(evaluator) {
    for (id of this.reactant_ids)
      evaluator.setValue(evaluator.evaluate(id, false, false)-1, false, false)
    for (id of this.product_ids)
      evaluator.setValue(evaluator.evaluate(id, false, false)+1, false, false)
    this.initialize(evaluator)
    return this.reactant_ids.concat(this.product_ids)
  }
}

export class GibsonSolver {
  constructor(evaluator, model) {
    this.evaluator = evaluator
    this.event_threshold = 0.001

    this.queue =
      model.reactions.map((r) => GibsonProcess(
        evaluator.evaluators.get(r.getId()),
        r,
        evaluator
      ))
    this.queue.sort((u,v) => u.compare(v))
  }

  _reinitializeQueue() {
    for (const p of this.queue)
      p.initialize(this.evaluator)
    this.queue.sort((u,v) => u.compare(v))
  }

  setEventThreshold(value) {
    this.event_threshold = value
  }

  step(trigger_state=null) {
    if (this.queue.length === 0)
      return
    const r = this.queue[0]
    const t = this.evaluator.getCurrentTime()
    this.evaluator.setCurrentTime(r.nextTime())

    // trigger is time-based - bisect
    if (this._didTriggerChange(trigger_state))
      this._bisect((t - this.evaluator.getCurrentTime())/2, trigger_state)

    const changed_quantities = r.apply(this.evaluator)
    for (p of this.queue)
      p.updateIfChanged(this.evaluator, changed_quantities)

    // trigger is state-based - apply immediately
    if (this._didTriggerChange(trigger_state)) {
      this.evaluator.applyEventAssignments(
        this.evaluator.getTriggerStates().map((v) => sign(v))
      )
      this._reinitializeQueue()
    }
  }

  until(t, trigger_state=null) {
    if (this.queue.length === 0)
      return
    while (true) {
      const next_t = this.queue[0].nextTime()
      if (next_t > t)
        return
      this.step(trigger_state)
    }
  }

  _didTriggerChange(trigger_state) {
    const signed_triggers = this.evaluator.getTriggerStates()
      .map((v) => sign(v))
    const difference = signed_triggers
      .map((v,k) => (v-trigger_state[k]))
    return difference.some((d) => d !== 0)
  }

  _bisect(h, trigger_state) {
    const t_end = this.evaluator.getCurrentTime()+h
    this.evaluator.setCurrentTime(t_end)
    const next_h = this._didTriggerChange(trigger_state) ? -Math.abs(h)/2 : Math.abs(h)/2
    if (Math.abs(h) < this.event_threshold) {
      if (next_h > 0)
        // advance past the trigger
        this.evaluator.setCurrentTime(t_end+h)
      this.evaluator.applyEventAssignments(
        this.evaluator.getTriggerStates().map((v) => sign(v))
      )
      this._reinitializeQueue()
    } else {
      this._bisect(next_h, trigger_state)
    }
  }
}
