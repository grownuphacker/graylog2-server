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
package org.graylog2.datatier.open;

import com.google.common.base.Preconditions;
import org.graylog2.configuration.ElasticsearchConfiguration;
import org.graylog2.datatier.common.DataTierRotation;
import org.graylog2.datatier.common.tier.HotTierConfig;
import org.graylog2.datatier.DataTierOrchestrator;
import org.graylog2.datatier.DataTiersConfig;
import org.graylog2.indexer.IndexSet;
import org.graylog2.indexer.IndexSetValidator;
import org.graylog2.indexer.rotation.tso.TimeSizeOptimizingValidation;

import javax.inject.Inject;
import javax.validation.constraints.NotNull;
import java.util.Optional;

public class OpenDataTierOrchestrator implements DataTierOrchestrator {

    private final ElasticsearchConfiguration elasticsearchConfiguration;
    private final DataTierRotation.Factory dataTierRotationFactory;

    private final OpenDataTierRetention openDataTierRetention;

    @Inject
    public OpenDataTierOrchestrator(ElasticsearchConfiguration elasticsearchConfiguration,
                                    DataTierRotation.Factory dataTierRotationFactory,
                                    OpenDataTierRetention openDataTierRetention) {
        this.elasticsearchConfiguration = elasticsearchConfiguration;
        this.dataTierRotationFactory = dataTierRotationFactory;
        this.openDataTierRetention = openDataTierRetention;
    }


    @Override
    public void rotate(IndexSet indexSet) {
        if (indexSet.getConfig().dataTiers() instanceof OpenDataTiersConfig openConfig) {
            HotTierConfig hotTierConfig = openConfig.hotTier();
            DataTierRotation dataTierRotation = dataTierRotationFactory.create(hotTierConfig);
            dataTierRotation.rotate(indexSet);
        }
    }

    @Override
    public void retain(IndexSet indexSet) {
        if (indexSet.getConfig().dataTiers() instanceof OpenDataTiersConfig openConfig) {
            openDataTierRetention.retain(indexSet, openConfig.hotTier());
        }
    }

    @Override
    public Optional<IndexSetValidator.Violation> validate(@NotNull DataTiersConfig config) {
        Preconditions.checkNotNull(config);

        if (config instanceof OpenDataTiersConfig openConfig) {
            return TimeSizeOptimizingValidation.validate(
                    elasticsearchConfiguration,
                    openConfig.hotTier().indexLifetimeMin(),
                    openConfig.hotTier().indexLifetimeMax());
        }
        return Optional.empty();
    }

}
