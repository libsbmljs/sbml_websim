import { Constant } from './symtree.js'

class ComponentEvaluator {
  constructor(id) {
    this.id = id
  }
}

 // compartment
class CompartmentEvaluator {
  constructor(compartment) {
    if (!compartment.isSetIdAttribute())
      throw new Error('No id set for compartment')

    super(compartment.getId())

    this.is_const = !compartment.isSetConstant() || compartment.getConstant()
    if (this.is_const){
      if (compartment.isSetSize())
        this.tree = Constant(compartment.getSize())
      else
        this.tree = Constant(1.0)
    } else {
      throw new Error('Non-const compartment')
    }

    // set current value to initial value
    this.value = this.tree.get()
  }

  evaluate(initial=false) {
    if (initial)
      return this.tree.get()
    else
      return this.value
  }

  set(value, initial=false) {
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
    this.evaluators = model.compartments.map((compartment) =>
      CompartmentEvaluator(compartment)
    )
    // this.special_initial_sts =
    // {
    //   id: compartment.getId(),
    //   tree: makeTreeCompartmentInitialValue(compartment)
    // }
  }

  // makeTreeCompartmentInitialValue(compartment) {
  //   if (compartment.isSetSize())
  //     return
  // }
}
