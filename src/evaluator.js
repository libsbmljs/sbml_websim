import { CompartmentEvaluator } from './evaluators/compartment.js'
import { SpeciesEvaluator } from './evaluators/species.js'
import { ReactionEvaluator } from './evaluators/reaction.js'

export class Evaluator {
  constructor(doc) {
    try {
      const model = doc.getModel()
      this.evaluators = new Map(model.compartments.map((compartment) =>
        [this.getIdFor(compartment), new CompartmentEvaluator(compartment, this, model)]
      ))
      for (const species of model.species) {
        if (!species.isSetIdAttribute())
          throw new Error('All species need ids')
        const id = species.getId()
        this.evaluators.set(id, new SpeciesEvaluator(species, this, model))
      }
      for (const reaction of model.reactions) {
        if (!reaction.isSetIdAttribute())
          throw new Error('All reactions need ids')
        const id = reaction.getId()
        this.evaluators.set(id, new ReactionEvaluator(reaction, this, model))
      }
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
      return new CompartmentEvaluator(compartment, this, model)
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
    return 0
  }

  initialize() {
    for (const [id, evaluator] of this.evaluators) {
      evaluator.initialize(this)
    }
  }

  evaluate(id, initial=false, conc=true) {
    if (!this.evaluators.has(id))
      throw new Error('No evaluator for id '+id)
    return this.evaluators.get(id).evaluate(this, initial, conc)
  }
}
