const mongoose = require('mongoose');

const RevokedRefreshTokensSchema = mongoose.Schema({
    tokens: [{
        type: String
    }]
});

module.exports = mongoose.model('RevokedRefreshTokens', RevokedRefreshTokensSchema);