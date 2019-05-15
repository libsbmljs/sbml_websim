import { CompartmentEvaluator } from './evaluators/compartment.js'
import { SpeciesEvaluator } from './evaluators/species.js'
import { ReactionEvaluator } from './evaluators/reaction.js'
import { ParameterEvaluator } from './evaluators/parameter.js'
import { RateEvaluator } from './evaluators/rate.js'

function isComponentIn(component, components) {
  if (!component.isSetIdAttribute())
    throw new Error('Id not set')
  for (const x of components) {
    if (x.isSetIdAttribute() && x.getId() === component.getId())
      return true
  }
  return false
}

function isCompartment(component, model) {
  return isComponentIn(component, model.compartments)
}

function isReaction(component, model) {
  return isComponentIn(component, model.reactions)
}

export class Evaluator {
  constructor(doc) {
    try {
      this.time = 0
      const model = doc.getModel()
      this.evaluators = new Map(model.compartments.map((compartment) =>
        [this.getIdFor(compartment), new CompartmentEvaluator(compartment, this, model)]
      ))
      // species
      for (const species of model.species) {
        if (!species.isSetIdAttribute())
          throw new Error('All species need ids')
        const id = species.getId()
        this.evaluators.set(id, new SpeciesEvaluator(species, this, model))
      }
      // parameters
      for (const parameter of model.parameters) {
        if (!parameter.isSetIdAttribute())
          throw new Error('All parameter need ids')
        const id = parameter.getId()
        this.evaluators.set(id, new ParameterEvaluator(parameter, this, model))
      }
      // reactions
      for (const reaction of model.reactions) {
        if (!reaction.isSetIdAttribute())
          throw new Error('All reactions need ids')
        const id = reaction.getId()
        this.evaluators.set(id, new ReactionEvaluator(reaction, this, model))
      }
      // species rates
      this.indep_rate_evals = model.species
        .filter((species) => this.evaluators.get(species.getId()).isIndependent())
        .map((species) =>
        new RateEvaluator(species, this, model)
      )
      this.indep_rate_evals_map = new Map(this.indep_rate_evals.map((e) => [e.id, e]))
      this.initialize()
    } catch(error) {
      console.log(error)
      throw(error)
    }
  }

  getIdFor(element) {
    if (!element.isSetIdAttribute())
      throw new Error('No id attribute')
    else
      return element.getId()
  }

  generateTreeForComponent(component, model) {
    if (isCompartment(component, model))
      return new CompartmentEvaluator(component, this, model)
    else if (isReaction(component, model))
      return new ReactionEvaluator(component, this, model)
    else
      throw new Error('Component unknown')
  }

  getTreeForComponent(component, model) {
    if (!component.isSetIdAttribute())
      throw new Error('Component has no id')
    const id = component.getId()
    if (!this.evaluators.has(id))
      this.evaluators.set(id, generateTreeForComponent(component))
    return this.evaluators.get(id).tree
  }

  getCurrentTime() {
    return this.time
  }

  initialize() {
    for (const [id, evaluator] of this.evaluators) {
      evaluator.initialize(this)
    }
      for (const evaluator of this.indep_rate_evals) {
        evaluator.initialize(this)
      }
  }

  evaluate(id, initial=false, conc=true) {
    if (!this.evaluators.has(id))
      throw new Error('No evaluator for id '+id)
    return this.evaluators.get(id).evaluate(this, initial, conc)
  }

  evaluateIndepRates(id, initial=false, conc=true) {
    if (!this.indep_rate_evals_map.has(id))
      throw new Error('No evaluator for id '+id)
    return this.indep_rate_evals_map.get(id).evaluate(this, initial, conc)
  }

  getNumIndepVars() {
    return this.indep_rate_evals.length
  }

  calcIndepRates() {
    return this.indep_rate_evals.map((e) => e.evaluate(this, false, true))
  }
}
