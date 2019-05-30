import { range } from 'lodash'

import { ComponentEvaluator } from './base.js'
import { Constant, FromSBMLMath } from '../symtree.js'
import { LocalParameterEvaluator } from './parameter.js'

 // *** Reaction ***
export class ReactionEvaluator extends ComponentEvaluator {
  constructor(reaction, evaluator, model) {
    if (!reaction.isSetIdAttribute())
      throw new Error('No id set for reaction')
    super(reaction.getId())

    this.parameter_evaluators = null

    if (reaction.isSetKineticLaw()) {
      const kinetic_law = reaction.getKineticLaw()
      if (kinetic_law.isSetMath())
        this.tree = FromSBMLMath(kinetic_law.getMath())
      else
        this.tree = new Constant(0)
      if (kinetic_law.getNumLocalParameters() > 0)
        this.parameter_evaluators = range(kinetic_law.getNumLocalParameters())
          .map((k) => new LocalParameterEvaluator(kinetic_law.getLocalParameter(k),evaluator,model))
      else if (kinetic_law.getNumParameters() > 0)
        this.parameter_evaluators = range(kinetic_law.getNumParameters())
          .map((k) => new LocalParameterEvaluator(kinetic_law.getParameter(k),evaluator,model))
    } else {
      this.tree = new Constant(0)
    }

    this.value = null
  }

  _buildBVars(evaluator, initial=false, conc=true, bvars = null) {
    if (this.parameter_evaluators !== null && this.parameter_evaluators.length > 0) {
      const local_params = new Map(
        Array.from(this.parameter_evaluators.map(
          (p) => [p.id, p.evaluate(evaluator, initial, conc, bvars)]
        )))
      if (bvars !== null)
        return new Map([...local_params, ...bvars])
      else
        return local_params
    } else
      return bvars
  }

  evaluate(evaluator, initial=false, conc=true, bvars = null) {
    if (initial)
      return this.tree.evaluate(evaluator, initial, conc, this._buildBVars(evaluator,initial,conc,bvars))
    else {
      return this.value
    }
  }

  evaluateNow(evaluator, initial=false, conc=true, bvars = null) {
    return this.tree.evaluate(evaluator, initial, conc, this._buildBVars(evaluator,initial,conc,bvars))
  }

  initialize(evaluator, conc=true) {
    this.value = this.tree.evaluate(evaluator, true, conc, this._buildBVars(evaluator,true,conc,null))
    // console.log('reaction', this.id, this.value)
    if (this.parameter_evaluators !== null) {
      for (const p of this.parameter_evaluators)
        p.initialize(evaluator,conc)
    }
  }

  update(evaluator, conc=true) {
    this.value = this.tree.evaluate(evaluator, false, conc, this._buildBVars(evaluator,true,conc,null))
  }

  set(value, evaluator, initial=false, conc=true) {
    if (!initial)
      this.value = value
    else
      throw new Error('Cannot set reaction initial value')
  }
}
