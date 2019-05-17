import { BinaryOperator } from './binaryop.js'

export class RelationalEquals extends BinaryOperator {
  constructor(lhs, rhs) {
    super(lhs, rhs)
  }

  evaluate(evaluator, initial=false, conc=true, bvars=null) {
    return this.lhs.evaluate(evaluator, initial, conc, bvars) ===
           this.rhs.evaluate(evaluator, initial, conc, bvars) ? 1 : -1
  }
}
