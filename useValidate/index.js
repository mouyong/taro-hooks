import { useState, useRef } from "react";
import Taro from "@tarojs/taro";

import * as WeValidator from "../../utils/validator";

function generateRuleCheckFunc(validator, form, rules) {
  const formRules = {};

  Object.keys(rules).forEach(ruleName => {
    formRules[ruleName] = (rule, value, callback) => {
      return WeValidator.checkField(validator, form, ruleName, callback);
    };
  });

  return formRules;
}

function generateValidate(rules, messages, onMessage = undefined) {
  if (typeof onMessage !== "function") {
    onMessage = function(data) {
      Taro.showToast({
        icon: "none",
        title: data.msg
      });
    };
  }

  const validator = WeValidator.makeValidator(
    {
      rules: rules,
      messages: messages
    },
    onMessage
  );

  return validator;
}

function useValidate(
  formData,
  rules = {},
  messages = {},
  onMessage = undefined
) {
  const formRef = useRef();
  const [form, setForm] = useState(formData);
  const validator = generateValidate(rules, messages, onMessage);
  const formRules = generateRuleCheckFunc(validator, form, rules);

  function validateForm() {
    return new Promise((resolve) => {
      formRef.current.validate(success => {
        if (!success) {
          WeValidator.checkData(validator, form);
          console.info('validateForm failed', form);
          return;
        }

        resolve(form);
      });
    });
  }
  return [form, setForm, validateForm, formRules, formRef];
}

export default useValidate;
