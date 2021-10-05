import React from 'react';
import { Scatter } from 'react-chartjs-2';

import { getChartOptions } from '../../utils/math/options'

const appendDefaultConfig = (dataSetsArr) => (
  dataSetsArr?.map(dataSet => ({ 
    borderColor: "#dc3912",
    fill: true,
    ...dataSet
  }))
);

const getDatasetsObject = (datasets, useDefaultConfig) => ({
  datasets: useDefaultConfig ? appendDefaultConfig(datasets) : datasets
});

const Graph = ({
  useDefaultConfig,
  datasets,
  options
}) => (
  <Scatter data={getDatasetsObject(datasets, useDefaultConfig)} options={getChartOptions(options)} />
);

export default Graph;
