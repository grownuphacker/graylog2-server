package org.graylog.plugins.pipelineprocessor.functions.conversion;

import com.google.common.collect.ImmutableList;
import org.graylog.plugins.pipelineprocessor.EvaluationContext;
import org.graylog.plugins.pipelineprocessor.ast.functions.AbstractFunction;
import org.graylog.plugins.pipelineprocessor.ast.functions.FunctionArgs;
import org.graylog.plugins.pipelineprocessor.ast.functions.FunctionDescriptor;
import org.graylog.plugins.pipelineprocessor.ast.functions.ParameterDescriptor;
import org.graylog.plugins.pipelineprocessor.rulebuilder.RuleBuilderFunctionGroup;
import org.graylog2.plugin.Message;

import static org.graylog.plugins.pipelineprocessor.ast.functions.ParameterDescriptor.type;

public class FieldValueType extends AbstractFunction<String> {
    public static final String NAME = "field_value_type";
    public static final String FIELD = "field";

    public static final String BOOLEAN = "boolean";
    public static final String COLLECTION = "boolean";

    private final ParameterDescriptor<String, String> fieldParam;
    private final ParameterDescriptor<Message, Message> messageParam;

    public FieldValueType() {
        fieldParam = ParameterDescriptor.string(FIELD).description("The field whose value to get the type name of").build();
        messageParam = type("message", Message.class).optional().description("The message to use, defaults to '$message'").ruleBuilderVariable().build();
    }

    @Override
    public String evaluate(FunctionArgs args, EvaluationContext context) {
        final String field = fieldParam.required(args, context);
        final Message message = messageParam.optional(args, context).orElse(context.currentMessage());
        final var value = message.getField(field);

        return value.getClass().getSimpleName();
    }

    @Override
    public FunctionDescriptor<String> descriptor() {
        return FunctionDescriptor.<String>builder()
                .name(NAME)
                .returnType(String.class)
                .params(ImmutableList.of(fieldParam, messageParam))
                .description("Returns the type of value stored in a field")
                .ruleBuilderEnabled()
                .ruleBuilderName("Get the type of value stored in a field")
                .ruleBuilderTitle("Get the type of value stored in field '${field}'")
                .ruleBuilderFunctionGroup(RuleBuilderFunctionGroup.MESSAGE)
                .build();
    }
}
