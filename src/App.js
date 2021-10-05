import React, { useEffect, useState } from 'react';

import { create, all } from 'mathjs';
import { Line, Scatter } from 'react-chartjs-2';


import ndsolve from './utils/math/ndsolve'
import { getMainChartOptions, getChartOptions, getEarthChartOptions } from './utils/math/options'
import { importGlobals, importMotionEquations } from './utils/math/globalVariables'

function App() {
  const [dataSets, setDataSets] = useState([])

  useEffect(() => {
    const math = create(all);

    math.import({ ndsolve });
  
    const parser = math.parser();
  
    importGlobals(parser);
  
    importMotionEquations(parser);

    // It is important to maintain the same argument order for each of these functions.
    parser.evaluate("drdt(r, v, m, phi, gamma, t) = v sin(gamma)")
    parser.evaluate("dvdt(r, v, m, phi, gamma, t) = - gravity(r) * sin(gamma) + (thrust(isp(r)) - drag(r, v)) / m")
    parser.evaluate("dmdt(r, v, m, phi, gamma, t) = - dm")
    parser.evaluate("dphidt(r, v, m, phi, gamma, t) = angVel(r, v, gamma)")
    parser.evaluate("dgammadt(r, v, m, phi, gamma, t) = angVel(r, v, gamma) - gravity(r) * cos(gamma) / v * rad")
    parser.evaluate("dtdt(r, v, m, phi, gamma, t) = 1")

    // Remember to maintain the same variable order in the call to ndsolve.
    parser.evaluate("result_stage1 = ndsolve([drdt, dvdt, dmdt, dphidt, dgammadt, dtdt], [r0, v0, m0, phi0, gamma0, t0], dt, tfinal)")

    // Reset initial conditions for interstage flight
    parser.evaluate("dm = 0 kg/s")
    parser.evaluate("tfinal = 10 s")
    parser.evaluate("x = flatten(result_stage1[end,:])")
    parser.evaluate("x[3] = m2+m3+mp") // New mass after stage seperation
    parser.evaluate("result_interstage = ndsolve([drdt, dvdt, dmdt, dphidt, dgammadt, dtdt], x, dt, tfinal)")

    // Reset initial conditions for stage 2 flight
    parser.evaluate("dm = 270.8 kg/s")
    parser.evaluate("isp_vac = 348 s")
    parser.evaluate("tfinal = 350 s")
    parser.evaluate("x = flatten(result_interstage[end,:])")
    parser.evaluate("result_stage2 = ndsolve([drdt, dvdt, dmdt, dphidt, dgammadt, dtdt], x, dt, tfinal)")

    // Reset initial conditions for unpowered flight
    parser.evaluate("dm = 0 kg/s")
    parser.evaluate("tfinal = 900 s")
    parser.evaluate("dt = 10 s")
    parser.evaluate("x = flatten(result_stage2[end,:])")
    parser.evaluate("result_unpowered1 = ndsolve([drdt, dvdt, dmdt, dphidt, dgammadt, dtdt], x, dt, tfinal)")

    // Reset initial conditions for final orbit insertion
    parser.evaluate("dm = 270.8 kg/s")
    parser.evaluate("tfinal = 39 s")
    parser.evaluate("dt = 0.5 s")
    parser.evaluate("x = flatten(result_unpowered1[end,:])")
    parser.evaluate("result_insertion = ndsolve([drdt, dvdt, dmdt, dphidt, dgammadt, dtdt], x, dt, tfinal)")

    // Reset initial conditions for unpowered flight
    parser.evaluate("dm = 0 kg/s")
    parser.evaluate("tfinal = 250 s")
    parser.evaluate("dt = 10 s")
    parser.evaluate("x = flatten(result_insertion[end,:])")
    parser.evaluate("result_unpowered2 = ndsolve([drdt, dvdt, dmdt, dphidt, dgammadt, dtdt], x, dt, tfinal)")

    // Now it's time to prepare results for plotting
    const resultNames = ['stage1', 'interstage', 'stage2', 'unpowered1', 'insertion', 'unpowered2']
      .map(stageName => `result_${stageName}`)

    parser.set('result',
      math.concat(
        ...resultNames.map(resultName =>
          parser.evaluate(`${resultName}[:end-1, :]`)  // Avoid overlap
        ),
        0 // Concat in row-dimension
      )
    )

    setDataSets(prevDataSets => ([
      ...prevDataSets,
      {
        useDefaultConfig: false,
        datasets: resultNames.map((resultName, i) => ({
          label: resultName.slice(7),
          data: parser.evaluate(
            'concat('
            + `(${resultName}[:,4] - phi0) * r0 / rad / km,`  // Surface distance from start (in km)
            + `(${resultName}[:,1] - r0) / km`                // Height above surface (in km)
            + ')'
          ).toArray().map(([x, y]) => ({ x, y })),
          borderColor: i % 2 ? '#f2f4f6' : '#dc3912',
          fill: false,
        })),
        options: getMainChartOptions()
      },
      {
        useDefaultConfig: true,
        datasets: [
          {
            label: 'velocidade (m/s)',
            data: parser.evaluate("result[:,[2,6]]")
            .toArray()
            .map(([v, t]) => ({ x: t.toNumber('s'), y: v.toNumber('m/s') }))
          }
        ]
      },
      {
        useDefaultConfig: true,
        datasets: [
          {
            label: 'altura (km)',
            data: parser.evaluate("concat((result[:, 1] - r0), result[:, 6])")
              .toArray()
              .map(([r, t]) => ({ x: t.toNumber('s'), y: r.toNumber('km') })),
          }
        ]
      },
      {
        useDefaultConfig: true,
        datasets: [
          {
            label: 'gamma (deg)',
            data: parser.evaluate("result[:, [5,6]]")
              .toArray()
              .map(([gamma, t]) => ({ x: t.toNumber('s'), y: gamma.toNumber('deg') })),
          }
        ]
      },
      {
        useDefaultConfig: true,
        datasets: [
          {
            label: 'aceleração (m/s^2)',
            data: parser.evaluate("concat(diff(result[:, 2]) ./ diff(result[:, 6]), result[:end-1, 6])")
              .toArray()
              .map(([acc, t]) => ({ x: t.toNumber('s'), y: acc.toNumber('m/s^2') })),
          }
        ]
      },
      {
        useDefaultConfig: true,
        datasets: [
          {
            label: 'aceleração da resistência (m/s^2)',
            data: parser.evaluate("concat(drag(result[:, 1], result[:, 2]) ./ result[:, 3], result[:, 6])")
              .toArray()
              .map(([dragAcc, t]) => ({ x: t.toNumber('s'), y: dragAcc.toNumber('m/s^2') })),
          }
        ]
      },
      {
        useDefaultConfig: true,
        datasets: [
          {
            data: parser.evaluate("result[:, [1,4]]")
              .toArray()
              .map(([r, phi]) => math.rotate([r.toNumber('km'), 0], phi))
              .map(([x, y]) => ({ x, y })),
          },
          {
            data: parser.evaluate("map(0:0.25:360, function(angle) = rotate([r0/km, 0], angle))")
              .toArray()
              .map(([x, y]) => ({ x, y })),
            borderColor: "#f2f4f6",
            fill: true
          }
        ],
        options: getEarthChartOptions()
      }
    ]))
  }, [])

  console.log('First dataSet', dataSets[0])

  const appendDefaultConfig = (dataSetsArr) => (
    dataSetsArr?.map(dataSet => ({ 
      borderColor: "#dc3912",
      fill: true,
      ...dataSet
    }))
  );

  const renderGraphs = () => {
    console.log('RENDERING!!!!')

    return dataSets?.map((dataSetConfig) => (
      <div style={{
        // maxWidth: '100vw',
        // maxHeight: '100vh',
      }}>
        <Scatter data={{ datasets: !dataSetConfig?.useDefaultConfig ? dataSetConfig?.datasets : appendDefaultConfig(dataSetConfig?.datasets) }} options={getChartOptions(dataSetConfig?.options)} />
      </div>
    ))
  }

  return (
    <div className="App" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(1, 1fr)'
    }}>
      {renderGraphs()}
    </div>
  );
}

export default App;
