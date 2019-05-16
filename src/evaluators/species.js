import { ComponentEvaluator } from './base.js'
import { Constant, Product, Quotient, FromSBMLMath } from '../symtree.js'

function findComponent(model, id) {
  for (const c of model.compartments) {
    if (c.isSetIdAttribute() && c.getId() === id)
      return c
  }
  throw new Error('No compartment with id', id)
}

// *** Species ***
export class SpeciesEvaluator extends ComponentEvaluator {
 constructor(species, evaluator, model) {
   try {
     if (!species.isSetIdAttribute())
       throw new Error('No id set for compartment')
     super(species.getId())

     this.compartment = species.isSetCompartment() ? species.getCompartment() : null
     this.is_const = species.isSetConstant() && species.getConstant()
     this.is_boundary = species.isSetBoundaryCondition() && species.getBoundaryCondition()
     this.has_rule = false
     this.subs_units = species.isSetHasOnlySubstanceUnits() && species.getHasOnlySubstanceUnits()

     const convertToConc = (amt) => {
       if (this.compartment === null)
         throw new Error('Cannot convert to conc for species - no compartment set')
       return new Quotient(amt, evaluator.getTreeForComponent(findComponent(this.compartment), model))
     }

     const convertToAmt = (conc) => {
       if (this.compartment === null)
         throw new Error('Cannot convert to amt for species - no compartment set')
       return new Product(amt, evaluator.getTreeForComponent(findComponent(this.compartment), model))
     }

     const initial_conc = species.isSetInitialConcentration() ? species.getInitialConcentration() : null
     const initial_amt  = species.isSetInitialAmount() ? species.getInitialAmount() : null
     for (const rule of model.rules) {
       if (rule.isAssignment() && rule.isSetVariable() &&
           rule .getVariable() === this.id && rule.isSetMath()) {
         // species is set by an assignment rule
         this.tree = FromSBMLMath(rule.getMath())
         this.has_rule = true
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

 convertToConc(value, evaluator, initial, conc, bvars) {
   if (conc === true)
     return value
   else {
     if (this.compartment === null)
       throw new Error('Cannot convert if compartment not set')
     return value*evaluator.evaluate(this.compartment, initial, conc, bvars)
   }
 }

 convertToAmt(value, evaluator, initial, conc, bvars) {
   if (conc === false)
     return value
   else {
     if (this.compartment === null)
       throw new Error('Cannot convert if compartment not set')
     const c = evaluator.evaluate(this.compartment, initial, conc, bvars)
     if (c === 0)
       throw new Error('Compartment size zero')
     return value/c
   }
 }

 convert(value, evaluator, initial, is_conc, to_conc, bvars) {
   if (to_conc)
     return this.convertToConc(value, evaluator, initial, is_conc, bvars)
   else
     return this.convertToAmt(value, evaluator, initial, is_conc, bvars)
 }

 evaluate(evaluator, initial=false, conc=true, bvars = null) {
   if (initial)
     return this.convert(
       this.tree.evaluate(evaluator, initial, conc, bvars),
       evaluator, initial, !this.subs_units, conc, bvars)
   else
     return this.convert(
       this.value,
       evaluator, initial, !this.subs_units, conc, bvars)
 }

 initialize(evaluator, conc=true) {
   this.value = this.tree.evaluate(evaluator, true, conc)
   console.log('species initial val', this.id, this.value)
 }

 set(value, evaluator, initial=false, conc=true) {
   if (this.is_const)
     throw new Error('Cannot set value of species which is const')
   if (this.has_rule)
     throw new Error('Cannot set value of species which has a rate or assignment rule')
   if (!initial)
     this.value = this.convert(value, evaluator, initial, !this.subs_units, conc)
   else
     throw new Error('Cannot set species initial value')
 }

 isIndependent() {
   return !this.is_const && !this.is_boundary
 }
}
