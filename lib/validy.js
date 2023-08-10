// Rule-based validation functions
const rules = require("./rules");
const onRuleFailedErrorMessage = require("./errorMessages");

class Validator {
  constructor() {
    this.data = {};
    this.errors = {};
    this.errorMessages = {};
  }

  validate(data) {
    this.data = data;
    return this;
  }

  generateErrorMessage(key, rule, params, defaultMsg) {
    const errorMessage =
      this.errorMessages[rule] ||
      defaultMsg ||
      onRuleFailedErrorMessage[rule] ||
      `Validation failed for '${key}' with rule '${rule}'`;

    let replacedErrorMessage = errorMessage;

    for (let i = 0; i < params.length; i++) {
      const paramPlaceholder = `{params[${i}]}`;
      if (replacedErrorMessage.includes(paramPlaceholder)) {
        replacedErrorMessage = replacedErrorMessage
          .split(paramPlaceholder)
          .join(params[i]);
      }
    }

    replacedErrorMessage = replacedErrorMessage.replace("{field}", key);
    replacedErrorMessage = replacedErrorMessage.replace("{rule}", rule);

    return replacedErrorMessage;
  }

  async validateField(key, value, fieldRules) {
    for (const ruleInfo of fieldRules) {
      const [rule, ...params] = ruleInfo.split(":");
      if (rules.hasOwnProperty(rule)) {
        try {
          const isValid = await rules[rule](value, ...params);

          if (!isValid) {
            const errorMessage = this.generateErrorMessage(
              key,
              rule,
              params,
              rules[rule].message
            );
            this.errors[key] = errorMessage;
          }
        } catch (err) {
          console.log(err);
        }
      }
    }
  }
  async with(schema) {
    const validationPromises = [];

    for (const key in schema) {
      if (schema.hasOwnProperty(key)) {
        const value = this.data[key];
        const fieldRules = schema[key];

        if (fieldRules && Array.isArray(fieldRules)) {
          validationPromises.push(this.validateField(key, value, fieldRules));
        }
      }
    }

    await Promise.all(validationPromises);
    return this.errors;
  }

  addRule({ name, rule, message }) {
    rules[name] = rule;
    this.errorMessages[name] = message;
    return this;
  }
}

module.exports = new Validator();
