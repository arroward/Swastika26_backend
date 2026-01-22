import { neon } from "@neondatabase/serverless";
import { Event, Admin, AdminRole } from "@/types/event";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

export const sql = neon(process.env.DATABASE_URL);

// Database initialization
export async function initDatabase() {
  try {
    // Create events table
    await sql`
      CREATE TABLE IF NOT EXISTS events (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        date TIMESTAMP NOT NULL,
        location VARCHAR(255),
        image_url TEXT,
        category VARCHAR(100),
        capacity INTEGER DEFAULT 100,
        registered_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create registrations table
    await sql`
      CREATE TABLE IF NOT EXISTS event_registrations (
        id SERIAL PRIMARY KEY,
        event_id VARCHAR(255) REFERENCES events(id) ON DELETE CASCADE,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        college_name VARCHAR(255),
        university_name VARCHAR(255),
        team_size INTEGER DEFAULT 1,
        team_members JSONB,
        organization VARCHAR(255),
        registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(event_id, email)
      )
    `;

    // Create admins table
    await sql`
      CREATE TABLE IF NOT EXISTS admins (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('superadmin', 'event_coordinator')),
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create admin_events junction table for event coordinators
    await sql`
      CREATE TABLE IF NOT EXISTS admin_events (
        admin_id VARCHAR(255) REFERENCES admins(id) ON DELETE CASCADE,
        event_id VARCHAR(255) REFERENCES events(id) ON DELETE CASCADE,
        PRIMARY KEY (admin_id, event_id)
      )
    `;

    console.log("Database tables initialized successfully");
  } catch (error) {
    console.error("Database initialization error:", error);
    throw error;
  }
}

// Helper functions for events
export async function getEvents(): Promise<Event[]> {
  try {
    const events = await sql`
      SELECT 
        id,
        title,
        description,
        date,
        location,
        image_url as "imageUrl",
        category,
        capacity,
        registered_count as "registeredCount",
        registration_fee as "registrationFee",
        is_online as "isOnline"
      FROM events
      ORDER BY date ASC
    `;
    return events as Event[];
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

export async function getEventById(id: string): Promise<Event | null> {
  try {
    const events = await sql`
      SELECT 
        id,
        title,
        description,
        date,
        location,
        image_url as "imageUrl",
        category,
        capacity,
        registered_count as "registeredCount",
        registration_fee as "registrationFee",
        is_online as "isOnline"
      FROM events
      WHERE id = ${id}
    `;
    return (events[0] as Event) || null;
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
}

export async function registerForEvent(registration: {
  eventId: string;
  fullName: string;
  email: string;
  phone: string;
  collegeName: string;
  universityName: string;
  teamSize: number;
  teamMembers?: string[];
  upiTransactionId?: string;
  accountHolderName?: string;
  uploadFileUrl?: string;
}) {
  try {
    const result = await sql`
      INSERT INTO event_registrations (
        event_id, 
        full_name, 
        email, 
        phone, 
        college_name, 
        university_name, 
        team_size, 
        team_members,
        upi_transaction_id,
        account_holder_name,
        upload_file_url
      )
      VALUES (
        ${registration.eventId}, 
        ${registration.fullName}, 
        ${registration.email}, 
        ${registration.phone}, 
        ${registration.collegeName}, 
        ${registration.universityName}, 
        ${registration.teamSize}, 
        ${JSON.stringify(registration.teamMembers || [])},
        ${registration.upiTransactionId || null},
        ${registration.accountHolderName || null},
        ${registration.uploadFileUrl || null}
      )
      RETURNING id
    `;

    // Update registered count
    await sql`
      UPDATE events
      SET registered_count = registered_count + 1
      WHERE id = ${registration.eventId}
    `;

    return result[0];
  } catch (error) {
    console.error("Error registering for event:", error);
    throw error;
  }
}

// Admin authentication
export async function getAdminByEmail(email: string) {
  try {
    const result = await sql`
      SELECT 
        id,
        email,
        password,
        role,
        name
      FROM admins
      WHERE email = ${email}
    `;
    return result[0] || null;
  } catch (error) {
    console.error("Error fetching admin:", error);
    return null;
  }
}

// Get events for admin (coordinator sees only their events)
export async function getAdminEvents(adminId: string, role: string) {
  try {
    if (role === "superadmin") {
      return await getEvents();
    } else {
      // Event coordinator - get only their events
      const events = await sql`
        SELECT 
          e.id,
          e.title,
          e.description,
          e.date,
          e.location,
          e.image_url as "imageUrl",
          e.category,
          e.capacity,
          e.registered_count as "registeredCount"
        FROM events e
        INNER JOIN admin_events ae ON e.id = ae.event_id
        WHERE ae.admin_id = ${adminId}
        ORDER BY e.date ASC
      `;
      return events as Event[];
    }
  } catch (error) {
    console.error("Error fetching admin events:", error);
    return [];
  }
}

// Get registrations for an event
export async function getEventRegistrations(eventId: string) {
  try {
    const registrations = await sql`
      SELECT 
        r.id,
        r.event_id as "eventId",
        e.title as "eventTitle",
        r.full_name as "fullName",
        r.email,
        r.phone,
        r.college_name as "collegeName",
        r.university_name as "universityName",
        r.team_size as "teamSize",
        r.team_members as "teamMembers",
        r.upi_transaction_id as "upiTransactionId",
        r.account_holder_name as "accountHolderName",
        r.upload_file_url as "uploadFileUrl",
        r.registration_date as "registrationDate"
      FROM event_registrations r
      INNER JOIN events e ON r.event_id = e.id
      WHERE r.event_id = ${eventId}
      ORDER BY r.registration_date DESC
    `;
    return registrations;
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return [];
  }
}

// Get all registrations (for superadmin)
export async function getAllRegistrations() {
  try {
    const registrations = await sql`
      SELECT 
        r.id,
        r.event_id as "eventId",
        e.title as "eventTitle",
        r.full_name as "fullName",
        r.email,
        r.phone,
        r.college_name as "collegeName",
        r.university_name as "universityName",
        r.team_size as "teamSize",
        r.team_members as "teamMembers",
        r.upi_transaction_id as "upiTransactionId",
        r.account_holder_name as "accountHolderName",
        r.upload_file_url as "uploadFileUrl",
        r.registration_date as "registrationDate"
      FROM event_registrations r
      INNER JOIN events e ON r.event_id = e.id
      ORDER BY r.registration_date DESC
    `;
    return registrations;
  } catch (error) {
    console.error("Error fetching all registrations:", error);
    return [];
  }
}

// Get registrations for coordinator's events
export async function getCoordinatorRegistrations(adminId: string) {
  try {
    const registrations = await sql`
      SELECT 
        r.id,
        r.event_id as "eventId",
        e.title as "eventTitle",
        r.full_name as "fullName",
        r.email,
        r.phone,
        r.college_name as "collegeName",
        r.university_name as "universityName",
        r.team_size as "teamSize",
        r.team_members as "teamMembers",
        r.upi_transaction_id as "upiTransactionId",
        r.account_holder_name as "accountHolderName",
        r.upload_file_url as "uploadFileUrl",
        r.registration_date as "registrationDate"
      FROM event_registrations r
      INNER JOIN events e ON r.event_id = e.id
      INNER JOIN admin_events ae ON e.id = ae.event_id
      WHERE ae.admin_id = ${adminId}
      ORDER BY r.registration_date DESC
    `;
    return registrations;
  } catch (error) {
    console.error("Error fetching coordinator registrations:", error);
    return [];
  }
}

export async function getRegistrationsByEvent(eventId: string) {
  try {
    const registrations = await sql`
      SELECT 
        id,
        event_id as "eventId",
        full_name as "fullName",
        email,
        phone,
        college_name as "collegeName",
        university_name as "universityName",
        team_size as "teamSize",
        team_members as "teamMembers",
        upi_transaction_id as "upiTransactionId",
        account_holder_name as "accountHolderName",
        registration_date as "registrationDate"
      FROM event_registrations
      WHERE event_id = ${eventId}
      ORDER BY registration_date DESC
    `;
    return registrations;
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return [];
  }
}

export async function getAdminManagedEvents(adminId: string): Promise<Event[]> {
  try {
    const events = await sql`
      SELECT 
        e.id,
        e.title,
        e.description,
        e.date,
        e.location,
        e.image_url as "imageUrl",
        e.category,
        e.capacity,
        e.registered_count as "registeredCount"
      FROM events e
      JOIN admin_events ae ON e.id = ae.event_id
      WHERE ae.admin_id = ${adminId}
      ORDER BY e.date ASC
    `;
    return events as Event[];
  } catch (error) {
    console.error("Error fetching admin managed events:", error);
    return [];
  }
}

export async function createAdmin(admin: {
  id: string;
  email: string;
  password: string;
  role: AdminRole;
  name: string;
}) {
  try {
    await sql`
      INSERT INTO admins (id, email, password, role, name)
      VALUES (${admin.id}, ${admin.email}, ${admin.password}, ${admin.role}, ${admin.name})
    `;
    return true;
  } catch (error) {
    console.error("Error creating admin:", error);
    throw error;
  }
}

export async function assignEventToCoordinator(
  adminId: string,
  eventId: string,
) {
  try {
    await sql`
      INSERT INTO admin_events (admin_id, event_id)
      VALUES (${adminId}, ${eventId})
      ON CONFLICT DO NOTHING
    `;
    return true;
  } catch (error) {
    console.error("Error assigning event to coordinator:", error);
    throw error;
  }
}

// Get event IDs assigned to an admin
export async function getAdminEventIds(adminId: string): Promise<string[]> {
  try {
    const result = await sql`
      SELECT event_id
      FROM admin_events
      WHERE admin_id = ${adminId}
    `;
    return result.map((row: any) => row.event_id);
  } catch (error) {
    console.error("Error fetching admin event IDs:", error);
    return [];
  }
}

// Update event assignments for an admin (removes old assignments and adds new ones)
export async function updateAdminEventAssignments(
  adminId: string,
  eventIds: string[],
) {
  try {
    // Remove all existing assignments
    await sql`
      DELETE FROM admin_events
      WHERE admin_id = ${adminId}
    `;

    // Add new assignments
    if (eventIds.length > 0) {
      for (const eventId of eventIds) {
        await sql`
          INSERT INTO admin_events (admin_id, event_id)
          VALUES (${adminId}, ${eventId})
          ON CONFLICT DO NOTHING
        `;
      }
    }
    return true;
  } catch (error) {
    console.error("Error updating admin event assignments:", error);
    throw error;
  }
}

// Get all admins (for superadmin)
export async function getAllAdmins() {
  try {
    const admins = await sql`
      SELECT 
        id,
        email,
        role,
        name,
        created_at as "createdAt"
      FROM admins
      ORDER BY created_at DESC
    `;
    return admins;
  } catch (error) {
    console.error("Error fetching all admins:", error);
    return [];
  }
}

// Update admin details (for superadmin)
export async function updateAdmin(
  adminId: string,
  updates: {
    email?: string;
    password?: string;
    role?: string;
    name?: string;
  },
) {
  try {
    const setFields = [];
    const values = [];

    if (updates.email) {
      setFields.push(`email = $${setFields.length + 1}`);
      values.push(updates.email);
    }
    if (updates.password) {
      setFields.push(`password = $${setFields.length + 1}`);
      values.push(updates.password);
    }
    if (updates.role) {
      setFields.push(`role = $${setFields.length + 1}`);
      values.push(updates.role);
    }
    if (updates.name) {
      setFields.push(`name = $${setFields.length + 1}`);
      values.push(updates.name);
    }

    if (setFields.length === 0) {
      return false;
    }

    values.push(adminId);

    await sql`
      UPDATE admins
      SET email = ${updates.email || sql`email`},
          password = ${updates.password || sql`password`},
          role = ${updates.role || sql`role`},
          name = ${updates.name || sql`name`}
      WHERE id = ${adminId}
    `;

    return true;
  } catch (error) {
    console.error("Error updating admin:", error);
    throw error;
  }
}

// Delete admin (for superadmin)
export async function deleteAdmin(adminId: string) {
  try {
    await sql`
      DELETE FROM admins
      WHERE id = ${adminId}
    `;
    return true;
  } catch (error) {
    console.error("Error deleting admin:", error);
    throw error;
  }
}

// Event management functions (for superadmin)
export async function createEvent(event: {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  imageUrl: string;
  category: string;
  capacity: number;
}) {
  try {
    await sql`
      INSERT INTO events (id, title, description, date, location, image_url, category, capacity, registered_count)
      VALUES (${event.id}, ${event.title}, ${event.description}, ${event.date}, ${event.location}, ${event.imageUrl}, ${event.category}, ${event.capacity}, 0)
    `;
    return true;
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
}

export async function updateEvent(
  eventId: string,
  updates: {
    title?: string;
    description?: string;
    date?: string;
    location?: string;
    imageUrl?: string;
    category?: string;
    capacity?: number;
  },
) {
  try {
    await sql`
      UPDATE events
      SET title = ${updates.title || sql`title`},
          description = ${updates.description || sql`description`},
          date = ${updates.date || sql`date`},
          location = ${updates.location || sql`location`},
          image_url = ${updates.imageUrl || sql`image_url`},
          category = ${updates.category || sql`category`},
          capacity = ${updates.capacity !== undefined ? updates.capacity : sql`capacity`}
      WHERE id = ${eventId}
    `;
    return true;
  } catch (error) {
    console.error("Error updating event:", error);
    throw error;
  }
}

export async function deleteEvent(eventId: string) {
  try {
    await sql`
      DELETE FROM events
      WHERE id = ${eventId}
    `;
    return true;
  } catch (error) {
    console.error("Error deleting event:", error);
    throw error;
  }
}
