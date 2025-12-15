/**
 * Post-Payment Validation Helpers
 * 
 * Purpose: Validate payment state after payment completion to ensure data integrity
 * in the Order ↔ Payment pipeline
 * 
 * Key Features:
 * - Idempotent: Can be run multiple times without side effects
 * - Testable: Pure validation functions with clear inputs/outputs
 * - Comprehensive: Validates all critical payment-order relationships
 */

const pool = require("../db/db");

/**
 * Payment validation result structure
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether validation passed
 * @property {Array<string>} errors - List of validation errors
 * @property {Array<string>} warnings - List of validation warnings
 * @property {Object} data - Additional data from validation
 */

/**
 * Fetch payment details from database
 * 
 * @param {number} paymentId - Payment ID
 * @returns {Promise<Object|null>} Payment details or null if not found
 */
async function getPaymentById(paymentId) {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM payments WHERE id = ?",
      [paymentId]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error(`Error fetching payment ${paymentId}:`, error);
    throw error;
  }
}

/**
 * Fetch order details from database
 * 
 * @param {number} orderId - Order ID
 * @returns {Promise<Object|null>} Order details or null if not found
 */
async function getOrderById(orderId) {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM orders WHERE id = ?",
      [orderId]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error);
    throw error;
  }
}

/**
 * Get all payments for an order
 * 
 * @param {number} orderId - Order ID
 * @returns {Promise<Array<Object>>} Array of payments
 */
async function getPaymentsByOrderId(orderId) {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM payments WHERE order_id = ?",
      [orderId]
    );
    return rows;
  } catch (error) {
    console.error(`Error fetching payments for order ${orderId}:`, error);
    throw error;
  }
}

/**
 * Validate payment amount matches order total
 * 
 * @param {Object} payment - Payment object
 * @param {Object} order - Order object
 * @returns {ValidationResult}
 */
function validatePaymentAmount(payment, order) {
  const errors = [];
  const warnings = [];

  if (!payment || !order) {
    errors.push("Payment or order data missing");
    return { valid: false, errors, warnings, data: {} };
  }

  const paymentAmount = parseFloat(payment.amount);
  const orderAmount = parseFloat(order.total_amount);

  if (isNaN(paymentAmount) || isNaN(orderAmount)) {
    errors.push("Invalid amount format");
    return { valid: false, errors, warnings, data: {} };
  }

  // Check if amounts match (with small tolerance for floating point)
  const tolerance = 0.01;
  const difference = Math.abs(paymentAmount - orderAmount);

  if (difference > tolerance) {
    errors.push(
      `Payment amount (${paymentAmount}) does not match order total (${orderAmount})`
    );
  }

  if (paymentAmount < orderAmount) {
    warnings.push("Payment amount is less than order total");
  } else if (paymentAmount > orderAmount) {
    warnings.push("Payment amount is greater than order total");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    data: {
      paymentAmount,
      orderAmount,
      difference,
    },
  };
}

/**
 * Validate payment status is appropriate for post-payment state
 * 
 * @param {Object} payment - Payment object
 * @returns {ValidationResult}
 */
function validatePaymentStatus(payment) {
  const errors = [];
  const warnings = [];

  if (!payment) {
    errors.push("Payment data missing");
    return { valid: false, errors, warnings, data: {} };
  }

  const validPostPaymentStatuses = ["completed", "processing"];
  const invalidStatuses = ["pending", "failed"];

  if (invalidStatuses.includes(payment.status)) {
    errors.push(
      `Payment status '${payment.status}' is invalid for post-payment validation`
    );
  } else if (!validPostPaymentStatuses.includes(payment.status)) {
    warnings.push(`Unexpected payment status: ${payment.status}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    data: {
      paymentStatus: payment.status,
    },
  };
}

/**
 * Validate order status is consistent with payment completion
 * 
 * @param {Object} order - Order object
 * @returns {ValidationResult}
 */
function validateOrderStatus(order) {
  const errors = [];
  const warnings = [];

  if (!order) {
    errors.push("Order data missing");
    return { valid: false, errors, warnings, data: {} };
  }

  const validPostPaymentStatuses = [
    "payment_completed",
    "processing",
    "shipped",
    "delivered",
  ];

  const invalidStatuses = ["pending", "payment_pending"];

  if (invalidStatuses.includes(order.status)) {
    errors.push(
      `Order status '${order.status}' is inconsistent with completed payment`
    );
  } else if (!validPostPaymentStatuses.includes(order.status)) {
    warnings.push(
      `Order status '${order.status}' may need review after payment`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    data: {
      orderStatus: order.status,
    },
  };
}

/**
 * Validate transaction ID exists and is unique
 * 
 * @param {Object} payment - Payment object
 * @returns {Promise<ValidationResult>}
 */
async function validateTransactionId(payment) {
  const errors = [];
  const warnings = [];

  if (!payment) {
    errors.push("Payment data missing");
    return { valid: false, errors, warnings, data: {} };
  }

  if (!payment.transaction_id || payment.transaction_id.trim() === "") {
    errors.push("Transaction ID is missing");
    return { valid: false, errors, warnings, data: {} };
  }

  // Check for duplicate transaction IDs
  try {
    const [rows] = await pool.query(
      "SELECT COUNT(*) as count FROM payments WHERE transaction_id = ? AND id != ?",
      [payment.transaction_id, payment.id]
    );

    if (rows[0].count > 0) {
      errors.push(
        `Duplicate transaction ID found: ${payment.transaction_id}`
      );
    }
  } catch (error) {
    errors.push(`Error checking transaction ID uniqueness: ${error.message}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    data: {
      transactionId: payment.transaction_id,
    },
  };
}

/**
 * Validate total payments against order amount
 * 
 * @param {Array<Object>} payments - Array of payment objects
 * @param {Object} order - Order object
 * @returns {ValidationResult}
 */
function validateTotalPayments(payments, order) {
  const errors = [];
  const warnings = [];

  if (!order) {
    errors.push("Order data missing");
    return { valid: false, errors, warnings, data: {} };
  }

  if (!payments || payments.length === 0) {
    errors.push("No payments found for order");
    return { valid: false, errors, warnings, data: {} };
  }

  const completedPayments = payments.filter((p) => p.status === "completed");
  const totalPaid = completedPayments.reduce(
    (sum, p) => sum + parseFloat(p.amount),
    0
  );
  const orderAmount = parseFloat(order.total_amount);

  const tolerance = 0.01;
  const difference = Math.abs(totalPaid - orderAmount);

  if (totalPaid < orderAmount - tolerance) {
    errors.push(
      `Total payments (${totalPaid}) less than order amount (${orderAmount})`
    );
  } else if (totalPaid > orderAmount + tolerance) {
    warnings.push(
      `Total payments (${totalPaid}) exceeds order amount (${orderAmount})`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    data: {
      totalPaid,
      orderAmount,
      completedPayments: completedPayments.length,
      totalPayments: payments.length,
    },
  };
}

/**
 * Comprehensive post-payment validation (IDEMPOTENT)
 * 
 * Validates all aspects of payment-order relationship
 * Safe to run multiple times - only reads data, no mutations
 * 
 * @param {number} paymentId - Payment ID to validate
 * @returns {Promise<ValidationResult>}
 */
async function validatePostPaymentState(paymentId) {
  const errors = [];
  const warnings = [];
  const data = {
    paymentId,
    timestamp: new Date().toISOString(),
  };

  try {
    // Fetch payment
    const payment = await getPaymentById(paymentId);
    if (!payment) {
      errors.push(`Payment ${paymentId} not found`);
      return { valid: false, errors, warnings, data };
    }

    data.payment = {
      id: payment.id,
      orderId: payment.order_id,
      amount: payment.amount,
      status: payment.status,
    };

    // Fetch associated order
    const order = await getOrderById(payment.order_id);
    if (!order) {
      errors.push(`Order ${payment.order_id} not found for payment ${paymentId}`);
      return { valid: false, errors, warnings, data };
    }

    data.order = {
      id: order.id,
      totalAmount: order.total_amount,
      status: order.status,
    };

    // Run all validations
    const paymentStatusValidation = validatePaymentStatus(payment);
    errors.push(...paymentStatusValidation.errors);
    warnings.push(...paymentStatusValidation.warnings);

    const orderStatusValidation = validateOrderStatus(order);
    errors.push(...orderStatusValidation.errors);
    warnings.push(...orderStatusValidation.warnings);

    const amountValidation = validatePaymentAmount(payment, order);
    errors.push(...amountValidation.errors);
    warnings.push(...amountValidation.warnings);
    Object.assign(data, amountValidation.data);

    const transactionValidation = await validateTransactionId(payment);
    errors.push(...transactionValidation.errors);
    warnings.push(...transactionValidation.warnings);
    Object.assign(data, transactionValidation.data);

    // Validate total payments for the order
    const allPayments = await getPaymentsByOrderId(payment.order_id);
    const totalPaymentsValidation = validateTotalPayments(allPayments, order);
    errors.push(...totalPaymentsValidation.errors);
    warnings.push(...totalPaymentsValidation.warnings);
    Object.assign(data, totalPaymentsValidation.data);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      data,
    };
  } catch (error) {
    errors.push(`Validation error: ${error.message}`);
    return {
      valid: false,
      errors,
      warnings,
      data,
    };
  }
}

/**
 * Validate order is ready for payment completion
 * (Pre-validation before marking payment as complete)
 * 
 * @param {number} orderId - Order ID
 * @returns {Promise<ValidationResult>}
 */
async function validateOrderReadyForPayment(orderId) {
  const errors = [];
  const warnings = [];
  const data = { orderId };

  try {
    const order = await getOrderById(orderId);
    if (!order) {
      errors.push(`Order ${orderId} not found`);
      return { valid: false, errors, warnings, data };
    }

    // Check order status
    const validStatuses = ["pending", "payment_pending"];
    if (!validStatuses.includes(order.status)) {
      errors.push(
        `Order status '${order.status}' not ready for payment. Expected: ${validStatuses.join(" or ")}`
      );
    }

    // Check order amount is positive
    if (parseFloat(order.total_amount) <= 0) {
      errors.push("Order amount must be greater than zero");
    }

    data.orderStatus = order.status;
    data.orderAmount = order.total_amount;

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      data,
    };
  } catch (error) {
    errors.push(`Validation error: ${error.message}`);
    return { valid: false, errors, warnings, data };
  }
}

/**
 * Batch validate multiple payments
 * 
 * @param {Array<number>} paymentIds - Array of payment IDs
 * @returns {Promise<Array<ValidationResult>>}
 */
async function batchValidatePayments(paymentIds) {
  const results = [];

  for (const paymentId of paymentIds) {
    const result = await validatePostPaymentState(paymentId);
    results.push({
      paymentId,
      ...result,
    });
  }

  return results;
}

module.exports = {
  // Main validation functions
  validatePostPaymentState,
  validateOrderReadyForPayment,
  batchValidatePayments,

  // Individual validators
  validatePaymentAmount,
  validatePaymentStatus,
  validateOrderStatus,
  validateTransactionId,
  validateTotalPayments,

  // Utility functions
  getPaymentById,
  getOrderById,
  getPaymentsByOrderId,
};

