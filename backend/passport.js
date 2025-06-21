const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./models/userModel"); // Import your User model

// Get callback URL from environment variables
const getCallbackURL = () => {
    const callbackUrl = process.env.GOOGLE_CALLBACK_URL;
    console.log('Google OAuth Callback URL:', callbackUrl); // Debug log
    if (!callbackUrl) {
        console.error('GOOGLE_CALLBACK_URL environment variable is not set');
        throw new Error('GOOGLE_CALLBACK_URL environment variable is not set');
    }
    return callbackUrl;
};

// Log the strategy configuration
const strategyConfig = {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: getCallbackURL(),
};
console.log('Google Strategy Config:', {
    clientID: strategyConfig.clientID ? 'Set' : 'Not Set',
    clientSecret: strategyConfig.clientSecret ? 'Set' : 'Not Set',
    callbackURL: strategyConfig.callbackURL
});

passport.use(new GoogleStrategy(strategyConfig, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
            user = await User.create({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
                picture: profile.photos[0].value,
                accessToken,
                refreshToken,
            });
        } else {
            user.accessToken = accessToken;
            user.refreshToken = refreshToken;
            user.picture = profile.photos[0].value;
            await user.save();
        }
        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        console.error("Error deserializing user:", error);
        done(error, null);
    }
});
