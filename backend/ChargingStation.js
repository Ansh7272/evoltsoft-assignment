import mongoose from 'mongoose';

const CONNECTOR_TYPES = ['CCS', 'CHAdeMO', 'Type 1', 'Type 2', 'Tesla', 'GBT'];
const STATUS_VALUES = ['active', 'inactive', 'maintenance'];

const locationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude] — GeoJSON order
      required: [true, 'Coordinates are required'],
      validate: {
        validator: ([lng, lat]) =>
          lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90,
        message: 'Invalid coordinates. Longitude must be ±180, latitude ±90.',
      },
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, 'Address cannot exceed 200 characters'],
    },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true, default: 'India' },
  },
  { _id: false },
);

const chargingStationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Station name is required'],
      trim: true,
      minlength: [3, 'Name must be at least 3 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    location: {
      type: locationSchema,
      required: [true, 'Location is required'],
    },
    status: {
      type: String,
      enum: { values: STATUS_VALUES, message: `Status must be one of: ${STATUS_VALUES.join(', ')}` },
      default: 'active',
      index: true,
    },
    powerOutput: {
      type: Number,
      required: [true, 'Power output is required'],
      min: [1, 'Power output must be at least 1 kW'],
      max: [1000, 'Power output cannot exceed 1000 kW'],
    },
    connectorType: {
      type: String,
      required: [true, 'Connector type is required'],
      enum: {
        values: CONNECTOR_TYPES,
        message: `Connector type must be one of: ${CONNECTOR_TYPES.join(', ')}`,
      },
      index: true,
    },
    numberOfPorts: {
      type: Number,
      default: 1,
      min: [1, 'Must have at least 1 port'],
      max: [50, 'Cannot exceed 50 ports'],
    },
    pricePerKwh: {
      type: Number,
      min: [0, 'Price cannot be negative'],
      default: 0,
    },
    amenities: {
      type: [String],
      default: [],
    },
    operator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret.__v;
        delete ret.isDeleted;
        return ret;
      },
    },
  },
);

chargingStationSchema.index({ 'location': '2dsphere' });
chargingStationSchema.index({ status: 1, connectorType: 1, powerOutput: 1 });

chargingStationSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});

chargingStationSchema.virtual('latitude').get(function () {
  return this.location?.coordinates?.[1];
});
chargingStationSchema.virtual('longitude').get(function () {
  return this.location?.coordinates?.[0];
});

chargingStationSchema.statics.findNearby = function (lng, lat, radiusKm = 10) {
  return this.find({
    location: {
      $nearSphere: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: radiusKm * 1000, // metres
      },
    },
  });
};

export { CONNECTOR_TYPES, STATUS_VALUES };

const ChargingStation = mongoose.model('ChargingStation', chargingStationSchema);
export default ChargingStation;
