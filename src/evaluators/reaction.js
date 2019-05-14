import { ComponentEvaluator } from './base.js'
import { Constant, Product, Quotient, FromSBMLMath } from './symtree.js'

 // *** Compartment ***
export class CompartmentEvaluator extends ComponentEvaluator {
  constructor(reaction, evaluator, model) {
    if (!reaction.isSetIdAttribute())
      throw new Error('No id set for reaction')
    super(reaction.getId())

    if (reaction.isSetMath())
      this.tree = new FromSBMLMath(reaction.getMath())
    else
      this.tree = new Constant(0)

    this.value = null
  }

  evaluate(evaluator, initial=false, conc=true) {
    if (initial)
      return this.tree.evaluate(evaluator, initial, conc)
    else {
      return this.value
    }
  }

  initialize(evaluator, conc=true) {
    this.value = this.tree.evaluate(evaluator, true, conc)
  }

  set(value, initial=false, conc=true) {
    if (!initial)
      this.value = value
    else
      throw new Error('Cannot set reaction initial value')
  }
}
