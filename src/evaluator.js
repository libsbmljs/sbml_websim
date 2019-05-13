import { Constant, Product, Quotient, FromSBMLMath } from './symtree.js'

class ComponentEvaluator {
  constructor(id) {
    this.id = id
  }
}

 // *** Compartment ***
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

  set(value, initial=false, conc=true) {
    if (this.is_const)
      throw new Error('Cannot set value of compartment which is const')
    if (!initial)
      this.value = value
    else
      throw new Error('Cannot set compartment initial value')
  }
}



 // *** Species ***
class SpeciesEvaluator extends ComponentEvaluator {
  constructor(species, model, evaluator) {
    try {
      if (!species.isSetIdAttribute())
        throw new Error('No id set for compartment')
      super(species.getId())

      this.compartment = species.isSetCompartment() ? species.getCompartment() : null
      this.is_const = species.isSetConstant() && species.getConstant()
      this.is_boundary = species.isSetBoundaryCondition() && species.getBoundaryCondition()
      this.subs_units = species.isSetHasOnlySubstanceUnits() && species.getHasOnlySubstanceUnits()

      const convertToConc = (amt) => {
        if (this.compartment === null)
          throw new Error('Cannot convert to conc for species - no compartment set')
        return new Quotient(amt, evaluator.getTreeFor(this.compartment))
      }

      const convertToAmt = (conc) => {
        if (this.compartment === null)
          throw new Error('Cannot convert to amt for species - no compartment set')
        return new Product(amt, evaluator.getTreeFor(this.compartment))
      }

      const initial_conc = species.isSetInitialConcentration() ? species.getInitialConcentration() : null
      const initial_amt  = species.isSetInitialAmount() ? species.getInitialAmount() : null
      for (const rule of model.rules) {
        if (rule.isAssignment() && rule.isSetVariable() &&
            rule .getVariable() === this.id && rule.isSetMath()) {
          // species is set by an assignment rule
          this.tree = new FromSBMLMath(rule.getMath())
          this.value = null
          return
        }
      }

      if (this.subs_units) {
        // value is always in terms of amount
        if (initial_amt !== null)
          this.tree = new Constant(initial_amt)
        else if(initial_conc !== null)
          this.tree = convertToAmt(new Constant(initial_conc))
        else
          this.tree = new Constant(0)
          // throw new Error('Species with substance units but no initial amount and no assignment rule')
      } else {
        // not substance units - value is always in terms of conc
        if (initial_amt !== null)
          this.tree = convertToConc(new Constant(initial_amt))
        else if (initial_conc !== null)
          this.tree = new Constant(initial_conc)
        else
          this.tree = new Constant(0)
      }

      this.value = null
    } catch(error) {
      console.log(error)
      throw(error)
    }
  }

  convertToConc(value, evaluator, initial, conc) {
    if (conc === true)
      return value
    else {
      if (this.compartment === null)
        throw new Error('Cannot convert if compartment not set')
      return value*evaluator.evaluate(this.compartment, initial, conc)
    }
  }

  convertToAmt(value, evaluator, initial, conc) {
    if (conc === false)
      return value
    else {
      if (this.compartment === null)
        throw new Error('Cannot convert if compartment not set')
      const c = evaluator.evaluate(this.compartment, initial, conc)
      if (c === 0)
        throw new Error('Compartment size zero')
      return value/c
    }
  }

  convert(value, evaluator, initial, is_conc, to_conc) {
    if (to_conc)
      return this.convertToConc(value, evaluator, initial, to_conc)
    else
      return this.convertToAmt(value, evaluator, initial, to_conc)
  }

  evaluate(evaluator, initial=false, conc=true) {
    if (initial)
      return this.convert(
        this.tree.evaluate(evaluator, initial, conc),
        evaluator, initial, !this.subs_units, conc)
    else
      return this.convert(
        this.value,
        evaluator, initial, !this.subs_units, conc)
  }

  initialize(evaluator, conc=true) {
    this.value = this.tree.evaluate(evaluator, true, conc)
    console.log('species initial val', this.id, this.value)
  }

  set(value, initial=false, conc=true) {
    if (this.is_const)
      throw new Error('Cannot set value of species which is const')
    if (!initial)
      this.value = this.convert(value, evaluator, initial, !this.subs_units, conc)
    else
      throw new Error('Cannot set species initial value')
  }
}

export class Evaluator {
  constructor(doc) {
    try {
      const model = doc.getModel()
      this.evaluators = new Map(model.compartments.map((compartment) =>
        [this.getIdFor(compartment), new CompartmentEvaluator(compartment)]
      ))
      for (const species of model.species) {
        if (!species.isSetIdAttribute())
          throw new Error('All species need ids')
        const id = species.getId()
        this.evaluators.set(id, new SpeciesEvaluator(species, model, this))
      }
      console.log(typeof model.species[0])
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

  getTreeFor(id) {
    return this.evaluators.get(id).tree
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
