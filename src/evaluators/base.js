export class EvaluatorBase {
  constructor() {
  }
}

export class ComponentEvaluator extends EvaluatorBase {
  constructor(id) {
    super()
    this.id = id
  }
}
