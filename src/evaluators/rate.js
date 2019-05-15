import { range } from 'lodash'

import { EvaluatorBase } from './base.js'
import { Constant, Product, Sum, Difference,
         Negation, Symbol, FromSBMLMath } from '../symtree.js'

function calcStoichiometry(ref, model) {
  if (ref.isSetStoichiometry())
    return new Constant(ref.getStoichiometry())
  else if (ref.isSetStoichiometryMath()) {
    for (const rule of model.rules) {
      if (rule.isInitialAssignment() && rule.isSetVariable() &&
          rule .getVariable() === this.id && rule.isSetMath())
        return FromSBMLMath(rule.getMath())
      throw new Error('No initial assignment rule for stoichiometry math')
    }
  } else
    // assume unity
    return new Constant(1)
    // throw new Error('Neither numeric stoichiometry nor stoichiometry math is set for species reference')
}

function appendToTree(newtree, tree, invert=false) {
  if (tree === null) {
    if (!invert)
      return newtree
    else
      return new Negation(newtree)
  }else {
    if (!invert)
      return new Sum(tree, newtree)
    else
      return new Difference(tree, newtree)
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

    // boundary species
    if (species.isSetBoundaryCondition() && species.getBoundaryCondition()) {
      this.tree = new Constant(0)
      return
    }

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
      if (!reaction.isSetIdAttribute())
        throw new Error('All reactions must have ids')
      // reactants
      for ( const reactant of range(
            reaction.getNumReactants()).map(
            (k) => reaction.getReactant(k) )) {
        if (reactant.isSetSpecies() && reactant.getSpecies() === this.id)
          this.tree = appendToTree(
              // new Product(calcStoichiometry(reactant, model), evaluator.getTreeForComponent(reaction)),
              new Product(calcStoichiometry(reactant, model), new Symbol(reaction.getId())),
              this.tree,
              true)
      }
      // products
      for ( const product of range(
            reaction.getNumProducts()).map(
            (k) => reaction.getProduct(k) )) {
        if (product.isSetSpecies() && product.getSpecies() === this.id)
          this.tree = appendToTree(
              new Product(calcStoichiometry(product, model), new Symbol(reaction.getId())),
              this.tree,
              false)
      }
    }

    if (this.tree === null)
      this.tree = new Constant(0)

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
