import React, { useMemo } from "react";
import { t } from "ttag";
import * as Yup from "yup";
import Form from "metabase/core/components/Form";
import FormProvider from "metabase/core/components/FormProvider";
import FormCheckBox from "metabase/core/components/FormCheckBox";
import FormErrorMessage from "metabase/core/components/FormErrorMessage";
import FormInput from "metabase/core/components/FormInput";
import FormSubmitButton from "metabase/core/components/FormSubmitButton";
import { LoginData } from "../../types";

const LoginSchema = Yup.object().shape({
  username: Yup.string()
    .required(t`required`)
    .when("$isLdapEnabled", {
      is: false,
      then: schema => schema.email(t`must be a valid email address`),
    }),
  password: Yup.string().required(t`required`),
  remember: Yup.boolean(),
});

export interface LoginFormProps {
  isLdapEnabled: boolean;
  hasSessionCookies: boolean;
  onSubmit: (data: LoginData) => void;
}

const LoginForm = ({
  isLdapEnabled,
  hasSessionCookies,
  onSubmit,
}: LoginFormProps): JSX.Element => {
  const initialValues = useMemo(
    () => ({
      username: "",
      password: "",
      remember: !hasSessionCookies,
    }),
    [hasSessionCookies],
  );

  const validationContext = useMemo(
    () => ({
      isLdapEnabled,
    }),
    [isLdapEnabled],
  );

  return (
    <FormProvider
      initialValues={initialValues}
      validationSchema={LoginSchema}
      validationContext={validationContext}
      onSubmit={onSubmit}
    >
      <Form>
        <FormInput
          name="username"
          title={
            isLdapEnabled ? t`Username or email address` : t`Email address`
          }
          type={isLdapEnabled ? "input" : "email"}
          placeholder="nicetoseeyou@email.com"
          autoFocus
          fullWidth
        />
        <FormInput
          name="password"
          title={t`Password`}
          type="password"
          placeholder={t`Shhh...`}
          fullWidth
        />
        {!hasSessionCookies && (
          <FormCheckBox name="remember" title={t`Remember me`} />
        )}
        <FormSubmitButton title={t`Sign in`} primary fullWidth />
        <FormErrorMessage />
      </Form>
    </FormProvider>
  );
};

export default LoginForm;
