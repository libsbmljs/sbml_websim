import { range } from 'lodash'

import { EvaluatorBase } from './base.js'
import { Product, Sum, Difference, Negation, FromSBMLMath } from '../symtree.js'

function calcStoichiometry(ref) {

}

function`appendToTree(newtree, tree, invert=false) {
  if (tree === null) {
    if (!invert)
      return newtree
    else
      return Negation(newtree)
  }else {
    if (!invert)
      return Sum(tree, newtree)
    else
      return Difference(tree, newtree)
  }
}

// *** Species rate of change ***
export class RateEvaluator extends EvaluatorBase {
  constructor(species, evaluator, model) {
    if (!species.isSetIdAttribute())
      throw new Error('No id set for species')
    super()
    this.id = species.getId()
    this.tree = null

    // use rate rule if set
    for (const rule of model.rules) {
      if (rule.isRate() && rule.isSetVariable() &&
          rule .getVariable() === this.id && rule.isSetMath()) {
        // species is set by a rate rule
        this.tree = FromSBMLMath(rule.getMath())
        // this.value = null
        return
      }
    }

    // calculate the rate based on reactions this species participates in
    for (const reaction of model.reactions) {
      for ( const reactant of range(
            reaction.getNumReactants()).map(
            (k) => reaction.getReactant(k) )) {
        if (reactant.isSetSpecies() && reactant.getSpecies() === this.id)
          this.tree = appendToTree(
              new Product(calcStoichiometry(reactant), evaluator.getTreeForComponent(reaction)),
              this.tree,
              false)
      }
   }

   // this.value = null
 }

  evaluate(evaluator, initial=false, conc=true) {
    // if (initial)
    // if (conc === false)
      // throw new Error('Eval species rate amounts not supported')
    return this.tree.evaluate(evaluator, initial, conc)
     // else {
     //   return this.value
     // }
  }

   initialize(evaluator, conc=true) {
     // this.value = this.tree.evaluate(evaluator, true, conc)
     console.log('species rate', this.id, this.evaluate(evaluator, true, true))
   }

 // set(value, initial=false, conc=true) {
 //   if (!initial)
 //     this.value = value
 //   else
 //     throw new Error('Cannot set reaction initial value')
 // }
}
