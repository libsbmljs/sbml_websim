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

 // *** Event ***
export class EventEvaluator extends ComponentEvaluator {
  constructor(event, evaluator, model) {
    if (!event.isSetIdAttribute())
      throw new Error('No id set for event')
    super(event.getId())

    if (!event.isSetTrigger())
      throw new Error('No trigger for event')
    const trigger = event.getTrigger()
    if (!trigger.isSetMath())
      throw new Error('Math for event trigger is empty')
    this.tree = FromSBMLMath(trigger.getMath())

    this.assignments = new Map(range(event.getNumEventAssignments())
      .map((k) => event.getEventAssignment(k))
      .map((assignment) => {
        if (!assignment.isSetVariable())
          throw new Error('Event assignment has no variable')
        if (!assignment.isSetMath())
          throw new Error('Math for event assignment is empty')
        return [assignment.getVariable(), FromSBMLMath(assignment.getMath())]
      }))
  }

  // evaluates the trigger
  evaluate(evaluator, initial=false, conc=true, bvars = null) {
    return this.tree.evaluate(evaluator, initial, conc, bvars)
  }

  applyEventAssignments(evaluator, conc=true) {
    for (const [id,tree] of this.assignments) {
      evaluator.setValue(
        id,
        tree.evaluate(evaluator, false, conc),
        false,
        conc
      )
    }
  }
}
