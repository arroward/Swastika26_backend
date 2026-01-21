# Quick Start Guide - Admin System

## 🚀 Getting Started

### Step 1: Set up the Database

The database tables are created automatically when you run the app. To ensure they exist, you can run:

```bash
npm run seed
```

This will create the events, registrations, admins, and admin_events tables.

### Step 2: Create Admin Accounts

Run the admin seeding script:

```bash
npm run seed:admins
```

This creates:

- **Superadmin**: `superadmin@swastika26.com` / `superadmin123`
- **Event Coordinator**: `coordinator@swastika26.com` / `coordinator123`

### Step 3: Start the Application

```bash
npm run dev
```

### Step 4: Access the Admin Panel

1. Open your browser and go to: `http://localhost:3000/admin`
2. Login with one of the credentials above
3. You'll be redirected to the dashboard

## 👥 Admin Types

### Superadmin Features

- ✅ View all registrations from all events
- ✅ Download complete participant lists (CSV/JSON)
- ✅ Access to every event's data
- ✅ No restrictions on data access

**Use Case**: Festival organizers, management team

### Event Coordinator Features

- ✅ View registrations only for assigned events
- ✅ Download participant lists for assigned events
- ✅ Switch between multiple assigned events
- ✅ Event-specific dashboard

**Use Case**: Individual event managers, volunteer coordinators

## 📊 Dashboard Overview

### For Superadmin:

```
┌─────────────────────────────────────┐
│ Super Admin Dashboard               │
│ Welcome, Super Admin                │
│ ─────────────────────────────────── │
│ [View All Registrations]            │
│                                     │
│ All Event Registrations Table       │
│ - Event Title                       │
│ - Participant Name                  │
│ - Email, Phone, Organization        │
│ - Registration Date                 │
│                                     │
│ [Download CSV] [Download JSON]      │
└─────────────────────────────────────┘
```

### For Event Coordinator:

```
┌─────────────────────────────────────┐
│ Event Coordinator Dashboard         │
│ Welcome, Coordinator Name           │
│ ─────────────────────────────────── │
│ Select Event: [Dropdown]            │
│                                     │
│ Event Registrations Table           │
│ - Participant Name                  │
│ - Email, Phone, Organization        │
│ - Registration Date                 │
│                                     │
│ [Download CSV] [Download JSON]      │
└─────────────────────────────────────┘
```

## 📥 Download Features

Both CSV and JSON formats are available:

### CSV Format

- Opens in Excel, Google Sheets
- Easy to print
- Good for manual processing
- Includes headers

### JSON Format

- Machine-readable
- Good for programmatic processing
- Can be imported into other systems
- Preserves data types

## 🔐 Security Notes

⚠️ **IMPORTANT**: The default passwords are for development only!

Before deploying to production:

1. Change all default passwords
2. Implement bcrypt for password hashing (currently using SHA-256)
3. Add rate limiting to prevent brute force attacks
4. Enable HTTPS
5. Consider implementing JWT tokens for better security
6. Add two-factor authentication (2FA) for sensitive accounts

## 🛠️ Adding More Coordinators

### Method 1: Modify the seed script

Edit `scripts/seed-admins.ts` to add more coordinators.

### Method 2: Direct database insert

```sql
-- Create coordinator
INSERT INTO admins (id, email, password, role, name)
VALUES (
  'unique-id',
  'newcoordinator@example.com',
  'hashed-password',
  'event_coordinator',
  'New Coordinator Name'
);

-- Assign to event
INSERT INTO admin_events (admin_id, event_id)
VALUES ('admin-id', 'event-id');
```

## 🐛 Troubleshooting

### Problem: Can't login

**Solution**:

- Check database connection
- Verify admin accounts exist: `SELECT * FROM admins;`
- Clear browser cookies
- Check console for errors

### Problem: Coordinator sees no events

**Solution**:

- Check `admin_events` table for correct mappings
- Verify events exist in the `events` table
- Ensure the coordinator is assigned to at least one event

### Problem: Download not working

**Solution**:

- Check browser console for errors
- Verify you have registrations to download
- Check browser pop-up blocker settings

## 📝 API Reference

All API endpoints are in `app/api/admin/`:

| Endpoint                   | Method | Description           |
| -------------------------- | ------ | --------------------- |
| `/api/admin/login`         | POST   | Authenticate admin    |
| `/api/admin/logout`        | POST   | End admin session     |
| `/api/admin/session`       | GET    | Check current session |
| `/api/admin/events`        | GET    | Get events list       |
| `/api/admin/registrations` | GET    | Get registrations     |
| `/api/admin/download`      | GET    | Download data         |

## 🎯 Next Steps

1. **Test both roles**: Login as superadmin and coordinator to see the differences
2. **Download samples**: Try downloading CSV and JSON formats
3. **Add more events**: Create more events to test with multiple coordinators
4. **Customize**: Modify the dashboard to fit your needs
5. **Secure**: Change passwords and implement production security

## 📚 Additional Resources

- Full documentation: See `ADMIN_README.md`
- Database schema: Check `lib/db.ts`
- Admin types: See `types/admin.ts`
- Components: Browse `components/` folder

## 💡 Tips

- **Superadmins** should be limited to trusted personnel only
- **Event Coordinators** should be assigned only to events they manage
- Regularly backup the registration data
- Monitor download logs for data access tracking
- Consider implementing email notifications for new registrations

---

**Ready to use?** Run `npm run seed:admins` and start managing your events! 🎉
