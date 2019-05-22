import { SymTree } from './base.js'

export class BinaryOperator extends SymTree {
 constructor(lhs, rhs) {
   super()
   this.lhs = lhs
   this.rhs = rhs
 }
}

// ** binary ops **

export class Product extends BinaryOperator {
 constructor(lhs, rhs) {
   super(lhs, rhs)
 }

 evaluate(evaluator, initial=false, conc=true, bvars=null) {
   return this.lhs.evaluate(evaluator, initial, conc, bvars) *
          this.rhs.evaluate(evaluator, initial, conc, bvars)
 }
}

export class Quotient extends BinaryOperator {
 constructor(lhs, rhs) {
   super(lhs, rhs)
 }

 evaluate(evaluator, initial=false, conc=true, bvars=null) {
   return this.lhs.evaluate(evaluator, initial, conc, bvars) /
          this.rhs.evaluate(evaluator, initial, conc, bvars)
 }
}

export class Sum extends BinaryOperator {
 constructor(lhs, rhs) {
   super(lhs, rhs)
 }

 evaluate(evaluator, initial=false, conc=true, bvars=null) {
   return this.lhs.evaluate(evaluator, initial, conc, bvars) +
          this.rhs.evaluate(evaluator, initial, conc, bvars)
 }
}

export class Difference extends BinaryOperator {
 constructor(lhs, rhs) {
   super(lhs, rhs)
 }

 evaluate(evaluator, initial=false, conc=true, bvars=null) {
   return this.lhs.evaluate(evaluator, initial, conc, bvars) -
          this.rhs.evaluate(evaluator, initial, conc, bvars)
 }
}

export class Exponentiation extends BinaryOperator {
 constructor(lhs, rhs) {
   super(lhs, rhs)
 }

 evaluate(evaluator, initial=false, conc=true, bvars=null) {
   return Math.pow(
          this.lhs.evaluate(evaluator, initial, conc, bvars),
          this.rhs.evaluate(evaluator, initial, conc, bvars))
 }
}
