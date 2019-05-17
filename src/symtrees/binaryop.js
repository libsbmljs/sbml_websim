import { SymTree } from './base.js'

export class BinaryOperator extends SymTree {
 constructor(lhs, rhs) {
   super()
   this.lhs = lhs
   this.rhs = rhs
 }
}
