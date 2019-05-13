import { Constant } from './symtree.js'

class ComponentEvaluator {
  constructor(id) {
    this.id = id
  }
}

 // compartment
class CompartmentEvaluator extends ComponentEvaluator {
  constructor(compartment, evaluator) {
    if (!compartment.isSetIdAttribute())
      throw new Error('No id set for compartment')
    super(compartment.getId())

    this.is_const = !compartment.isSetConstant() || compartment.getConstant()
    if (this.is_const){
      if (compartment.isSetSize())
        this.tree = new Constant(compartment.getSize())
      else
        this.tree = new Constant(1.0)
    } else {
      throw new Error('Non-const compartment')
    }

    // set current value to initial value
    this.value = null
  }

  evaluate(evaluator, initial=false, conc=true) {
    if (initial)
      return this.tree.evaluate(evaluator, initial, conc)
    else {
      // if (this.value === null)
      //   this.initialize(evaluator, conc)
      return this.value
    }
  }

  initialize(evaluator, conc=true) {
    this.value = this.tree.evaluate(evaluator, true, conc)
  }

  set(value, initial=false, conc=true) {
    if (this.is_const)
      throw new Error('Cannot set value of compartment which is const')
    if (!initial)
      this.value = value
    else
      throw new Error('Cannot set compartment initial value')
  }
}

export class Evaluator {
  constructor(doc) {
    const model = doc.getModel()
    this.evaluators = new Map(model.compartments.map((compartment) =>
      [this.getIdFor(compartment), new CompartmentEvaluator(compartment)]
    ))
    this.initialize()
  }

  getIdFor(element) {
    if (!element.isSetIdAttribute())
      throw new Error('No id attribute')
    else
      return element.getId()
  }

  initialize() {
    for (const [id, evaluator] of this.evaluators) {
      evaluator.initialize(this)
    }
  }

  evaluate(id, initial=false, conc=true) {
    return this.evaluators.get(id).evaluate(this, initial, conc)
  }
}
