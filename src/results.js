import { Websim, WebsimStoch } from './simulator.js'
import { range } from 'lodash'
import { mean } from 'mathjs'

const DEFAULT_PLOTLY_COLORS =
                        ['rgb(31, 119, 180)', 'rgb(255, 127, 14)',
                         'rgb(44, 160, 44)', 'rgb(214, 39, 40)',
                         'rgb(148, 103, 189)', 'rgb(140, 86, 75)',
                         'rgb(227, 119, 194)', 'rgb(127, 127, 127)',
                         'rgb(188, 189, 34)', 'rgb(23, 190, 207)']

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
    opacity: 0.5,
  }))
  for (const k of range(num_replicates)) {
    sim.resetToInitial()
    // console.log('rep',k,'of',num_replicates, sim.gibson.queue.map((p) => [p.reaction_evaluator.id, p.next_t]))
    populatePlotlyGridResults(results, sim, time_start, time_stop, num_timepoints)
    // make gap
    Array.from(sim.evaluator.getOutputIds().entries()).map(([l,id]) => {
      results[l].x.push(NaN)
      results[l].y.push(NaN)
    })
  }
  if (enable_mean_trace) {
    const mean_trace = Array.from(sim.evaluator.getOutputNames().entries()).map(([k,name]) => ({
      x: [],
      y: [],
      type: 'scatter',
      mode: 'lines',
      name: name+' (mean)',
      line: {
        color: DEFAULT_PLOTLY_COLORS[k%DEFAULT_PLOTLY_COLORS.length],
        width: 4,
      },
    }))
    for (const k of range(num_timepoints)) {
      const t = time_start + ((k)/(num_timepoints-1))*(time_stop-time_start)
      for (const l of range(sim.evaluator.getOutputIds().length)) {
        mean_trace[l].x.push(t)
        // console.log('(num_timepoints+1)',(num_timepoints+1),'k',k,'(num_timepoints+1)+k',(num_timepoints+1)+k)
        mean_trace[l].y.push(mean(range(num_replicates).map((m) =>
          results[l].y[m*(num_timepoints+1)+k]
        )))
      }
    }
    return results.concat(mean_trace)
  }
  else
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
