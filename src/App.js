import React, { useEffect, useState } from 'react';

import { create, all } from 'mathjs';
import Graph from './components/Graph/Graph';

import { ndsolve, setInitialConditionsTo } from './utils/math/helpers'
import { getMainChartOptions, getEarthChartOptions } from './utils/math/options'
import { importCommonFunctions, importGlobals, importMotionEquations } from './utils/math/globalVariables'

function App() {
  const [dataSets, setDataSets] = useState([])

  useEffect(() => {
    const math = create(all);

    math.import({ ndsolve: ndsolve(math) });
  
    const parser = math.parser();
  
    importGlobals(parser);
    importMotionEquations(parser);
    importCommonFunctions(parser)

    // Remember to maintain the same variable order in the call to ndsolve.
    parser.evaluate("resultado_fase1 = ndsolve([drdt, dvdt, dmdt, dphidt, dgammadt, dtdt], [r0, v0, m0, phi0, gamma0, t0], dt, tfinal)")

    // Reset initial conditions for interstage flight
    setInitialConditionsTo(parser, {
      dm: '0 kg/s',
      tfinal: '10 s',
      x: 'flatten(resultado_fase1[end,:])',
      'x[3]': 'm2+m3+mp' // New mass after stage seperation
    })

    parser.evaluate("resultado_intersecao = ndsolve([drdt, dvdt, dmdt, dphidt, dgammadt, dtdt], x, dt, tfinal)")

    // Reset initial conditions for stage 2 flight
    setInitialConditionsTo(parser, {
      dm: '270.8 kg/s',
      isp_vac: '348 s',
      tfinal: '350 s',
      x: 'flatten(resultado_intersecao[end,:])',
    })

    parser.evaluate("resultado_fase2 = ndsolve([drdt, dvdt, dmdt, dphidt, dgammadt, dtdt], x, dt, tfinal)")

    // Reset initial conditions for unpowered flight
    setInitialConditionsTo(parser, {
      dm: '0 kg/s',
      tfinal: '900 s',
      dt: '10 s',
      x: 'flatten(resultado_fase2[end,:])',
    })

    parser.evaluate("resultado_desligado1 = ndsolve([drdt, dvdt, dmdt, dphidt, dgammadt, dtdt], x, dt, tfinal)")

    // Reset initial conditions for final orbit insertion
    setInitialConditionsTo(parser, {
      dm: '270.8 kg/s',
      tfinal: '39 s',
      dt: '0.5 s',
      x: 'flatten(resultado_desligado1[end,:])',
    })

    parser.evaluate("resultado_insercao = ndsolve([drdt, dvdt, dmdt, dphidt, dgammadt, dtdt], x, dt, tfinal)")

    // Reset initial conditions for unpowered flight
    setInitialConditionsTo(parser, {
      dm: '0 kg/s',
      tfinal: '250 s',
      dt: '10 s',
      x: 'flatten(resultado_insercao[end,:])',
    })

    parser.evaluate("resultado_desligado2 = ndsolve([drdt, dvdt, dmdt, dphidt, dgammadt, dtdt], x, dt, tfinal)")

    // Preparar resultados para criação dos graficos
    const resultNames = ['fase1', 'intersecao', 'fase2', 'desligado1', 'insercao', 'desligado2']
      .map(stageName => `resultado_${stageName}`)

    parser.set('result',
      math.concat(
        ...resultNames.map(resultName =>
          parser.evaluate(`${resultName}[:end-1, :]`)  // Evitar sobreposição
        ),
        0 // Concatenar na linha
      )
    )

    setDataSets(prevDataSets => ([
      ...prevDataSets,
      {
        useDefaultConfig: false,
        datasets: resultNames.map((resultName, i) => ({
          label: resultName.slice(10), // Remove o prefixo resultado_ da label
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

  const renderGraphs = () => {
    return dataSets?.map((dataSetConfig) => (
      <div style={{
        // maxWidth: '100vw',
        // maxHeight: '100vh',
      }}>
        <Graph 
          datasets={dataSetConfig?.datasets}
          options={dataSetConfig?.options}
          useDefaultConfig={dataSetConfig?.useDefaultConfig}
        />
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
