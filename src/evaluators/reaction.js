import { ComponentEvaluator } from './base.js'
import { Constant, FromSBMLMath } from '../symtree.js'

 // *** Reaction ***
export class ReactionEvaluator extends ComponentEvaluator {
  constructor(reaction, evaluator, model) {
    if (!reaction.isSetIdAttribute())
      throw new Error('No id set for reaction')
    super(reaction.getId())

    if (reaction.isSetKineticLaw()) {
      const kinetic_law = reaction.getKineticLaw()
      if (kinetic_law.isSetMath())
        this.tree = FromSBMLMath(kinetic_law.getMath())
      else
        this.tree = new Constant(0)
    } else {
      this.tree = new Constant(0)
    }

    this.value = null
  }

  evaluate(evaluator, initial=false, conc=true, bvars = null) {
    if (initial)
      return this.tree.evaluate(evaluator, initial, conc, bvars)
    else {
      return this.value
    }
  }

  evaluateNow(evaluator, initial=false, conc=true, bvars = null) {
    return this.tree.evaluate(evaluator, initial, conc, bvars)
  }

  initialize(evaluator, conc=true) {
    this.value = this.tree.evaluate(evaluator, true, conc)
    // console.log('reaction', this.id, this.value)
  }

  update(evaluator, conc=true) {
    this.value = this.tree.evaluate(evaluator, false, conc)
  }

  set(value, evaluator, initial=false, conc=true) {
    if (!initial)
      this.value = value
    else
      throw new Error('Cannot set reaction initial value')
  }
}
