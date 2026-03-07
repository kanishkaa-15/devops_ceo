const mongoose = require('mongoose');

const ssoProviderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: String, enum: ['google', 'microsoft', 'okta'], required: true },
  providerId: { type: String, required: true },
  email: { type: String, required: true }
}, { timestamps: true });

ssoProviderSchema.index({ provider: 1, providerId: 1 }, { unique: true });

module.exports = mongoose.model('SSOProvider', ssoProviderSchema);
