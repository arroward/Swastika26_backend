# Admin System Documentation

## Overview

The admin system provides role-based access control for managing event registrations with two types of administrators:

### Admin Roles

1. **Superadmin**
   - Full access to all events and participant data
   - Can view all registrations across all events
   - Can download complete participant lists
   - Has unrestricted dashboard access

2. **Event Coordinator**
   - Limited to specific event(s) assigned to them
   - Can only view registrations for their assigned event(s)
   - Can download participant lists for their assigned events only
   - Role-based dashboard view

## Setup Instructions

### 1. Database Setup

The admin tables are automatically created when you run the application. The schema includes:

- `admins` table: Stores admin accounts with roles
- `admin_events` table: Junction table linking event coordinators to their events

### 2. Seeding Admin Accounts

Run the admin seeding script to create initial admin accounts:

```bash
npm run seed:admins
```

This will create:

- **Superadmin Account**
  - Email: `superadmin@swastika26.com`
  - Password: `superadmin123`
  - Full access to all data

- **Event Coordinator Account(s)**
  - Email: `coordinator@swastika26.com`
  - Password: `coordinator123`
  - Assigned to first available event

⚠️ **IMPORTANT**: Change these default passwords immediately after first login!

### 3. Creating Additional Coordinators

To add more event coordinators, you can:

1. Run a custom SQL query:

```sql
-- Create the coordinator admin
INSERT INTO admins (id, email, password, role, name)
VALUES (
  'unique-id-here',
  'coordinator.email@example.com',
  'hashed-password',
  'event_coordinator',
  'Coordinator Name'
);

-- Assign them to an event
INSERT INTO admin_events (admin_id, event_id)
VALUES ('admin-id', 'event-id');
```

2. Or modify the `seed-admins.ts` script to add more coordinators.

## Usage

### Accessing the Admin Panel

1. Navigate to `/admin` in your browser
2. You'll be redirected to `/admin/login`
3. Enter your admin credentials
4. Upon successful login, you'll be redirected to `/admin/dashboard`

### Superadmin Features

- **View All Registrations**: See participants from all events in a single table
- **Filter by Event**: (If needed in the future)
- **Download Options**:
  - CSV format: For Excel/spreadsheet use
  - JSON format: For programmatic processing
- **Real-time Stats**: View total registration counts

### Event Coordinator Features

- **Event Selection**: Dropdown to select from assigned events
- **View Event Registrations**: See participants for selected event
- **Download Options**:
  - CSV format: Participants for selected event
  - JSON format: Participants for selected event
- **Event-specific Stats**: Registration count per event

## API Endpoints

### Authentication

- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/session` - Check current session

### Data Access

- `GET /api/admin/events?role={role}` - Get events (all for superadmin, assigned for coordinator)
- `GET /api/admin/registrations?role={role}&eventId={id}` - Get registrations
- `GET /api/admin/download?role={role}&eventId={id}&format={csv|json}` - Download data

## Security Features

1. **Session-based Authentication**: Using HTTP-only cookies
2. **Password Hashing**: SHA-256 hashing (upgrade to bcrypt for production)
3. **Role-based Authorization**: API routes verify role before returning data
4. **Protected Routes**: Dashboard checks authentication on mount

## File Structure

```
app/
  admin/
    page.tsx                    # Redirects to login
    login/
      page.tsx                  # Login page
    dashboard/
      page.tsx                  # Main dashboard
  api/
    admin/
      login/route.ts            # Login endpoint
      logout/route.ts           # Logout endpoint
      session/route.ts          # Session check
      events/route.ts           # Events list
      registrations/route.ts    # Registrations list
      download/route.ts         # CSV/JSON download

components/
  AdminLoginForm.tsx            # Login form component
  AdminHeader.tsx               # Dashboard header
  EventSelect.tsx               # Event dropdown (coordinators)
  RegistrationsTable.tsx        # Registrations data table

lib/
  db.ts                         # Database functions

scripts/
  seed-admins.ts               # Admin seeding script

types/
  admin.ts                      # TypeScript types
```

## Production Considerations

### Security Enhancements

1. **Use bcrypt for password hashing**:

   ```bash
   npm install bcrypt
   npm install --save-dev @types/bcrypt
   ```

2. **Implement JWT tokens** instead of simple session cookies

3. **Add rate limiting** to prevent brute force attacks

4. **Enable HTTPS** in production

5. **Add password complexity requirements**

6. **Implement password reset functionality**

### Additional Features to Consider

- Two-factor authentication (2FA)
- Admin activity logging
- Email notifications for new registrations
- Bulk operations (delete, export selected)
- Search and filtering capabilities
- Pagination for large datasets
- Admin user management UI for superadmins

## Troubleshooting

### Cannot Login

- Verify database connection
- Check if admin accounts exist: `SELECT * FROM admins;`
- Ensure passwords are hashed correctly
- Check browser console for errors

### Coordinator Cannot See Events

- Verify `admin_events` table has correct mappings
- Check coordinator's assigned events:
  ```sql
  SELECT * FROM admin_events WHERE admin_id = 'coordinator-id';
  ```

### Download Not Working

- Check browser console for errors
- Verify API endpoint returns data
- Ensure proper permissions (role and eventId)

## Support

For issues or questions, check:

1. Browser console for client-side errors
2. Server logs for API errors
3. Database query logs for data issues
