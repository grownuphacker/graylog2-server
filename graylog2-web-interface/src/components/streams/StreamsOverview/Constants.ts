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

import type { Sort, Attribute } from 'stores/PaginationTypes';

export const DEFAULT_LAYOUT = {
  entityTableId: 'streams',
  defaultPageSize: 20,
  defaultSort: { attributeId: 'title', direction: 'asc' } as Sort,
  defaultDisplayedAttributes: ['title', 'index_set_title', 'rules', 'throughput', 'disabled'],
};

export const COLUMNS_ORDER = ['title', 'index_set_title', 'rules', 'throughput', 'disabled', 'created_at'];

export const ADDITIONAL_ATTRIBUTES: Array<Attribute> = [
  { id: 'index_set_title', title: 'Index Set', sortable: true, permissions: ['indexsets:read'] },
  { id: 'throughput', title: 'Throughput' },
  { id: 'rules', title: 'Rules' },
];
