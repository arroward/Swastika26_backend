# Database Schema & Relationships

## Overview

This document describes the database schema, table relationships, and foreign key constraints for the Swastika26 Backend system.

## Database Tables

### 1. **events**

Stores information about all events.

| Column           | Type         | Constraints               | Description              |
| ---------------- | ------------ | ------------------------- | ------------------------ |
| id               | VARCHAR(255) | PRIMARY KEY               | Unique event identifier  |
| title            | VARCHAR(255) | NOT NULL                  | Event name               |
| description      | TEXT         |                           | Event description        |
| date             | TIMESTAMP    | NOT NULL                  | Event date and time      |
| location         | VARCHAR(255) |                           | Event venue              |
| image_url        | TEXT         |                           | Event image URL          |
| category         | VARCHAR(100) |                           | Event category           |
| capacity         | INTEGER      | DEFAULT 100               | Maximum participants     |
| registered_count | INTEGER      | DEFAULT 0                 | Current registered count |
| created_at       | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP | Creation timestamp       |

### 2. **event_registrations**

Stores participant registrations for events.

| Column            | Type         | Constraints                                | Description                      |
| ----------------- | ------------ | ------------------------------------------ | -------------------------------- |
| id                | SERIAL       | PRIMARY KEY                                | Auto-incrementing ID             |
| event_id          | VARCHAR(255) | FOREIGN KEY → events(id) ON DELETE CASCADE | Event reference                  |
| full_name         | VARCHAR(255) | NOT NULL                                   | Participant name                 |
| email             | VARCHAR(255) | NOT NULL                                   | Participant email                |
| phone             | VARCHAR(20)  |                                            | Participant phone                |
| organization      | VARCHAR(255) |                                            | Participant organization         |
| registration_date | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP                  | Registration time                |
|                   |              | UNIQUE(event_id, email)                    | Prevents duplicate registrations |

### 3. **admins**

Stores admin user accounts.

| Column     | Type         | Constraints                                            | Description             |
| ---------- | ------------ | ------------------------------------------------------ | ----------------------- |
| id         | VARCHAR(255) | PRIMARY KEY                                            | Unique admin identifier |
| email      | VARCHAR(255) | UNIQUE NOT NULL                                        | Admin email (login)     |
| password   | VARCHAR(255) | NOT NULL                                               | Hashed password         |
| role       | VARCHAR(50)  | NOT NULL, CHECK IN ('superadmin', 'event_coordinator') | Admin role              |
| name       | VARCHAR(255) | NOT NULL                                               | Admin full name         |
| created_at | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP                              | Account creation time   |

### 4. **admin_events**

Junction table linking event coordinators to their assigned events.

| Column   | Type         | Constraints                                | Description           |
| -------- | ------------ | ------------------------------------------ | --------------------- |
| admin_id | VARCHAR(255) | FOREIGN KEY → admins(id) ON DELETE CASCADE | Admin reference       |
| event_id | VARCHAR(255) | FOREIGN KEY → events(id) ON DELETE CASCADE | Event reference       |
|          |              | PRIMARY KEY (admin_id, event_id)           | Composite primary key |

## Table Relationships

```
┌─────────────┐
│   events    │
│             │
│ id (PK)     │◄────────┐
│ title       │         │
│ description │         │
│ date        │         │
│ ...         │         │
└─────────────┘         │
       ▲                │
       │                │
       │                │
       │ event_id (FK)  │ event_id (FK)
       │ ON DELETE      │ ON DELETE
       │ CASCADE        │ CASCADE
       │                │
┌──────┴────────────┐   │
│event_registrations│   │
│                   │   │
│ id (PK)           │   │
│ event_id (FK) ────┘   │
│ full_name         │   │
│ email             │   │
│ phone             │   │
│ ...               │   │
└───────────────────┘   │
                        │
                        │
┌─────────────┐         │
│   admins    │         │
│             │         │
│ id (PK)     │◄────────┼────────┐
│ email       │         │        │
│ password    │         │        │
│ role        │         │        │
│ name        │         │        │
└─────────────┘         │        │
       ▲                │        │
       │                │        │
       │ admin_id (FK)  │        │
       │ ON DELETE      │        │
       │ CASCADE        │        │
       │                │        │
┌──────┴─────────────┐  │        │
│   admin_events     │  │        │
│   (Junction)       │  │        │
│                    │  │        │
│ admin_id (FK) ─────┘  │        │
│ event_id (FK) ────────┘        │
│                                 │
│ PRIMARY KEY (admin_id, event_id)
└─────────────────────────────────┘
```

## Foreign Key Constraints

### event_registrations → events

- **Column:** `event_id`
- **References:** `events(id)`
- **ON DELETE:** CASCADE (deleting an event removes all registrations)
- **ON UPDATE:** CASCADE (updating event ID updates registrations)

### admin_events → admins

- **Column:** `admin_id`
- **References:** `admins(id)`
- **ON DELETE:** CASCADE (deleting an admin removes their event assignments)
- **ON UPDATE:** CASCADE (updating admin ID updates assignments)

### admin_events → events

- **Column:** `event_id`
- **References:** `events(id)`
- **ON DELETE:** CASCADE (deleting an event removes coordinator assignments)
- **ON UPDATE:** CASCADE (updating event ID updates assignments)

## Indexes

For optimal query performance, the following indexes are created:

- `idx_event_registrations_event_id` on `event_registrations(event_id)`
- `idx_admin_events_admin_id` on `admin_events(admin_id)`
- `idx_admin_events_event_id` on `admin_events(event_id)`

## Data Integrity Rules

1. **Unique Registrations:** Each email can only register once per event
   - Enforced by: `UNIQUE(event_id, email)` constraint

2. **Cascading Deletes:**
   - Deleting an event automatically removes all registrations and coordinator assignments
   - Deleting an admin automatically removes all their event assignments
   - Ensures no orphaned records

3. **Registered Count Accuracy:**
   - The `registered_count` in the `events` table should always match the actual count in `event_registrations`
   - Automatically updated when registrations are added
   - Can be verified and fixed using database scripts

4. **Role Validation:**
   - Admin role must be either 'superadmin' or 'event_coordinator'
   - Enforced by: `CHECK (role IN ('superadmin', 'event_coordinator'))`

## Database Scripts

### Verify Database Integrity

Checks all table relationships, foreign keys, and data integrity:

```bash
npm run verify-db
```

This script checks:

- ✅ All required tables exist
- ✅ Foreign key constraints are properly configured
- ✅ No orphaned records exist
- ✅ registered_count values are accurate
- ✅ Table structures are correct

### Fix Database Relationships

Fixes any issues found and ensures all foreign keys have CASCADE:

```bash
npm run fix-db
```

This script:

- 🔧 Removes orphaned registrations
- 🔧 Removes orphaned admin_events
- 🔧 Fixes registered_count for all events
- 🔧 Ensures foreign key constraints have CASCADE
- 🔧 Adds performance indexes

## User Roles & Permissions

### Superadmin

- **Access:** All events, all registrations, all admins
- **Capabilities:**
  - View all events (new Events tab)
  - View all registrations across all events
  - Create/edit/delete other admins
  - Assign events to event coordinators
  - Download reports for all events

### Event Coordinator

- **Access:** Only assigned events
- **Capabilities:**
  - View events assigned to them
  - View registrations for assigned events only
  - Filter students by event name
  - Download reports for assigned events only
  - Cannot manage other admins

## API Endpoints Related to Relationships

### Events

- `GET /api/events` - Get all events (used for assignment selection)
- `GET /api/admin/events` - Get events for current admin (filtered by role)

### Registrations

- `GET /api/admin/registrations?eventId=<id>` - Get registrations for an event
- `POST /api/register` - Register for an event (updates registered_count)

### Admin Event Assignments

- `GET /api/admin/manage/:id/events` - Get events assigned to an admin
- `PUT /api/admin/manage/:id/events` - Update event assignments for an admin

## Common Queries

### Get all registrations with event details

```sql
SELECT
  r.id,
  r.full_name,
  r.email,
  r.phone,
  r.organization,
  r.registration_date,
  e.title as event_title,
  e.date as event_date,
  e.location as event_location
FROM event_registrations r
INNER JOIN events e ON r.event_id = e.id
ORDER BY r.registration_date DESC;
```

### Get events managed by a coordinator

```sql
SELECT
  e.id,
  e.title,
  e.date,
  e.registered_count,
  e.capacity
FROM events e
INNER JOIN admin_events ae ON e.id = ae.event_id
WHERE ae.admin_id = '<coordinator-id>'
ORDER BY e.date ASC;
```

### Get coordinators assigned to an event

```sql
SELECT
  a.id,
  a.name,
  a.email
FROM admins a
INNER JOIN admin_events ae ON a.id = ae.admin_id
WHERE ae.event_id = '<event-id>'
  AND a.role = 'event_coordinator';
```

## Troubleshooting

### Problem: Orphaned registrations after deleting events

**Solution:** This should not happen with CASCADE constraints. Run `npm run fix-db` to clean up any existing orphans.

### Problem: registered_count doesn't match actual registrations

**Solution:** Run `npm run fix-db` to recalculate all counts.

### Problem: Event coordinator can't see their events

**Solution:** Check `admin_events` table to ensure proper assignment:

```sql
SELECT * FROM admin_events WHERE admin_id = '<coordinator-id>';
```

### Problem: Foreign key violations when deleting

**Solution:** Ensure CASCADE constraints are set. Run `npm run fix-db` to update constraints.
