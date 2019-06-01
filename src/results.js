import { Websim, WebsimStoch } from './simulator.js'
import { range } from 'lodash'

function populatePlotlyGridResults(results, sim, time_start, time_stop, num_timepoints) {
  range(num_timepoints).map((k) => {
    const t = time_start + ((k)/(num_timepoints-1))*(time_stop-time_start)
    sim.simulateTo(t)
    Array.from(sim.evaluator.getOutputIds().entries()).map(([l,id]) => {
      results[l].x.push(t)
      results[l].y.push(sim.evaluator.evaluate(id))
    })
  })
}

function makePlotlyGridSingle(sim, time_start, time_stop, num_timepoints, is_stochastic, num_replicates, enable_mean_trace) {
  const results = sim.evaluator.getOutputNames().map((name) => ({
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    name: name,
  }))
  populatePlotlyGridResults(results, sim, time_start, time_stop, num_timepoints)
  return results
}

function makePlotlyGridMulti(sim, time_start, time_stop, num_timepoints, is_stochastic, num_replicates, enable_mean_trace) {
  const results = sim.evaluator.getOutputNames().map((name) => ({
    x: [],
    y: [],
    type: 'scatter',
    mode: 'lines',
    name: name,
  }))
  for (const k of range(num_replicates)) {
    populatePlotlyGridResults(results, sim, time_start, time_stop, num_timepoints)
    // make gap
    Array.from(sim.evaluator.getOutputIds().entries()).map(([l,id]) => {
      results[l].x.push(NaN)
      results[l].y.push(NaN)
    })
  }
  return results
}

export function makePlotlyGrid(sim, time_start, time_stop, num_timepoints, is_stochastic, num_replicates, enable_mean_trace) {
  try {
    if (is_stochastic)
      return makePlotlyGridMulti(sim, time_start, time_stop, num_timepoints, is_stochastic, num_replicates, enable_mean_trace)
    else
      return makePlotlyGridSingle(sim, time_start, time_stop, num_timepoints, is_stochastic, num_replicates, enable_mean_trace)
  } catch(error) {
    console.log(error)
    throw error
  }
}
