# Gas Lagba Admin Console — Multi-Screen Site Map (Orange & White Theme)

## 1. Project Vision
A state-of-the-art, high-density Operations Management Console for the Gas Lagba LPG Gas Marketplace in Bangladesh, styled in vibrant **Safety Flame Orange (`#FF6600`) and Crisp White (`#FFFFFF`)**.

## 2. Multi-Screen Architecture & Pages
- **`/sign-in`**: Admin email OTP login screen with branded Orange GL badge and clean white elevation card.
- **`/dashboard`**: Real-time revenue (GMV in integer Paisa), order pipeline, live active deliveries, branch online status, and loud Orange escalation alerts.
- **`/orders`**: Real-time order dispatch board, status tabs (`Pending`, `Preparing`, `Out for Delivery`, `Delivered`, `Cancelled`), rapid search, customer & vendor cards.
- **`/orders/escalations`**: 5m/10m unacknowledged order escalation queue with resolution actions.
- **`/vendors`**: Vendor partner directory, pending trade license approval queue, branch coverage mapper, star ratings.
- **`/catalogue/categories`**: Bilingual category taxonomy (EN/BN) with active state management.
- **`/catalogue/products`**: LPG cylinder brands, refill vs new package cylinder variants, price/deposit controls, compliance moderation queue.
- **`/payments`**: Payment transaction reconciliation, COD receipts vs online gateway settlements (SSLCOMMERZ, bKash, Nagad), refund management.
- **`/payouts`**: Append-only vendor payout ledger, pending disbursement requests, bKash/Nagad/Bank batch settlement exporter.
- **`/riders`**: Branch delivery rider roster, active duty tracker, capacity utilization metrics.
- **`/customers`**: Customer user registry, verified phone/email records, saved delivery addresses.
- **`/campaigns`**: Targeted push notification broadcast composer with audience filtering.
- **`/notifications`**: FCM push delivery attempt logs, OEM manufacturer battery policy tracking (Samsung, Xiaomi, Realme, Vivo, Transsion).
- **`/subscriptions`**: Vendor SaaS partner tier management, manual TrxID verification approvals.
- **`/support`**: Customer and vendor support ticket queue, account recovery workflow (BR-006).
- **`/users` & `/roles`**: Platform administrator RBAC, permissions matrix.
- **`/settings`**: Dynamic operational parameters (cancellation windows, commission rates, delivery slot caps).
- **`/audit`**: Immutable system audit log viewer with actor IP and JSON diff inspector.

## 3. Sitemap & Status (100% Completed)
- [x] `/sign-in` (Admin OTP Authentication)
- [x] `/dashboard` (Executive Overview & Live Ops)
- [x] `/orders` (Live Order Fulfillment & Dispatch)
- [x] `/orders/escalations` (Escalation Resolution Board)
- [x] `/vendors` (Vendor & Branch Network)
- [x] `/catalogue/categories` (Category Hierarchy)
- [x] `/catalogue/products` (Cylinder Catalog & Moderation)
- [x] `/payments` (Financial Gateway Reconciliation)
- [x] `/payouts` (Vendor Disbursement Ledger)
- [x] `/riders` (Delivery Personnel Management)
- [x] `/customers` (User Accounts & Addresses)
- [x] `/campaigns` (Push Notification Campaigns)
- [x] `/notifications` (Delivery Logs & DLQ Viewer)
- [x] `/subscriptions` (Partner Plan Billing)
- [x] `/support` (Helpdesk & Account Recovery)
- [x] `/users` (Admin Accounts & Access)
- [x] `/roles` (RBAC Matrix)
- [x] `/settings` (System Configuration)
- [x] `/audit` (Security & Audit Trail)
