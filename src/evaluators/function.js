import { range } from 'lodash'

import { ComponentEvaluator } from './base.js'
import { Constant, FromSBMLMath } from '../symtree.js'
import { printAST } from '../symtree.js'


function decodeArg(ast) {
  switch(ast.getType()) {
    case libsbml.AST_NAME:
      return ast.getName()
    default:
      throw new Error('Function args should be name elements')
  }
}

 // *** Function ***
export class FunctionEvaluator extends ComponentEvaluator {
  constructor(func, evaluator, model) {
    if (!func.isSetIdAttribute())
      throw new Error('No id set for func')
    super(func.getId())

    this.argmap = new Map(
      range(func.getNumArguments()).map((k) => [k, decodeArg(func.getArgument(k))])
    )
    // for (const arg of range(func.getNumArguments()).map((k) => func.getArgument(k))) {
    //   console.log('arg')
    //   printAST(arg)
    // }

    if (func.isSetBody()) {
      const body = func.getBody()
      // console.log('function body for', this.id)
      // printAST(body)
      this.tree = FromSBMLMath(kinetic_law.getMath())
    } else {
      throw new Error('No function body')
    }
  }

  evaluate(evaluator, initial=false, conc=true) {
    return this.tree.evaluate(evaluator, initial, conc)
  }
}
