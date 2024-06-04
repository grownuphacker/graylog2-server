package org.graylog2.categories.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.google.auto.value.AutoValue;
import org.graylog2.database.entities.ScopedEntity;
import org.mongojack.Id;
import org.mongojack.ObjectId;

import javax.annotation.Nullable;

@AutoValue
@JsonDeserialize(builder = Category.Builder.class)
public abstract class Category extends ScopedEntity {
    public static final String FIELD_ID = "id";
    public static final String FIELD_CATEGORY = "category";

    @ObjectId
    @Id
    @Nullable
    @JsonProperty(FIELD_ID)
    public abstract String id();

    @JsonProperty(FIELD_CATEGORY)
    public abstract String category();

    public static Builder builder() {
        return Builder.create();
    }

    public abstract Builder toBuilder();

    @AutoValue.Builder
    @JsonIgnoreProperties(ignoreUnknown = true)
    public abstract static class Builder extends AbstractBuilder<Builder> {
        @Id
        @ObjectId
        @JsonProperty(FIELD_ID)
        public abstract Builder id(String id);

        @JsonProperty(FIELD_CATEGORY)
        public abstract Builder category(String category);

        public abstract Category build();

        @JsonCreator
        public static Builder create() {
            return new AutoValue_Category.Builder();
        }
    }
}
