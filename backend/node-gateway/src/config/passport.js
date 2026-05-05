import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.model.js";
import { generateToken } from "../utils/jwt.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ["profile", "email"],
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("No email found in Google profile"), null);

        let user = await User.findOne({ email });

        if (user) {
          // Link Google account if user exists but signed up locally
          if (!user.googleId) {
            user.googleId = profile.id;
            user.isEmailVerified = true;
            user.avatar = user.avatar || profile.photos?.[0]?.value;
            await user.save();
          }
        } else {
          // Create new user from Google profile
          user = await User.create({
            name: profile.displayName,
            email,
            googleId: profile.id,
            avatar: profile.photos?.[0]?.value,
            isEmailVerified: true,
            password: undefined, // No password for OAuth users
          });
        }

        const token = generateToken(user._id);
        return done(null, { user, token });
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize / Deserialize (stateless JWT — minimal implementation)
passport.serializeUser((data, done) => done(null, data));
passport.deserializeUser((data, done) => done(null, data));
