import type { VerifyFunction } from "passport-local";

const verifyUser: VerifyFunction = (email, password, done) => {
  console.log(
    "Verifying user login with email:",
    email,
    "and password",
    password,
  );
  return done(null, { email });
};

export { verifyUser };
