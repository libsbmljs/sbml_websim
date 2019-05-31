import { Websim, WebsimStoch } from './simulator.js'
import { range } from 'lodash'

export function makePlotlyGrid(sim, time_start, time_stop, num_timepoints, is_stochastic, num_replicates, enable_mean_trace) {
  try {
    const results = sim.evaluator.getOutputNames().map((name) => ({
      x: [],
      y: [],
      type: 'scatter',
      mode: 'lines',
      name: name,
    }))
    range(num_timepoints).map((k) => {
      const t = time_start + ((k)/(num_timepoints-1))*(time_stop-time_start)
      sim.simulateTo(t)
      Array.from(sim.evaluator.getOutputIds().entries()).map(([l,id]) => {
        results[l].x.push(t)
        results[l].y.push(sim.evaluator.evaluate(id))
      })
    })
    return results
  } catch(error) {
    console.log(error)
    throw error
  }
}
