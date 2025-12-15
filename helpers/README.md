# Order ↔ Payment Pipeline Helpers

Backend helper functions supporting the Order ↔ Payment pipeline stabilization.

## Overview

This module provides two key helper systems:

1. **Order Status Transition Helpers** (`orderStatusHelpers.js`)
2. **Post-Payment Validation Helpers** (`paymentValidationHelpers.js`)

## Key Features

✅ **Idempotent** - Can be run multiple times without side effects  
✅ **Testable** - Pure functions with clear inputs/outputs  
✅ **Production Ready** - Comprehensive error handling and validation  
✅ **Well Documented** - Clear JSDoc and inline comments

---

## 1. Order Status Helpers

### Purpose
Manage order status transitions safely and consistently.

### Main Functions

#### `transitionOrderStatus(orderId, newStatus, options)`
Transition an order to a new status with validation and history logging.

```javascript
const { transitionOrderStatus, ORDER_STATUS } = require('./helpers/orderStatusHelpers');

// Example: Mark order as payment completed
const result = await transitionOrderStatus(
  123,
  ORDER_STATUS.PAYMENT_COMPLETED,
  {
    changedBy: 'payment-service',
    reason: 'Payment confirmed by Stripe'
  }
);

console.log(result);
// {
//   success: true,
//   message: "Order 123 transitioned from payment_pending to payment_completed",
//   previousStatus: "payment_pending",
//   newStatus: "payment_completed"
// }
```

**Idempotency:** If order is already in target status, returns success without changes.

#### `canTransitionTo(orderId, targetStatus)`
Check if a transition is possible without making changes.

```javascript
const check = await canTransitionTo(123, ORDER_STATUS.SHIPPED);
if (check.canTransition) {
  await transitionOrderStatus(123, ORDER_STATUS.SHIPPED);
}
```

#### `getCurrentOrderStatus(orderId)`
Get current order status.

#### `getOrderStatusHistory(orderId)`
Get full transition history for an order.

#### `batchTransitionOrders(transitions)`
Transition multiple orders in batch.

### Valid Status Transitions

```
pending → payment_pending → payment_completed → processing → shipped → delivered
   ↓             ↓                  ↓                ↓           ↓          ↓
cancelled    cancelled          refunded        cancelled  cancelled  refunded
```

### Status Enum

```javascript
ORDER_STATUS = {
  PENDING: "pending",
  PAYMENT_PENDING: "payment_pending",
  PAYMENT_COMPLETED: "payment_completed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  REFUNDED: "refunded"
}
```

---

## 2. Payment Validation Helpers

### Purpose
Validate payment state after payment completion to ensure data integrity.

### Main Functions

#### `validatePostPaymentState(paymentId)`
Comprehensive validation of payment-order relationship.

```javascript
const { validatePostPaymentState } = require('./helpers/paymentValidationHelpers');

// Example: Validate payment after completion
const validation = await validatePostPaymentState(456);

if (validation.valid) {
  console.log('✅ Payment state is valid');
} else {
  console.error('❌ Validation errors:', validation.errors);
  console.warn('⚠️ Warnings:', validation.warnings);
}
```

**Idempotency:** Read-only operation, can be called multiple times safely.

**Returns:**
```javascript
{
  valid: boolean,
  errors: ["error1", "error2"],
  warnings: ["warning1"],
  data: {
    paymentId: 456,
    payment: { id, orderId, amount, status },
    order: { id, totalAmount, status },
    totalPaid: 100.00,
    completedPayments: 1
  }
}
```

#### `validateOrderReadyForPayment(orderId)`
Pre-validation before marking payment as complete.

```javascript
const check = await validateOrderReadyForPayment(123);
if (check.valid) {
  // Safe to process payment
} else {
  console.error('Order not ready:', check.errors);
}
```

#### Individual Validators

- `validatePaymentAmount(payment, order)` - Check amount matches
- `validatePaymentStatus(payment)` - Check payment status is valid
- `validateOrderStatus(order)` - Check order status consistency
- `validateTransactionId(payment)` - Check transaction ID uniqueness
- `validateTotalPayments(payments, order)` - Validate total payments

#### `batchValidatePayments(paymentIds)`
Validate multiple payments in batch.

---

## Integration Example

### Complete Payment Flow

```javascript
const {
  transitionOrderStatus,
  ORDER_STATUS
} = require('./helpers/orderStatusHelpers');

const {
  validateOrderReadyForPayment,
  validatePostPaymentState
} = require('./helpers/paymentValidationHelpers');

async function processPaymentCompletion(orderId, paymentId) {
  // 1. Pre-validation: Check order is ready
  const preCheck = await validateOrderReadyForPayment(orderId);
  if (!preCheck.valid) {
    return { success: false, errors: preCheck.errors };
  }

  // 2. Transition order status
  const transition = await transitionOrderStatus(
    orderId,
    ORDER_STATUS.PAYMENT_COMPLETED,
    {
      changedBy: 'payment-webhook',
      reason: 'Payment completed successfully'
    }
  );

  if (!transition.success) {
    return { success: false, errors: [transition.message] };
  }

  // 3. Post-validation: Verify final state
  const postCheck = await validatePostPaymentState(paymentId);
  if (!postCheck.valid) {
    // Log warnings but may still proceed
    console.warn('Post-payment validation warnings:', postCheck.warnings);
  }

  return {
    success: true,
    order: transition,
    validation: postCheck
  };
}
```

---

## Database Tables Required

See `db/orders-tables.sql` for schema.

Required tables:
- `orders` - Order data
- `order_items` - Order line items
- `payments` - Payment transactions
- `order_status_history` - Audit trail

---

## Testing

Unit tests are provided in `tests/` directory:
- `tests/orderStatusHelpers.test.js`
- `tests/paymentValidationHelpers.test.js`

Run tests:
```bash
npm test
```

### Integration Testing

Manual test scenarios are documented in test files. Run with actual database to verify:
- Idempotency behavior
- Transaction consistency
- Error handling

---

## Error Handling

All functions return structured results instead of throwing exceptions:

```javascript
{
  success: boolean,      // Overall success status
  message: string,       // Human-readable message
  errors: string[],      // List of errors (if any)
  warnings: string[],    // List of warnings (non-blocking)
  data: object          // Additional data
}
```

This allows callers to handle errors gracefully without try-catch blocks.

---

## Connection to Main Pipeline

These helpers are designed to be used by Ashutosh's main Order ↔ Payment pipeline:

1. **Order Creation** → Use `transitionOrderStatus` to set initial status
2. **Payment Initiated** → Transition to `payment_pending`
3. **Payment Webhook** → Validate with `validateOrderReadyForPayment`, then transition
4. **Payment Completed** → Use `validatePostPaymentState` to verify integrity
5. **Order Processing** → Continue transitions through fulfillment flow

---

## Notes

- All functions are **idempotent** - safe to retry
- All validations are **read-only** - no side effects
- Status history is **automatically logged** on transitions
- Transitions are **validated** before execution
- Database errors are **caught and returned** as structured results

---

## Author

This module supports the Order ↔ Payment pipeline stabilization effort.

For questions or issues:
- Technical details → Esra
- Architecture/boundaries → Mira
- Flow/logic/acceptance criteria → Ayşe

