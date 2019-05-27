import { range } from 'lodash'

import { CompartmentEvaluator } from './evaluators/compartment.js'
import { SpeciesEvaluator } from './evaluators/species.js'
import { ReactionEvaluator } from './evaluators/reaction.js'
import { ParameterEvaluator } from './evaluators/parameter.js'
import { FunctionEvaluator } from './evaluators/function.js'
import { EventEvaluator } from './evaluators/event.js'
import { SpeciesRateEvaluator, RateRuleEvaluator } from './evaluators/rate.js'

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

function hasRateRule(component, model) {
  if (!component.isSetIdAttribute())
    throw new Error('No id set for component')
  const id = component.getId()

  for (const rule of model.rules) {
    if (rule.isRate() && rule.isSetVariable() &&
        rule .getVariable() === id && rule.isSetMath()) {
      return true
    }
  }
  return false
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
      this.reaction_evals = []
      for (const reaction of model.reactions) {
        if (!reaction.isSetIdAttribute())
          throw new Error('All reactions need ids')
        const id = reaction.getId()
        const e = new ReactionEvaluator(reaction, this, model)
        this.evaluators.set(id, e)
        this.reaction_evals.push(e)
      }
      // functions
      this.function_evaluators = new Map(range(model.getNumFunctionDefinitions())
        .map((k) => model.getFunctionDefinition(k))
        .map((func) => {
          if (!func.isSetIdAttribute())
            throw new Error('All functions need ids')
          const id = func.getId()
          return [id, new FunctionEvaluator(func, this, model)]
        }))
      // event triggers
      this.event_evals = model.events
        .filter((event) => event.isSetIdAttribute())
        .map((event) =>
        new EventEvaluator(event, this, model)
      )
      // independent rates (non-const species and parameters)
      this.indep_rate_evals = model.species
        .filter((species) => this.evaluators.get(species.getId()).isIndependent())
        .map((species) =>
        new SpeciesRateEvaluator(species, this, model)
      ).concat(
        model.parameters
        .filter((parameter) => hasRateRule(parameter, model))
        .map((parameter) =>
        new RateRuleEvaluator(parameter, this, model)
      ),
        model.compartments
        .filter((compartment) => hasRateRule(compartment, model))
        .map((compartment) =>
        new RateRuleEvaluator(compartment, this, model)
      ))
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

  setCurrentTime(value) {
    this.time = value
  }

  initialize() {
    for (const [id, evaluator] of this.evaluators) {
      evaluator.initialize(this)
    }
    // for (const evaluator of this.indep_rate_evals) {
    //   evaluator.initialize(this)
    // }
  }

  evaluate(id, initial=false, conc=true) {
    if (!this.evaluators.has(id))
      throw new Error('No evaluator for id '+id)
    return this.evaluators.get(id).evaluate(this, initial, conc)
  }

  setValue(id, value, initial=false, conc=true) {
    if (!this.evaluators.has(id))
      throw new Error('No evaluator for id '+id)
    this.evaluators.get(id).set(value, this, initial, conc)
  }

  setIndepValue(k, value, initial=false, conc=true) {
    this.setValue(this.indep_rate_evals[k].id, value, initial, conc)
  }

  evaluateIndepRate(id, initial=false, conc=true) {
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

  getIndepInitialVals() {
    return this.indep_rate_evals.map((e) => this.evaluate(e.id, true, true))
  }

  updateReactionRates() {
    for (const e of this.reaction_evals)
      e.update(this, true)
  }

  evaluateFunction(id, args, initial=false, conc=true) {
    if (!this.function_evaluators.has(id))
      throw new Error('No evaluator for function '+id)
    return this.function_evaluators.get(id).evaluate(this, args, initial, conc)
  }

  getTriggerStates() {
    return this.event_evals.map((trigger) =>
      trigger.evaluate(this, false, true, null)
    )
  }

  applyEventAssignments(trigger_state) {
    for (const [k,t] of trigger_state.entries()) {
      if (t > 1) {
        this.event_evals[k].applyEventAssignments(this, true)
      }
    }
  }
}
