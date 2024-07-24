/*
 * Copyright (C) 2020 Graylog, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the Server Side Public License, version 1,
 * as published by MongoDB, Inc.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * Server Side Public License for more details.
 *
 * You should have received a copy of the Server Side Public License
 * along with this program. If not, see
 * <http://www.mongodb.com/licensing/server-side-public-license>.
 */
import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

import { AggregationType, AggregationResult } from 'views/components/aggregationbuilder/AggregationBuilderPropTypes';
import type { VisualizationComponentProps } from 'views/components/aggregationbuilder/AggregationBuilder';
import { makeVisualization, retrieveChartData } from 'views/components/aggregationbuilder/AggregationBuilder';
import LineVisualizationConfig from 'views/logic/aggregationbuilder/visualizations/LineVisualizationConfig';
import toPlotly from 'views/logic/aggregationbuilder/visualizations/Interpolation';
import useChartData from 'views/components/visualizations/useChartData';
import useEvents from 'views/components/visualizations/useEvents';
import { DEFAULT_AXIS_TYPE } from 'views/logic/aggregationbuilder/visualizations/XYVisualization';
import useMapKeys from 'views/components/visualizations/useMapKeys';
import { keySeparator, humanSeparator } from 'views/Constants';
import { generateDomain, generateYAxis } from 'views/components/visualizations/utils/chartLayoytGenerators';
import useFieldUnitTypes from 'hooks/useFieldUnitTypes';
import useWidgetUnits from 'views/components/visualizations/hooks/useWidgetUnits';
import getSeriesUnit from 'views/components/visualizations/utils/getSeriesUnit';
import dataConvertor from 'views/components/visualizations/utils/dataConvertor';

import XYPlot from '../XYPlot';
import type { Generator } from '../ChartData';

const LineVisualization = makeVisualization(({
  config,
  data,
  effectiveTimerange,
  height,
}: VisualizationComponentProps) => {
  const { convertValueToUnit } = useFieldUnitTypes();
  const widgetUnits = useWidgetUnits(config);
  const { layouts, yAxisMapper } = useMemo(() => generateYAxis({ series: config.series, units: widgetUnits }), [config]);
  const _layout = useMemo(() => ({
    ...layouts,
    hovermode: 'x',
    xaxis: { domain: generateDomain(Object.keys(layouts)?.length) },
  }), [layouts]);
  const visualizationConfig = (config.visualizationConfig ?? LineVisualizationConfig.empty()) as LineVisualizationConfig;
  const { interpolation = 'linear', axisType = DEFAULT_AXIS_TYPE } = visualizationConfig;
  const mapKeys = useMapKeys();
  const rowPivotFields = useMemo(() => config?.rowPivots?.flatMap((pivot) => pivot.fields) ?? [], [config?.rowPivots]);
  const _mapKeys = useCallback((labels: string[]) => labels
    .map((label) => label.split(keySeparator)
      .map((l, i) => mapKeys(l, rowPivotFields[i]))
      .join(humanSeparator),
    ), [mapKeys, rowPivotFields]);
  const chartGenerator: Generator = useCallback(({ type, name, labels, values, originalName }) => {
    const yaxis = yAxisMapper[name];
    const curUnit = getSeriesUnit(config.series, name || originalName, widgetUnits);

    return ({
      type,
      name,
      yaxis,
      x: _mapKeys(labels),
      y: dataConvertor(values, convertValueToUnit, curUnit),
      originalName,
      line: { shape: toPlotly(interpolation) },
    });
  }, [_mapKeys, interpolation]);

  const rows = useMemo(() => retrieveChartData(data), [data]);
  const _chartDataResult = useChartData(rows, {
    widgetConfig: config,
    chartType: 'scatter',
    generator: chartGenerator,
  });

  const { eventChartData, shapes } = useEvents(config, data.events);

  const chartDataResult = eventChartData ? [..._chartDataResult, eventChartData] : _chartDataResult;
  const layout = shapes ? { ..._layout, shapes } : _layout;

  return (
    <XYPlot config={config}
            plotLayout={layout}
            axisType={axisType}
            effectiveTimerange={effectiveTimerange}
            height={height}
            chartData={chartDataResult} />
  );
}, 'line');

LineVisualization.propTypes = {
  config: AggregationType.isRequired,
  data: AggregationResult.isRequired,
  height: PropTypes.number,
};

export default LineVisualization;
