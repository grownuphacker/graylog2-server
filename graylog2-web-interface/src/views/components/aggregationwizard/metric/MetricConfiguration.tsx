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
import * as React from 'react';
import { Field, useFormikContext, getIn } from 'formik';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import * as Immutable from 'immutable';

import { defaultCompare } from 'logic/DefaultCompare';
import { Input } from 'components/bootstrap';
import Select from 'components/common/Select';
import type { WidgetConfigFormValues } from 'views/components/aggregationwizard/WidgetConfigForm';
import { InputOptionalInfo as Opt, FormikInput } from 'components/common';
import type { Property } from 'views/logic/fieldtypes/FieldType';
import { Properties } from 'views/logic/fieldtypes/FieldType';
import useAggregationFunctions from 'views/hooks/useAggregationFunctions';
import { percentileOptions, percentageStrategyOptions } from 'views/Constants';
import type FieldTypeMapping from 'views/logic/fieldtypes/FieldTypeMapping';
import isFunctionAllowsUnit from 'views/logic/isFunctionAllowsUnit';
import useFieldTypesUnits from 'views/hooks/useFieldTypesUnits';
import MetricUnit from 'views/components/aggregationwizard/metric/MetricUnit';

import FieldSelect from '../FieldSelect';

type Props = {
  index: number,
}

const Wrapper = styled.div``;

const FieldContainer = styled.div`
  position: relative;
`;

const sortByLabel = ({ label: label1 }: { label: string }, { label: label2 }: { label: string }) => defaultCompare(label1, label2);

const hasProperty = (fieldType: FieldTypeMapping, properties: Array<Property>) => {
  const fieldProperties = fieldType?.type?.properties ?? Immutable.Set();

  return properties
    .map((property) => fieldProperties.contains(property))
    .find((result) => result === false) === undefined;
};

const Metric = ({ index }: Props) => {
  const preDefinedFieldTypes = useFieldTypesUnits();
  const metricFieldSelectRef = useRef(null);
  const { data: functions, isLoading } = useAggregationFunctions();
  const functionOptions = useMemo(() => (isLoading ? [] : Object.values(functions)
    .map(({ type, description }) => ({ label: description, value: type }))
    .sort(sortByLabel)), [functions, isLoading]);

  const { values: { metrics }, errors: { metrics: metricsError }, setFieldValue } = useFormikContext<WidgetConfigFormValues>();
  const currentMetric = metrics[index];
  const currentFunction = currentMetric.function;

  const hasFieldOption = currentFunction !== 'percentage';
  const isFieldRequired = !['count', 'percentage'].includes(currentFunction);

  const isPercentile = currentFunction === 'percentile';
  const isPercentage = currentFunction === 'percentage';
  const requiresNumericField = (isPercentage && currentMetric.strategy === 'SUM') || !['card', 'count', 'latest', 'percentage'].includes(currentFunction);

  const isFieldQualified = useCallback((field: FieldTypeMapping) => {
    if (!requiresNumericField) {
      return true;
    }

    return hasProperty(field, [Properties.Numeric]);
  }, [requiresNumericField]);

  const [functionIsSettled, setFunctionIsSettled] = useState<boolean>(false);
  const onFunctionChange = useCallback((newValue: string) => {
    setFieldValue(`metrics.${index}.function`, newValue);
    setFunctionIsSettled(true);
  }, [setFieldValue, index]);

  useEffect(() => {
    const metricError = getIn(metricsError?.[index], 'field');

    if (metricError && functionIsSettled) {
      metricFieldSelectRef.current.focus();
    }
  }, [functionIsSettled, metricsError, index, metricFieldSelectRef]);

  const onFieldChange = useCallback((newValue: string) => {
    setFieldValue(`metrics.${index}.field`, newValue);

    if (preDefinedFieldTypes?.[newValue]) {
      setFieldValue(`metrics.${index}.unitType`, preDefinedFieldTypes[newValue].unitType);
      setFieldValue(`metrics.${index}.unitAbbrev`, preDefinedFieldTypes[newValue].abbrev);
    } else {
      setFieldValue(`metrics.${index}.unitType`, undefined);
      setFieldValue(`metrics.${index}.unitAbbrev`, undefined);
    }
  }, [index, preDefinedFieldTypes, setFieldValue]);

  const showUnitType = isFunctionAllowsUnit(currentFunction);

  return (
    <Wrapper data-testid={`metric-${index}`}>
      <Field name={`metrics.${index}.function`}>
        {({ field: { name, value }, meta: { error } }) => (
          <Input id="metric-function-select"
                 label="Function"
                 error={error}
                 labelClassName="col-sm-3"
                 wrapperClassName="col-sm-9">
            <Select options={functionOptions}
                    clearable={false}
                    name={name}
                    value={value}
                    aria-label="Select a function"
                    size="small"
                    menuPortalTarget={document.body}
                    onChange={onFunctionChange} />
          </Input>
        )}
      </Field>
      {hasFieldOption && (
        <FieldContainer>
          <Field name={`metrics.${index}.field`}>
            {({ field: { name, value }, meta: { error } }) => (
              <Input id="metric-field"
                     label="Field"
                     error={error}
                     labelClassName="col-sm-3"
                     wrapperClassName="col-sm-9">
                <FieldSelect id="metric-field-select"
                             selectRef={metricFieldSelectRef}
                             menuPortalTarget={document.body}
                             onChange={onFieldChange}
                             clearable={!isFieldRequired}
                             isFieldQualified={isFieldQualified}
                             name={name}
                             value={value}
                             ariaLabel="Select a field" />
              </Input>
            )}
          </Field>
          {showUnitType && <MetricUnit index={index} predefinedValue={preDefinedFieldTypes?.[metrics[index]?.field]} />}
        </FieldContainer>
      )}
      {isPercentile && (
        <Field name={`metrics.${index}.percentile`}>
          {({ field: { name, value, onChange }, meta: { error } }) => (
            <Input id="metric-percentile-select"
                   label="Percentile"
                   error={error}
                   labelClassName="col-sm-3"
                   wrapperClassName="col-sm-9">
              <Select options={percentileOptions}
                      clearable={false}
                      name={name}
                      value={value}
                      aria-label="Select percentile"
                      size="small"
                      menuPortalTarget={document.body}
                      onChange={(newValue) => onChange({ target: { name, value: newValue } })} />
            </Input>
          )}
        </Field>
      )}
      {isPercentage && (
        <>
          <Field name={`metrics.${index}.strategy`}>
            {({ field: { name, value, onChange }, meta: { error } }) => (
              <Input id="metric-percentage-strategy-select"
                     label="Strategy"
                     error={error}
                     labelClassName="col-sm-3"
                     wrapperClassName="col-sm-9">
                <Select options={percentageStrategyOptions}
                        clearable={false}
                        name={name}
                        value={value ?? 'COUNT'}
                        aria-label="Select strategy"
                        size="small"
                        menuPortalTarget={document.body}
                        onChange={(newValue) => onChange({ target: { name, value: newValue } })} />
              </Input>
            )}
          </Field>
          <Field name={`metrics.${index}.field`}>
            {({ field: { name, value, onChange }, meta: { error } }) => (
              <Input id="metric-field"
                     label="Field"
                     error={error}
                     labelClassName="col-sm-3"
                     wrapperClassName="col-sm-9">
                <FieldSelect id="metric-field-select"
                             selectRef={metricFieldSelectRef}
                             onChange={(fieldName) => onChange({ target: { name, value: fieldName } })}
                             clearable={!isFieldRequired}
                             isFieldQualified={isFieldQualified}
                             name={name}
                             value={value}
                             menuPortalTarget={document.body}
                             ariaLabel="Select a field" />
              </Input>
            )}
          </Field>
        </>
      )}
      <FormikInput id="name"
                   label={<>Name <Opt /></>}
                   bsSize="small"
                   placeholder="Specify display name"
                   name={`metrics.${index}.name`}
                   labelClassName="col-sm-3"
                   wrapperClassName="col-sm-9" />
    </Wrapper>
  );
};

export default Metric;
