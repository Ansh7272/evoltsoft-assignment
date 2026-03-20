import { body, query, param } from 'express-validator';
import { CONNECTOR_TYPES, STATUS_VALUES } from './ChargingStation.js';

const locationBody = [
  body('location.coordinates')
    .isArray({ min: 2, max: 2 }).withMessage('Coordinates must be [longitude, latitude]'),

  body('location.coordinates[0]')
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),

  body('location.coordinates[1]')
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),

  body('location.address')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Address cannot exceed 200 characters'),

  body('location.city').optional().trim().isLength({ max: 100 }),
  body('location.state').optional().trim().isLength({ max: 100 }),
  body('location.country').optional().trim().isLength({ max: 100 }),
];

export const createStationValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Station name is required')
    .isLength({ min: 3, max: 100 }).withMessage('Name must be 3–100 characters'),

  ...locationBody,

  body('status')
    .optional()
    .isIn(STATUS_VALUES).withMessage(`Status must be one of: ${STATUS_VALUES.join(', ')}`),

  body('powerOutput')
    .notEmpty().withMessage('Power output is required')
    .isFloat({ min: 1, max: 1000 }).withMessage('Power output must be between 1 and 1000 kW'),

  body('connectorType')
    .notEmpty().withMessage('Connector type is required')
    .isIn(CONNECTOR_TYPES).withMessage(`Connector type must be one of: ${CONNECTOR_TYPES.join(', ')}`),

  body('numberOfPorts')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('Number of ports must be between 1 and 50'),

  body('pricePerKwh')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price per kWh cannot be negative'),

  body('amenities')
    .optional()
    .isArray().withMessage('Amenities must be an array'),
];

export const updateStationValidator = [
  param('id').isMongoId().withMessage('Invalid station ID'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Name must be 3–100 characters'),

  body('location').optional(),
  ...locationBody.map((v) => {
    // Make all location fields optional for partial updates
    const cloned = { ...v };
    return body(v.builder ?? '').optional();
  }),

  body('status')
    .optional()
    .isIn(STATUS_VALUES).withMessage(`Status must be one of: ${STATUS_VALUES.join(', ')}`),

  body('powerOutput')
    .optional()
    .isFloat({ min: 1, max: 1000 }).withMessage('Power output must be between 1 and 1000 kW'),

  body('connectorType')
    .optional()
    .isIn(CONNECTOR_TYPES).withMessage(`Connector type must be one of: ${CONNECTOR_TYPES.join(', ')}`),

  body('numberOfPorts')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('Number of ports must be between 1 and 50'),

  body('pricePerKwh')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price per kWh cannot be negative'),
];

export const listStationsValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1–100'),
  query('status').optional().isIn(STATUS_VALUES),
  query('connectorType').optional().isIn(CONNECTOR_TYPES),
  query('minPower').optional().isFloat({ min: 0 }),
  query('maxPower').optional().isFloat({ min: 0 }),
  query('lat').optional().isFloat({ min: -90, max: 90 }),
  query('lng').optional().isFloat({ min: -180, max: 180 }),
  query('radius').optional().isFloat({ min: 0.1, max: 500 }),
  query('sortBy').optional().isIn(['name', 'powerOutput', 'createdAt', 'status']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
];
