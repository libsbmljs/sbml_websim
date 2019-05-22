import { SymTree } from './base.js'

export class UnaryOperator extends SymTree {
 constructor(operand) {
   super()
   this.operand = operand
 }
}

// ** unary ops **

export class Negation extends UnaryOperator {
 constructor(operand) {
   super(operand)
 }

 evaluate(evaluator, initial=false, conc=true, bvars=null) {
   return -this.operand.evaluate(evaluator, initial, conc, bvars)
 }
}

export class Logarithm extends UnaryOperator {
 constructor(operand) {
   super(operand)
 }

 evaluate(evaluator, initial=false, conc=true, bvars=null) {
   return Math.log(this.operand.evaluate(evaluator, initial, conc, bvars))
 }
}
