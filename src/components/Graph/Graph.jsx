import React from 'react';
import { Scatter } from 'react-chartjs-2';

import { getChartOptions } from '../../utils/math/options'

import * as El from './Graph.style'

const appendDefaultConfig = (dataSetsArr) => (
  dataSetsArr?.map(dataSet => ({ 
    borderColor: "#F1CA89",
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
  options,
  key
}) => (
  <El.GraphWrapper key={key}>
    <Scatter data={getDatasetsObject(datasets, useDefaultConfig)} options={getChartOptions(options)} />
  </El.GraphWrapper>
);

export default Graph;
