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
package org.graylog2.cluster.preflight;

@Deprecated
public class DataNodeProvisioningConfig {
    @Deprecated
    public enum State {
        UNCONFIGURED, // first start of a DataNode
        CONFIGURED, // the DataNode has been configured by the Preflight UI
        CSR, // DataNode created the CSR
        SIGNED, // Graylog CA signed the CSR
        STORED, // Certificate is combined with private key and stored in Mongo
        STARTUP_PREPARED, // All configuration has been written
        STARTUP_TRIGGER, // Startup of the OpenSearch process requested from Graylog
        STARTUP_REQUESTED, // Startup of the OpenSearch process requested
        CONNECTING, // connectivity check running until error or connected
        CONNECTED, // DataNode started with the certificate
        ERROR // sh*t happened
    }
}
