import { Evaluator } from './evaluator.js'

export class Websim {
  constructor(doc) {
    this.evaluator = new Evaluator(doc)
  }
}
