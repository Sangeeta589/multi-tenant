import Incident from "../models/Incident.js";
import { saveNotification } from './notificationController.js';

// POST: Create a new incident
export const createIncident = async (req, res) => {
  try {
    const { incidentId, status, summary, description, urgency, tenantId, createdBy, reporterEmail ,tenantName} = req.body;

    if (!incidentId || !summary || !description || !tenantId|| !tenantName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newIncident = new Incident({
      incidentId,
      status: status?.toLowerCase() || 'logged',
      summary,
      description,
      urgency,
      tenantId,
      tenantName, 
      createdBy: createdBy?.toLowerCase() || '',
      createdByEmail: reporterEmail
    });

    const saved = await newIncident.save();

    await saveNotification({
  type: 'newIncident',
  title: reporterEmail || 'System',
  message: `New incident reported: ${saved.summary}`,
  incidentId: saved._id,
  recipientType: 'admin'
});

    res.status(201).json(saved);
  } catch (error) {
    console.error("❌ Error saving incident:", error.message);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};


// PUT: Add note to incident
export const NoteIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, addedBy, addedByEmail, role } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Note is required." });
    }

    const incident = await Incident.findById(id);
    if (!incident) {
      return res.status(404).json({ message: "Incident not found." });
    }

    const noteToAdd = {
      text,
      addedBy: addedBy || 'unknown',
      addedByEmail: addedByEmail || 'unknown@example.com',
      addedAt: new Date()
    };

    incident.notes.push(noteToAdd);
    await incident.save();

    let whoAdded = 'Someone';
    let recipientType = 'admin';

    if (role) {
      const r = role.toLowerCase();
      if (r === 'admin') {
        whoAdded = 'Admin';
        recipientType = 'user';
      } else if (r === 'user') {
        whoAdded = 'User';
        recipientType = 'admin';
      }
    }

    await saveNotification({
  type: 'newNote',
  title: addedByEmail,
  message: `New note added by ${whoAdded} (${addedByEmail}) on incident "${incident.summary}".`,
  recipientType,
  incidentId: id,
  note: noteToAdd,
  entityType: 'incident'
});

    res.status(200).json({ message: "Note added successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

// PUT: Edit an incident
export const EditIncident = async (req, res) => {
  const { id } = req.params;
  const { description, urgency, status, deadline,addedByEmail } = req.body;

  try {
    const incident = await Incident.findById(id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    console.log("Incoming req.body:", { description, urgency, status, deadline });
    console.log("Existing incident from DB:", {
      description: incident.description,
      urgency: incident.urgency,
      status: incident.status,
      deadline: incident.deadline
    });

    const isDescriptionChanged = description !== undefined && description !== incident.description;
    const isUrgencyChanged = urgency !== undefined && urgency !== incident.urgency;
    const isDeadlineChanged = (
      deadline !== undefined &&
      // allow setting deadline if it's null before
      !(incident.deadline === null && deadline) &&
      new Date(deadline).getTime() !== new Date(incident.deadline).getTime()
    );
    const isStatusChanged = status !== undefined && status !== incident.status;

    const onlyOpeningStatusChange = (
      isStatusChanged &&
      status === 'opened' &&
      incident.status === 'logged' &&
      !isDescriptionChanged &&
      !isUrgencyChanged &&
      !isDeadlineChanged
    );

    console.log("Evaluated onlyOpeningStatusChange:", onlyOpeningStatusChange);

    // Prepare update fields
    const updateFields = {};
    if (isDescriptionChanged) updateFields.description = description;
    if (isUrgencyChanged) updateFields.urgency = urgency;
    if (isDeadlineChanged || incident.deadline === null) updateFields.deadline = deadline;
    if (isStatusChanged) updateFields.status = status;

    const hasUpdates = Object.keys(updateFields).length > 0;
    if (!hasUpdates) {
      return res.status(200).json(incident); // No changes
    }

    const updatedIncident = await Incident.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedIncident) {
      return res.status(404).json({ message: 'Incident not found after update' });
    }

    // Send notification if createdBy exists
    if (updatedIncident.createdBy) {
      console.log("Sending notification to:", updatedIncident.createdBy.toString());

      await saveNotification({
        type: onlyOpeningStatusChange ? 'incidentOpened' : 'incidentUpdated',
        title: req.user?.email || addedByEmail || 'admin',
        message: onlyOpeningStatusChange
          ? `Your incident "${incident.summary}" was opened by admin.`
          : `Incident "${incident.summary}" has been updated.`,
        recipientType: 'user',
        incidentId: updatedIncident._id.toString(),
        entityType: 'incident'
      });
    }

    res.status(200).json(updatedIncident);
  } catch (error) {
    console.error('Error editing incident:', error);
    res.status(500).json({ message: 'Server error while processing incident' });
  }
};




// PUT: Take action (resolve)
export const ActionIncident = async (req, res) => {
  const { action, addedByEmail, status } = req.body; // ✅ include status

  try {
    const updated = await Incident.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status: status || 'resolved', // ✅ fallback to 'resolved' if not provided
          actionTaken: action,
          actionedBy: req.user?.email || 'admin',
          actionedAt: new Date()
        }
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Incident not found' });

    await saveNotification({
      type:
        status === 'opened' ? 'incidentOpened'
        : status === 'pending' ? 'incidentPending'
        : 'incidentUpdated',
      title: req.user?.email || addedByEmail || 'admin',
      message:
        status === 'opened'
          ? `Your incident "${updated.summary}" was opened by admin.`
          : status === 'pending'
            ? `Your incident "${updated.summary}" is now pending.`
            : `Incident "${updated.summary}" has been updated.`,
      recipientType: 'user',
      incidentId: updated._id.toString(), // ✅ fixed typo from `updatedIncident`
      entityType: 'incident'
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




// GET: Incidents by incidentId prefix
export const getIncidentsByUserIdPrefix = async (req, res) => {
  try {
    const { userId } = req.params;
    const incidents = await Incident.find({
      incidentId: { $regex: `^${userId}-` }
    }).sort({ createdAt: -1 });

    res.status(200).json(incidents);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET: Incidents by creator
export const getIncidentsByCreator = async (req, res) => {
  try {
    const { nameOrEmail } = req.params;
    const incidents = await Incident.find({
      $or: [
        { createdBy: nameOrEmail },
        { createdBy: new RegExp(`^${nameOrEmail}$`, 'i') }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json(incidents);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET: All incidents (admin view)
export const getAllIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find().sort({ createdAt: -1 });
    res.status(200).json(incidents);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET: View and auto-open incident
export const ViewIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const incident = await Incident.findById(id);

    if (!incident) {
      return res.status(404).json({ message: "Incident not found." });
    }

    // Auto-change status from 'logged' to 'opened'
    if (incident.status === "logged") {
      incident.status = "opened";
      await incident.save();

      

      
    }

    const formattedNotes = (incident.notes || []).map(note => ({
      text: note.text,
      addedBy: note.addedBy || "Unknown User",
      addedByEmail: note.addedByEmail || "unknown@example.com",
      addedAt: note.addedAt ? new Date(note.addedAt).toISOString() : null
    }));

    res.status(200).json({
      incidentId: incident.incidentId,
      status: incident.status,
      summary: incident.summary,
      description: incident.description,
      urgency: incident.urgency,
      tenantId: incident.tenantId,
      actionTaken: incident.actionTaken,
      actionedBy: incident.actionedBy,
      actionedAt: incident.actionedAt,
      notes: formattedNotes,
      createdAt: incident.createdAt,
      updatedAt: incident.updatedAt
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
};
