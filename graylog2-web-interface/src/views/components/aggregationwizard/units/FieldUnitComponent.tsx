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
import React, { useEffect, useMemo } from 'react';
import { styled, css } from 'styled-components';
import { useFormikContext } from 'formik';

import FieldUnitPopover from 'views/components/aggregationwizard/units/FieldUnitPopover';
import type { WidgetConfigFormValues } from 'views/components/aggregationwizard';
import useFieldTypesUnits from 'views/hooks/useFieldTypesUnits';
import useFieldTypes from 'views/logic/fieldtypes/useFieldTypes';
import { Properties } from 'views/logic/fieldtypes/FieldType';

type Props = {
  field: string,
}

export const UnitLabel = styled.div(({ theme }) => css`
  color: ${theme.colors.gray[60]};
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 25px;
  height: 25px;
`);

const FieldUnitComponent = ({ field }: Props) => {
  const fieldTypesUnits = useFieldTypesUnits();
  const { data } = useFieldTypes(undefined, undefined);
  const predefinedValue = useMemo(() => fieldTypesUnits?.[field], [field, fieldTypesUnits]);
  const { setFieldValue } = useFormikContext<WidgetConfigFormValues>();
  const showUnitComponent = useMemo(() => !!(data?.find((f) => f.name === field && f?.type?.properties?.contains(Properties.Numeric))), [data, field]);

  useEffect(() => {
    if (predefinedValue) {
      setFieldValue(`units.${field}`, { abbrev: predefinedValue.abbrev, unitType: predefinedValue.unitType });
    }
  }, [field, predefinedValue, setFieldValue]);

  if (!showUnitComponent) return null;

  return <FieldUnitPopover field={field} predefinedUnit={predefinedValue} />;
};

export default FieldUnitComponent;
