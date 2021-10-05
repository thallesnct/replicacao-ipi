export const getMainChartOptions = () => {
  return {
    scales: {
      xAxes: [{
        type: 'linear',
        position: 'bottom',
        scaleLabel: {
          display: true,
          labelString: 'surface distance travelled (in km)'
        }
      }],
      yAxes: [{
        type: 'linear',
        scaleLabel: {
          display: true,
          labelString: 'height above surface (in km)'
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
          labelString: 'time (in s)'
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
        min: -8000,
        max: 8000,
        display: false
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