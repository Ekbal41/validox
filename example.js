const validy = require("./lib/validy.js");

const alreadyRegistered = {
  name: "alreadyRegistered",
  rule: async (value) => {
    // Simulate asynchronous check
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (value === "johnex@ple.com") {
          resolve(false);
        } else {
          resolve(true);
        }
      }, 300);
    });
  },
  message: "{field} already registered",
};

const data = {
  username: "jupiter",
  email: "johnex@ple.com",
  age: 25,
};

validy.addRule(alreadyRegistered);

const v = validy
  .validate(data)
  .with({
    username: ["required", "length:14:20"],
    email: ["required", "email", "alreadyRegistered"],
    age: ["required", "numeric", "positive", "range:18:20"],
  })
  .then((errors) => {
    console.log(errors);
  });
