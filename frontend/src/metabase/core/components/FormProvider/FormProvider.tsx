import React from "react";
import { Formik } from "formik";
import type { FormikConfig } from "formik";
import type { AnySchema } from "yup";
import useFormSubmit from "metabase/core/hooks/use-form-submit";
import useFormValidation from "metabase/core/hooks/use-form-validation";

export interface FormProviderProps<T, C> extends FormikConfig<T> {
  validationSchema?: AnySchema;
  validationContext?: C;
}

function FormProvider<T, C>({
  initialValues,
  validationSchema,
  validationContext,
  onSubmit,
  ...props
}: FormProviderProps<T, C>): JSX.Element {
  const { handleSubmit } = useFormSubmit({ onSubmit });
  const { initialErrors, handleValidate } = useFormValidation({
    initialValues,
    validationSchema,
    validationContext,
  });

  return (
    <Formik
      initialValues={initialValues}
      initialErrors={initialErrors}
      validate={handleValidate}
      onSubmit={handleSubmit}
      {...props}
    />
  );
}

export default FormProvider;
