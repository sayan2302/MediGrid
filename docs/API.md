# MediGrid API

Base URL: `/api`

## Health
- `GET /health`

## Items
- `POST /items`
- `GET /items`
- `GET /items/:id`
- `PATCH /items/:id`
- `DELETE /items/:id`

## Inventory
- `POST /inventory/batches`
- `GET /inventory/batches`
- `GET /inventory/batches/:id`
- `PATCH /inventory/batches/:id`
- `DELETE /inventory/batches/:id`
- `GET /inventory/summary`

## Vendors
- `POST /vendors`
- `GET /vendors`
- `GET /vendors/:id`
- `PATCH /vendors/:id`
- `DELETE /vendors/:id`

## Purchase Orders
- `POST /purchase-orders`
- `GET /purchase-orders`
- `GET /purchase-orders/:id`
- `PATCH /purchase-orders/:id`
- `POST /purchase-orders/:id/submit`
- `POST /purchase-orders/:id/approve`
- `POST /purchase-orders/:id/reject`
- `POST /purchase-orders/:id/receive`

## Alerts
- `GET /alerts`
- `PATCH /alerts/:id/resolve`
- `POST /alerts/recompute`

## Dashboard
- `GET /dashboard/overview`
- `GET /dashboard/charts/alert-distribution`
- `GET /dashboard/charts/stock-trend`

## AI
- `POST /ai/forecast-demand`
- `POST /ai/expiry-risk`
