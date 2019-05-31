import { ComponentEvaluator } from './base.js'
import { Constant, Product, Quotient, FromSBMLMath } from '../symtree.js'

 // *** Compartment ***
export class CompartmentEvaluator extends ComponentEvaluator {
  constructor(compartment, evaluator, model) {
    if (!compartment.isSetIdAttribute())
      throw new Error('No id set for compartment')
    super(compartment.getId())
    if (compartment.isSetName())
      this.name = compartment.getName()

    this.is_const = !compartment.isSetConstant() || compartment.getConstant()
    if (this.is_const){
      if (compartment.isSetSize())
        this.tree = new Constant(compartment.getSize())
      else
        this.tree = new Constant(1.0)
    } else {
      throw new Error('Non-const compartment')
    }

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

  set(value, evaluator, initial=false, conc=true) {
    if (this.is_const)
      throw new Error('Cannot set value of compartment which is const')
    if (!initial)
      this.value = value
    else
      throw new Error('Cannot set compartment initial value')
  }
}
