/**
 * Order Status Transition Helpers
 * 
 * Purpose: Support order status transitions in the Order ↔ Payment pipeline
 * 
 * Key Features:
 * - Idempotent: Can be run multiple times without side effects
 * - Testable: Pure functions with clear inputs/outputs
 * - Validated: Each transition is validated before execution
 */

const pool = require("../db/db");

/**
 * Valid order status transitions
 * Maps current status -> allowed next statuses
 */
const VALID_TRANSITIONS = {
  pending: ["payment_pending", "cancelled"],
  payment_pending: ["payment_completed", "cancelled"],
  payment_completed: ["processing", "refunded"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: ["refunded"],
  cancelled: [], // Terminal state
  refunded: [], // Terminal state
};

/**
 * Order statuses enum for reference
 */
const ORDER_STATUS = {
  PENDING: "pending",
  PAYMENT_PENDING: "payment_pending",
  PAYMENT_COMPLETED: "payment_completed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
};

/**
 * Validates if a status transition is allowed
 * 
 * @param {string} currentStatus - Current order status
 * @param {string} newStatus - Desired new status
 * @returns {Object} { valid: boolean, reason: string }
 */
function validateTransition(currentStatus, newStatus) {
  // Check if current status exists
  if (!VALID_TRANSITIONS.hasOwnProperty(currentStatus)) {
    return {
      valid: false,
      reason: `Invalid current status: ${currentStatus}`,
    };
  }

  // Check if transition is allowed
  const allowedTransitions = VALID_TRANSITIONS[currentStatus];
  if (!allowedTransitions.includes(newStatus)) {
    return {
      valid: false,
      reason: `Cannot transition from ${currentStatus} to ${newStatus}. Allowed: ${allowedTransitions.join(", ") || "none"}`,
    };
  }

  return { valid: true, reason: "" };
}

/**
 * Get current order status from database
 * 
 * @param {number} orderId - Order ID
 * @returns {Promise<string|null>} Current status or null if order not found
 */
async function getCurrentOrderStatus(orderId) {
  try {
    const [rows] = await pool.query(
      "SELECT status FROM orders WHERE id = ?",
      [orderId]
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0].status;
  } catch (error) {
    console.error(`Error fetching order status for order ${orderId}:`, error);
    throw error;
  }
}

/**
 * Log status transition to history table
 * 
 * @param {number} orderId - Order ID
 * @param {string} previousStatus - Previous status
 * @param {string} newStatus - New status
 * @param {string} changedBy - Who/what triggered the change
 * @param {string} reason - Reason for change
 * @returns {Promise<void>}
 */
async function logStatusChange(orderId, previousStatus, newStatus, changedBy = "system", reason = "") {
  try {
    await pool.query(
      `INSERT INTO order_status_history 
       (order_id, previous_status, new_status, changed_by, reason) 
       VALUES (?, ?, ?, ?, ?)`,
      [orderId, previousStatus, newStatus, changedBy, reason]
    );
  } catch (error) {
    console.error(`Error logging status change for order ${orderId}:`, error);
    // Don't throw - logging failure shouldn't stop the transition
  }
}

/**
 * Transition order status (IDEMPOTENT)
 * 
 * This function is idempotent: If the order is already in the target status,
 * it returns success without making changes.
 * 
 * @param {number} orderId - Order ID
 * @param {string} newStatus - Target status
 * @param {Object} options - Additional options
 * @param {string} options.changedBy - Who triggered the change (default: "system")
 * @param {string} options.reason - Reason for the change
 * @param {boolean} options.force - Force transition even if validation fails (default: false)
 * @returns {Promise<Object>} { success: boolean, message: string, previousStatus: string, newStatus: string }
 */
async function transitionOrderStatus(orderId, newStatus, options = {}) {
  const { changedBy = "system", reason = "", force = false } = options;

  try {
    // Get current status
    const currentStatus = await getCurrentOrderStatus(orderId);

    if (currentStatus === null) {
      return {
        success: false,
        message: `Order ${orderId} not found`,
        previousStatus: null,
        newStatus: null,
      };
    }

    // IDEMPOTENT: If already in target status, return success
    if (currentStatus === newStatus) {
      return {
        success: true,
        message: `Order ${orderId} already in status ${newStatus}`,
        previousStatus: currentStatus,
        newStatus: currentStatus,
        idempotent: true,
      };
    }

    // Validate transition (unless forced)
    if (!force) {
      const validation = validateTransition(currentStatus, newStatus);
      if (!validation.valid) {
        return {
          success: false,
          message: validation.reason,
          previousStatus: currentStatus,
          newStatus: null,
        };
      }
    }

    // Perform the transition
    await pool.query(
      "UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?",
      [newStatus, orderId]
    );

    // Log the change
    await logStatusChange(orderId, currentStatus, newStatus, changedBy, reason);

    return {
      success: true,
      message: `Order ${orderId} transitioned from ${currentStatus} to ${newStatus}`,
      previousStatus: currentStatus,
      newStatus: newStatus,
      idempotent: false,
    };
  } catch (error) {
    console.error(`Error transitioning order ${orderId}:`, error);
    return {
      success: false,
      message: `Error: ${error.message}`,
      previousStatus: null,
      newStatus: null,
      error: error,
    };
  }
}

/**
 * Batch transition multiple orders (useful for bulk operations)
 * Each transition is independent and idempotent
 * 
 * @param {Array<{orderId: number, newStatus: string, options: Object}>} transitions
 * @returns {Promise<Array<Object>>} Array of transition results
 */
async function batchTransitionOrders(transitions) {
  const results = [];

  for (const transition of transitions) {
    const result = await transitionOrderStatus(
      transition.orderId,
      transition.newStatus,
      transition.options || {}
    );
    results.push({
      orderId: transition.orderId,
      ...result,
    });
  }

  return results;
}

/**
 * Get order status history
 * 
 * @param {number} orderId - Order ID
 * @returns {Promise<Array<Object>>} Status history
 */
async function getOrderStatusHistory(orderId) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM order_status_history 
       WHERE order_id = ? 
       ORDER BY created_at DESC`,
      [orderId]
    );
    return rows;
  } catch (error) {
    console.error(`Error fetching status history for order ${orderId}:`, error);
    throw error;
  }
}

/**
 * Check if order can transition to a specific status
 * (Non-mutating check function)
 * 
 * @param {number} orderId - Order ID
 * @param {string} targetStatus - Target status to check
 * @returns {Promise<Object>} { canTransition: boolean, reason: string, currentStatus: string }
 */
async function canTransitionTo(orderId, targetStatus) {
  try {
    const currentStatus = await getCurrentOrderStatus(orderId);

    if (currentStatus === null) {
      return {
        canTransition: false,
        reason: `Order ${orderId} not found`,
        currentStatus: null,
      };
    }

    if (currentStatus === targetStatus) {
      return {
        canTransition: true,
        reason: `Already in status ${targetStatus}`,
        currentStatus: currentStatus,
        idempotent: true,
      };
    }

    const validation = validateTransition(currentStatus, targetStatus);

    return {
      canTransition: validation.valid,
      reason: validation.reason || "Transition is valid",
      currentStatus: currentStatus,
    };
  } catch (error) {
    return {
      canTransition: false,
      reason: `Error: ${error.message}`,
      currentStatus: null,
    };
  }
}

module.exports = {
  // Constants
  ORDER_STATUS,
  VALID_TRANSITIONS,

  // Main functions
  transitionOrderStatus,
  batchTransitionOrders,
  canTransitionTo,
  getCurrentOrderStatus,
  getOrderStatusHistory,

  // Utility functions
  validateTransition,
  logStatusChange,
};

