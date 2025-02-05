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
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { useQueryClient } from '@tanstack/react-query';
import { PluginStore } from 'graylog-web-plugin/plugin';
import URI from 'urijs';

import Routes from 'routing/Routes';
import {
  Button,
  Col,
  DropdownButton,
  MenuItem,
  Row,
  SegmentedControl,
} from 'components/bootstrap';
import UserNotification from 'util/UserNotification';
import { Icon, IfPermitted } from 'components/common';
import { StreamsStore, type Stream } from 'stores/streams/StreamsStore';
import { useStore } from 'stores/connect';
import { IndexSetsActions, IndexSetsStore } from 'stores/indices/IndexSetsStore';
import useHistory from 'routing/useHistory';
import useQuery from 'routing/useQuery';

import StreamDataRoutingIntake from './StreamDataRoutingIntake';
import StreamDataRoutingProcessing from './StreamDataRoutingProcessing';
import StreamDataRoutingDestinations from './StreamDataRoutingDestinations';

import StreamModal from '../StreamModal';

type Props = {
  stream: Stream,
};
const INTAKE_SEGMENT = 'intake';
const PROCESSING_SEGMENT = 'processing';
const DESTINATIONS_SEGMENT = 'destinations';

const SEGMENTS_DETAILS = [
  {
    value: 'intake' as const,
    label: '1: Intake',
  },
  {
    value: 'processing' as const,
    label: '2: Processing',
  },
  {
    value: 'destinations' as const,
    label: '3: Destinations',
  },
];

type DetailsSegment = 'intake' | 'processing' | 'destinations';

const Container = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  padding-top: 30px;
  margin-bottom: 20px;
  gap: 15px;
  margin-left: -15px;
  margin-right: -15px;
`;

const LeftCol = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
`;

const RightCol = styled.div`
  display: flex;
  gap: 30px;
`;

const MainDetailsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
`;

const SegmentContainer = styled(Row)`
  flex: 1;
`;

const FullHeightCol = styled(Col)`
  height: 100%;
`;

const StyledSectionGrid = styled.div(({ theme }) => css`
  display: flex;
  align-items: center;
  align-content: center;
  gap: ${theme.spacings.md};
`);
const StyledSegmentedControl = styled(SegmentedControl)(({ theme }) => css`
  background-color: ${theme.colors.section.filled.background};
  border: 1px solid ${theme.colors.section.filled.border};
  .mantine-SegmentedControl-innerLabel {
    vertical-align: middle;
  }
  .mantine-SegmentedControl-indicator {
    height: 70% !important;
  }
`);

const StreamDetails = ({ stream }: Props) => {
  const navigate = useNavigate();
  const { segment } = useQuery();
  const [currentSegment, setCurrentSegment] = useState<DetailsSegment>(segment as DetailsSegment || INTAKE_SEGMENT);
  const DataWarehouseJobComponent = PluginStore.exports('dataWarehouse')?.[0]?.DataWarehouseJobs;
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const { indexSets } = useStore(IndexSetsStore);
  const queryClient = useQueryClient();
  const history = useHistory();

  const updateURLStepQueryParam = (nextSegment: DetailsSegment) => {
    const newUrl = new URI(window.location.href).removeSearch('segment').addQuery('segment', nextSegment);
    history.replace(newUrl.resource());
  };

  const onSegmentChange = (nextSegment: DetailsSegment) => {
    setCurrentSegment(nextSegment);
    updateURLStepQueryParam(nextSegment);
  };

  useEffect(() => {
    IndexSetsActions.list(false);
  }, []);

  const toggleUpdateModal = useCallback(() => {
    setShowUpdateModal((cur) => !cur);
  }, []);
  const onUpdate = useCallback((newStream: Stream) => StreamsStore.update(stream.id, newStream, (response) => {
    UserNotification.success(`Stream '${newStream.title}' was updated successfully.`, 'Success');
    queryClient.invalidateQueries(['stream', stream.id]);

    return response;
  }), [stream.id, queryClient]);

  return (
    <>
      {DataWarehouseJobComponent && <DataWarehouseJobComponent />}
      <Container>
        <Header>
          <LeftCol>
            <Button onClick={() => navigate(Routes.STREAMS)}>
              <Icon name="arrow_left_alt" size="sm" /> Back
            </Button>

            <h1>Stream: {stream.title}</h1>

            <IfPermitted permissions="stream:edit">
              <DropdownButton title={<Icon name="more_horiz" />} id="stream-actions" noCaret bsSize="xs">
                <MenuItem onClick={() => toggleUpdateModal()}>Edit</MenuItem>
              </DropdownButton>
            </IfPermitted>
          </LeftCol>
          <RightCol />
        </Header>

        <Row className="content no-bm">
          <Col xs={12}>
            <StyledSectionGrid>
              <h3>Data Routing</h3>
              <MainDetailsRow>
                <StyledSegmentedControl<DetailsSegment> data={SEGMENTS_DETAILS}
                                                        radius="sm"
                                                        value={currentSegment}
                                                        onChange={onSegmentChange} />
              </MainDetailsRow>
            </StyledSectionGrid>
          </Col>
        </Row>
        <SegmentContainer className="content">
          <FullHeightCol xs={12}>
            {currentSegment === INTAKE_SEGMENT && <StreamDataRoutingIntake stream={stream} />}
            {currentSegment === PROCESSING_SEGMENT && <StreamDataRoutingProcessing stream={stream} />}
            {currentSegment === DESTINATIONS_SEGMENT && <StreamDataRoutingDestinations stream={stream} />}
          </FullHeightCol>
        </SegmentContainer>
        {showUpdateModal && (
        <StreamModal title="Editing Stream"
                     onSubmit={onUpdate}
                     onClose={toggleUpdateModal}
                     submitButtonText="Update stream"
                     submitLoadingText="Updating stream..."
                     initialValues={stream}
                     indexSets={indexSets} />
        )}

      </Container>
    </>
  );
};

export default StreamDetails;
