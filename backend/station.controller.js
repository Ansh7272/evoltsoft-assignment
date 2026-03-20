import ChargingStation from './ChargingStation.js';
import {
  sendSuccess,
  sendCreated,
  sendNotFound,
  sendForbidden,
  sendPaginated,
} from './response.js';
import logger from './logger.js';

const buildFilter = (query, userId = null) => {
  const filter = { isDeleted: false }; // Always exclude deleted stations

  if (query.status) filter.status = query.status;
  if (query.connectorType) filter.connectorType = query.connectorType;

  if (query.minPower || query.maxPower) {
    filter.powerOutput = {};
    if (query.minPower) filter.powerOutput.$gte = parseFloat(query.minPower);
    if (query.maxPower) filter.powerOutput.$lte = parseFloat(query.maxPower);
  }

  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { 'location.city': { $regex: query.search, $options: 'i' } },
      { 'location.address': { $regex: query.search, $options: 'i' } },
    ];
  }

  // Filter for user's own stations
  if (query.myStations === 'true' && userId) {
    filter.operator = userId;
  }

  return filter;
};

/**
 * GET /api/v1/stations
 * Supports: pagination, filtering, sorting, geospatial search
 */
export const getAllStations = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      lat,
      lng,
      radius = 10,
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    // Geospatial query takes precedence over standard filter
    if (lat && lng) {
      const stations = await ChargingStation.findNearby(
        parseFloat(lng),
        parseFloat(lat),
        parseFloat(radius),
      ).populate('operator', 'name email');

      return sendSuccess(res, stations, 'Nearby stations retrieved');
    }

    const filter = buildFilter(req.query, req.user?._id);

    const [stations, total] = await Promise.all([
      ChargingStation.find(filter)
        .populate('operator', 'name email')
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      ChargingStation.countDocuments(filter),
    ]);

    return sendPaginated(
      res,
      stations,
      {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1,
      },
      'Stations retrieved successfully',
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/stations/:id
 */
export const getStationById = async (req, res, next) => {
  try {
    const station = await ChargingStation.findById(req.params.id).populate(
      'operator',
      'name email',
    );

    if (!station) return sendNotFound(res, 'Charging station not found');

    return sendSuccess(res, station, 'Station retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/stations
 */
export const createStation = async (req, res, next) => {
  try {
    const stationData = {
      ...req.body,
      operator: req.user._id,
    };

    const station = await ChargingStation.create(stationData);
    await station.populate('operator', 'name email');

    logger.info(`Station created: ${station._id} by user ${req.user._id}`);

    return sendCreated(res, station, 'Charging station created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/stations/:id
 */
export const updateStation = async (req, res, next) => {
  try {
    const station = await ChargingStation.findById(req.params.id);
    if (!station) return sendNotFound(res, 'Charging station not found');

    // Only the creator or an admin may update
    const isOwner = station.operator.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return sendForbidden(res, 'You do not have permission to update this station');
    }

    // Prevent operator field from being changed
    delete req.body.operator;

    const updatedStation = await ChargingStation.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true },
    ).populate('operator', 'name email');

    logger.info(`Station updated: ${station._id} by user ${req.user._id}`);

    return sendSuccess(res, updatedStation, 'Charging station updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/stations/:id
 * Soft-delete: sets isDeleted = true
 */
export const deleteStation = async (req, res, next) => {
  try {
    const station = await ChargingStation.findById(req.params.id);
    if (!station) return sendNotFound(res, 'Charging station not found');

    const isOwner = station.operator.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return sendForbidden(res, 'You do not have permission to delete this station');
    }

    // Soft delete
    await ChargingStation.findByIdAndUpdate(req.params.id, { isDeleted: true });

    logger.info(`Station soft-deleted: ${station._id} by user ${req.user._id}`);

    return sendSuccess(res, null, 'Charging station deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/stations/stats
 * Aggregation summary for dashboard
 */
export const getStationStats = async (req, res, next) => {
  try {
    const [statusStats, connectorStats, totals] = await Promise.all([
      ChargingStation.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      ChargingStation.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        { $group: { _id: '$connectorType', count: { $sum: 1 }, avgPower: { $avg: '$powerOutput' } } },
        { $sort: { count: -1 } },
      ]),
      ChargingStation.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            avgPower: { $avg: '$powerOutput' },
            maxPower: { $max: '$powerOutput' },
            totalPorts: { $sum: '$numberOfPorts' },
          },
        },
      ]),
    ]);

    return sendSuccess(
      res,
      { statusBreakdown: statusStats, connectorBreakdown: connectorStats, summary: totals[0] },
      'Station stats retrieved',
    );
  } catch (error) {
    next(error);
  }
};
