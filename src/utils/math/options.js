export const getMainChartOptions = () => {
  return {
    scales: {
      xAxes: [{
        type: 'linear',
        position: 'bottom',
        scaleLabel: {
          display: true,
          labelString: 'distancia viajada na superficie (em km)'
        }
      }],
      yAxes: [{
        type: 'linear',
        scaleLabel: {
          display: true,
          labelString: 'altura acima da superficie (em km)'
        }
      }]
    },
    animation: false
  }
}

export const getChartOptions = (options) => {
  return {
    scales: {
      xAxes: [{
        type: 'linear',
        position: 'bottom',
        scaleLabel: {
          display: true,
          labelString: 'tempo (em s)'
        }
      }]
    },
    animation: false,
    ...options
  }
}

export const getEarthChartOptions = () => {
  return {
    aspectRatio: 1,
    scales: {
      xAxes: [{
        type: 'linear',
        position: 'bottom',
        scaleLabel: {
          display: true,
          labelString: 'Representação de trajetória saindo da Terra'
        },
        min: -8000,
        max: 8000,
      }],
      yAxes: [{
        type: 'linear',
        min: -8000,
        max: 8000,
        display: false
      }]
    },
    legend: { display: false }
  }
}