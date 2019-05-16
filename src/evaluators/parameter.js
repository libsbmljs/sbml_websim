import { ComponentEvaluator } from './base.js'
import { Constant, FromSBMLMath } from '../symtree.js'

 // *** Parameter ***
export class ParameterEvaluator extends ComponentEvaluator {
  constructor(parameter, evaluator, model) {
    if (!parameter.isSetIdAttribute())
      throw new Error('No id set for parameter')
    super(parameter.getId())

    for (const rule of model.rules) {
      if (rule.isAssignment() && rule.isSetVariable() &&
          rule .getVariable() === this.id && rule.isSetMath()) {
        // parameter is set by an assignment rule
        this.tree = FromSBMLMath(rule.getMath())
        this.value = null
        return
      }
    }

    // if the value isn't set by a rule, just use the sbml attribute
    if (parameter.isSetValue())
      this.tree = new Constant(parameter.getValue())
    else
      this.tree = new Constant(0)

    this.value = null
  }

  evaluate(evaluator, initial=false, conc=true, bvars = null) {
    if (initial)
      return this.tree.evaluate(evaluator, initial, conc, bvars)
    else {
      return this.value
    }
  }

  initialize(evaluator, conc=true) {
    this.value = this.tree.evaluate(evaluator, true, conc)
  }

  set(value, evaluator, initial=false, conc=true) {
    if (!initial)
      this.value = value
    else
      throw new Error('Cannot set parameter initial value')
  }
}
