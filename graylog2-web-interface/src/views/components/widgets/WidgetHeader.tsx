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
import React from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';

import { Spinner, Icon } from 'components/common';
import EditableTitle from 'views/components/common/EditableTitle';
import { Input } from 'components/bootstrap';

import CustomPropTypes from '../CustomPropTypes';

const LoadingSpinner = styled(Spinner)`
  margin-left: 10px;
`;

const Container = styled.div(({ theme }) => css`
  font-size: ${theme.fonts.size.large};
  text-overflow: ellipsis;
  margin-bottom: 5px;
  display: grid;
  grid-template-columns: minmax(35px, 1fr) max-content;
  align-items: center;

  .widget-title {
    width: 100%;
    max-width: 400px;
  }
`);

const Col = styled.div`
  display: flex;
  align-items: center;
`;

const DragHandleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const WidgetDragHandle = styled(Icon)`
  cursor: move;
  opacity: 0.3;
  margin-right: 5px;
`;

const WidgetActionDropdown = styled.span`
  position: relative;
`;

const TitleInputWrapper = styled.div`
  max-width: 400px;
  width: 100%;

  .form-group {
    margin-bottom: 5px;
    width: 100%;
  }
`;

const TitleInput = styled(Input)(({ theme }) => css`
  font-size: ${theme.fonts.size.large};
  width: 100%;
`);

type Props = {
  children: React.ReactNode,
  onRename: (newTitle: string) => unknown,
  hideDragHandle: boolean,
  title: string,
  loading: boolean,
  editing: boolean,
};

const WidgetHeader = ({ children, onRename, hideDragHandle, title, loading, editing }: Props) => (
  <Container>
    <Col>
      {hideDragHandle || <DragHandleContainer className="widget-drag-handle" title={`Drag handle for ${title}`}><WidgetDragHandle name="drag_indicator" /></DragHandleContainer>}
      {editing ? (
        <TitleInputWrapper>
          <TitleInput type="text"
                      id="widget-title"
                      onChange={(e) => onRename(e.target.value)}
                      value={title}
                      required />
        </TitleInputWrapper>
      ) : (
        <EditableTitle key={title}
                       disabled={!onRename}
                       value={title}
                       onChange={onRename} />
      )}
      {loading && <LoadingSpinner text="" delay={0} />}
    </Col>
    <WidgetActionDropdown>
      {children}
    </WidgetActionDropdown>
  </Container>
);

WidgetHeader.propTypes = {
  children: CustomPropTypes.OneOrMoreChildren,
  onRename: PropTypes.func,
  hideDragHandle: PropTypes.bool,
  title: PropTypes.node.isRequired,
  loading: PropTypes.bool,
};

WidgetHeader.defaultProps = {
  children: null,
  onRename: undefined,
  hideDragHandle: false,
  loading: false,
};

export default WidgetHeader;
