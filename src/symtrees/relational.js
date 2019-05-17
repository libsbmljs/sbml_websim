import { BinaryOperator } from './binaryop.js'

function bumpZero(v) {
  if (v === 0)
    return 0.0001
}

export class RelationalEqual extends BinaryOperator {
  constructor(lhs, rhs) {
    super(lhs, rhs)
  }

  evaluate(evaluator, initial=false, conc=true, bvars=null) {
    return this.lhs.evaluate(evaluator, initial, conc, bvars) ===
           this.rhs.evaluate(evaluator, initial, conc, bvars) ? 1 : -1
  }
}

export class RelationalNotEqual extends BinaryOperator {
  constructor(lhs, rhs) {
    super(lhs, rhs)
  }

  evaluate(evaluator, initial=false, conc=true, bvars=null) {
    return this.lhs.evaluate(evaluator, initial, conc, bvars) !==
           this.rhs.evaluate(evaluator, initial, conc, bvars) ? 1 : -1
  }
}

export class RelationalLT extends BinaryOperator {
  constructor(lhs, rhs) {
    super(lhs, rhs)
  }

  evaluate(evaluator, initial=false, conc=true, bvars=null) {
    return this.lhs.evaluate(evaluator, initial, conc, bvars) -
           this.rhs.evaluate(evaluator, initial, conc, bvars)
  }
}

export class RelationalLTE extends BinaryOperator {
  constructor(lhs, rhs) {
    super(lhs, rhs)
  }

  evaluate(evaluator, initial=false, conc=true, bvars=null) {
    return bumpZero(
           this.lhs.evaluate(evaluator, initial, conc, bvars) -
           this.rhs.evaluate(evaluator, initial, conc, bvars))
  }
}
