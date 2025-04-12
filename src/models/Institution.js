import mongoose from 'mongoose';

const institutionSchema = new mongoose.Schema({
  address: {
    type: String,
    required: [true, 'Institution address is required'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^0x[a-fA-F0-9]{40}$/.test(v);
      },
      message: props => `${props.value} is not a valid Ethereum address`
    }
  },
  registeredAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  registeredBy: {
    type: String,
    required: [true, 'Registrar address is required'],
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^0x[a-fA-F0-9]{40}$/.test(v);
      },
      message: props => `${props.value} is not a valid Ethereum address`
    }
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes
institutionSchema.index({ address: 1, isActive: 1 });
institutionSchema.index({ registeredBy: 1 });

// Pre-save middleware
institutionSchema.pre('save', function(next) {
  // Ensure addresses are lowercase
  this.address = this.address.toLowerCase();
  this.registeredBy = this.registeredBy.toLowerCase();
  next();
});

const Institution = mongoose.model('Institution', institutionSchema);

export default Institution; 