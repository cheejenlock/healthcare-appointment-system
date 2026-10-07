# Models

This project uses **direct SQL queries** via the `pg` library instead of an ORM
(e.g., Sequelize, TypeORM).

---

## Rationale

1. **Transparency** — SQL queries are explicit and easy to debug.
2. **Transaction control** — Native SQL gives full control over `BEGIN` / `COMMIT` / `ROLLBACK`, which is required by the assignment's data-consistency requirement.
3. **Learning outcome** — Demonstrates understanding of SQL constraints, indexes, foreign keys, and parameterised queries.

---

## Where the "models" live

| Concern | Location |
|---|---|
| Table definitions (schema) | `../sql/schema.sql` |
| Connection pool | `../config/db.js` |
| Data access logic (queries) | `../controllers/*.js` |
| External API services | `../services/*.js` |

---

## Example

```javascript
// From controllers/appointmentController.js
const { rows } = await db.query(
  `SELECT a.appointment_id, a.scheduled_at, a.status,
          p.full_name AS patient_name,
          d.full_name AS doctor_name
   FROM appointment a
   JOIN patient p ON a.patient_id = p.patient_id
   JOIN doctor  d ON a.doctor_id  = d.doctor_id
   WHERE a.appointment_id = $1`,
  [appointmentId]
);