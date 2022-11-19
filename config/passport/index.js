import passport from "passport";
import { Strategy as GithubStrategy } from "passport-github2";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../../models/user.model.js";
import Mongoose from "mongoose";

const GOOGLE_CLIENT_ID = "77704610385-n00oufvjpndmtou8u3kv5pb2tbjc7kle.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";

const GITHUB_CLIENT_ID = "8f4d473c2a50050d500b";
const GITHUB_CLIENT_SECRET = "e856cf4172d87548523c7d10031379727b25d478";

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      if (profile.id) {
        User.findOne({ googleId: profile.id }).then((existingUser) => {
          if (existingUser) {
            done(null, existingUser);
          } else {
            new User({
              googleId: profile.id,
              email: profile._json.email,
              name: profile.displayName,
            })
              .save()
              .then((user) => done(null, user._doc));
          }
        });
      }
    }
  )
);

passport.use(
  new GithubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: "/api/auth/github/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      if (profile._json.id) {
        User.findOne({ githubId: profile._json.id }).then((existingUser) => {
          if (existingUser) {
            done(null, existingUser);
          } else {
            new User({
              githubId: profile._json.id,
              email: profile._json.email,
              name: profile._json.name,
            })
              .save()
              .then((user) => done(null, user._doc));
          }
        });
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

export const githubLoginMiddleware = passport.authenticate("github", { scope: ["profile"] });

export const githubLoginSuccessMiddleware = passport.authenticate("github", {
  failureRedirect: "http://localhost:3000/login",
});

export const googleLoginMiddleware = passport.authenticate("google", { scope: ["profile", "email"] });

export const googleLoginSuccessMiddleware = passport.authenticate("google", {
  failureRedirect: "http://localhost:3000/login",
});

export default passport;
