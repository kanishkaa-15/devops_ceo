const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: function () { return this.authType === 'local'; } },
  role: { type: String, enum: ['admin', 'ceo', 'staff', 'parent'], default: 'staff' },
  studentName: { type: String },
  assignedClass: { type: String },
  assignedSection: { type: String },
  authType: { type: String, enum: ['local', 'sso'], default: 'local' }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);