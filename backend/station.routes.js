import { Router } from 'express';
import {
  getAllStations,
  getStationById,
  createStation,
  updateStation,
  deleteStation,
  getStationStats,
} from './station.controller.js';
import { authenticate } from './auth.middleware.js';
import { validate } from './validate.middleware.js';
import {
  createStationValidator,
  updateStationValidator,
  listStationsValidator,
} from './station.validator.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Stations
 *   description: Charging station management
 */

/**
 * @swagger
 * /stations:
 *   get:
 *     summary: List all charging stations (with filtering & pagination)
 *     tags: [Stations]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [active, inactive, maintenance] }
 *       - in: query
 *         name: connectorType
 *         schema: { type: string }
 *       - in: query
 *         name: minPower
 *         schema: { type: number }
 *       - in: query
 *         name: maxPower
 *         schema: { type: number }
 *       - in: query
 *         name: lat
 *         schema: { type: number }
 *         description: Latitude for nearby search
 *       - in: query
 *         name: lng
 *         schema: { type: number }
 *         description: Longitude for nearby search
 *       - in: query
 *         name: radius
 *         schema: { type: number, default: 10 }
 *         description: Search radius in km
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Full-text search on name, city, address
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [name, powerOutput, createdAt, status] }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc] }
 *     responses:
 *       200: { description: "Paginated station list" }
 */
router.get('/', listStationsValidator, validate, getAllStations);

/**
 * @swagger
 * /stations/stats:
 *   get:
 *     summary: Aggregated statistics for dashboard
 *     tags: [Stations]
 *     responses:
 *       200: { description: "Stats retrieved" }
 */
router.get('/stats', getStationStats);

/**
 * @swagger
 * /stations/{id}:
 *   get:
 *     summary: Get a single charging station
 *     tags: [Stations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: "Station data" }
 *       404: { description: "Not found" }
 */
router.get('/:id', getStationById);

/**
 * @swagger
 * /stations:
 *   post:
 *     summary: Create a new charging station
 *     tags: [Stations]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateStation'
 *     responses:
 *       201: { description: "Station created" }
 *       400: { description: "Validation error" }
 *       401: { description: "Unauthorized" }
 */
router.post('/', authenticate, createStationValidator, validate, createStation);

/**
 * @swagger
 * /stations/{id}:
 *   put:
 *     summary: Update a charging station
 *     tags: [Stations]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: "Station updated" }
 *       403: { description: "Forbidden" }
 *       404: { description: "Not found" }
 */
router.put('/:id', authenticate, updateStationValidator, validate, updateStation);

/**
 * @swagger
 * /stations/{id}:
 *   delete:
 *     summary: Delete a charging station (soft delete)
 *     tags: [Stations]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: "Deleted" }
 *       403: { description: "Forbidden" }
 *       404: { description: "Not found" }
 */
router.delete('/:id', authenticate, deleteStation);

export default router;
