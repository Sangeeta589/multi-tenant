
// controllers/serviceRequestController.js
import ServiceRequest from "../models/ServiceRequest.js";
import { saveNotification } from './notificationController.js';

// Create Service Request
export const createServiceRequest = async (req, res) => {
  try {
    const {
      requestId,
      Name,
      ip,
      createdBy,
      permission,
      adminName,
      additionalInfo,
      reporterEmail,
      publicOrPrivate,
      bandwidth,
      subnet,
       tenantId,
      tenantName
    } = req.body;

    if (!requestId || !Name || !ip || !adminName || !tenantId || !tenantName) {
 console.log("Missing fields:");
  if (!requestId) console.log("requestId is missing");
  if (!Name) console.log("Name is missing");
  if (!ip) console.log("ip is missing");
  if (!adminName) console.log("adminName is missing");
  if (!tenantId) console.log("tenantId is missing");
  if (!tenantName) console.log("tenantName is missing");
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newRequest = new ServiceRequest({
      requestId,
      Name:req.body.Name,
      ip,
      createdBy: createdBy?.toLowerCase() || '',
      permission,
      adminName,
      additionalInfo,
      status: "logged",
      createdByEmail: reporterEmail,
       publicOrPrivate,
      bandwidth,
      subnet,
      tenantId,
      tenantName
    });

    const saved = await newRequest.save();

    await saveNotification({
      type: 'newServiceRequest',
      title: reporterEmail || 'System',
      message: `New service request reported: ${saved.Name}`,
      requestId: saved._id,
      recipientType: 'admin'
    });

    res.status(201).json({ message: "Service request submitted successfully", request: saved });
  } catch (error) {
    console.error("Error creating service request:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Add Note
export const NoteServices = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, addedBy, addedByEmail, role } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Note is required." });
    }

    const serviceRequest = await ServiceRequest.findById(id);
    if (!serviceRequest) {
      return res.status(404).json({ message: "Service request not found." });
    }

    const noteToAdd = {
      text,
      addedBy: addedBy || 'unknown',
      addedByEmail: addedByEmail || 'unknown@example.com',
      addedAt: new Date()
    };

    serviceRequest.notes.push(noteToAdd);
    await serviceRequest.save();

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
      message: `New note added by ${whoAdded} (${addedByEmail}) on service request "${serviceRequest.Name}".`,
      recipientType,
      requestId: id,
      note: noteToAdd,
      entityType: 'serviceRequest'
    });

    res.status(200).json({ message: "Note added successfully." });
  } catch (error) {
    console.error("Error adding note to service request:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Edit Service Request
export const EditServices = async (req, res) => {
  const { id } = req.params;
  const { Name, adminName, ip, permission, status, deadline, addedByEmail ,bandwidth,subnet} = req.body;

  try {
    const serviceRequest = await ServiceRequest.findById(id);
    if (!serviceRequest) {
      return res.status(404).json({ message: 'Service request not found' });
    }

    /*console.log("Incoming req.body:",{Name,adminName,ip,permission,status,deadline});
    console.log("Existing service from DB:",{
      Name:serviceRequest.Name,
      adminName:serviceRequest.adminName,
      ip: serviceRequest.ip,
      status:serviceRequest.status,
      permission:serviceRequest.permission,
      
      deadline:serviceRequest.deadline
    }
    );*/

    const isNameChanged = Name !== undefined && Name !== serviceRequest.Name;
    const isAdminNameChanged = adminName !== undefined && adminName !== serviceRequest.adminName;
    const isIpChanged = ip !== undefined && ip !== serviceRequest.ip;
    const isPermissionChanged = permission !== undefined && permission !== serviceRequest.permission;
    const isStatusChanged = status !== undefined && status !== serviceRequest.status;
    const isBandwidthChanged= bandwidth !==undefined && bandwidth !==serviceRequest.bandwidth;
    const isSubnetChanged= subnet !==undefined && subnet !==serviceRequest.subnet;
    const isDeadlineChanged = (
      deadline !== undefined &&
      // allow setting deadline if it's null before
      !(serviceRequest.deadline === null && deadline) &&
      new Date(deadline).getTime() !== new Date(serviceRequest.deadline).getTime()
    );

    const onlyOpeningStatusChange = (
      isStatusChanged &&
      status === 'opened' &&
      serviceRequest.status === 'logged' &&
      !isNameChanged &&
      !isAdminNameChanged &&
      !isIpChanged &&
      !isPermissionChanged &&
      !isBandwidthChanged &&
      !isSubnetChanged &&
      !isDeadlineChanged
    );

    console.log("Evaluated onlyOpeningStatusChange:", onlyOpeningStatusChange);

    const updateFields = {};
    if (isNameChanged) updateFields.Name = Name;
    if (isAdminNameChanged) updateFields.adminName = adminName;
    if (isIpChanged) updateFields.ip = ip;
    if (isPermissionChanged) updateFields.permission = permission;
    if (isDeadlineChanged || serviceRequest.deadline ===null) updateFields.deadline = deadline;
    if (isStatusChanged) updateFields.status = status;
    if (isBandwidthChanged) updateFields.bandwidth=bandwidth;
    if (isSubnetChanged) updateFields.subnet=subnet;

    const hasUpdates = Object.keys(updateFields).length > 0;

    if (!hasUpdates) {
      return res.status(200).json(serviceRequest);
    }

    const updatedService = await ServiceRequest.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedService) {
      return res.status(404).json({ message: 'Service request not found after update' });
    }

    if (updatedService.createdBy) {
      console.log("Sending notification to:", updatedService.createdBy.toString());

      await saveNotification({
  type:
    onlyOpeningStatusChange ? 'serviceRequestOpened'
    : status === 'pending' ? 'serviceRequestPending'
    : 'serviceRequestUpdated',
  title: req.user?.email || addedByEmail || 'admin',
  message: onlyOpeningStatusChange
    ? `Your service request "${serviceRequest.Name}" was opened by admin.`
    : status === 'pending'
      ? `Service request "${serviceRequest.Name}" is now pending.`
      : `Service request "${serviceRequest.Name}" has been updated.`,
  recipientType: 'user',
  requestId: updatedService._id.toString(),
  entityType: 'serviceRequest'
});

    }

    return res.status(200).json(updatedService);
  } catch (error) {
    console.error('Error updating service request:', error);
    return res.status(500).json({ message: 'Server error while updating request' });
  }
};





// Resolve Service Request
export const ActionServices = async (req, res) => {
  const { action, addedByEmail } = req.body;
    console.log("Action request received with:", action, addedByEmail);
  try {
    const updated = await ServiceRequest.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status: 'resolved',
          actionTaken: action,
          actionedBy: req.user?.email ||  'admin',
          actionedAt: new Date()
        }
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Service request not found' });

    await saveNotification({
      type: 'statusChange',
      title: req.user?.email || addedByEmail || 'admin',
      message: `Service request "${updated.Name}" has been RESOLVED .`,
      recipientType: 'user',
      requestId: updated._id.toString(),
      entityType: 'serviceRequest'
    });

    res.json(updated);
  } catch (err) {
    console.error('Error resolving service request:', err);
    res.status(500).json({ message: err.message });
  }
};




export const ViewServices = async (req, res) => {
  try {
    const serviceRequest = await ServiceRequest.findById(req.params.id);
    if (!serviceRequest) return res.status(404).json({ message: "Service request not found" });

    if (serviceRequest.status === "logged") {
      serviceRequest.status = "opened";
      await serviceRequest.save();
    }

    res.json(serviceRequest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET: All service requests (no filtering by adminName)
export const getAllServiceRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find(); // Fetch all service requests
    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching all service requests:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


// GET: Service requests for a specific user (by adminName)
export const getServiceRequestsByUser = async (req, res) => {
  const { userId } = req.params;
  console.log("Fetching service requests for user ID:", userId);

  try {
    // Find service requests where the adminName matches the userId
    const requests = await ServiceRequest.find({requestId: { $regex: `^${userId}-` }});
    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching user service requests:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


// GET: Get single service request by ID
export const getServiceRequestById = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    res.status(200).json(request);
  } catch (error) {
    console.error("Error fetching request:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const getUserServiceRequests = async (req, res) => {
   try {
    const { emailPrefix } = req.params;

    const serviceRequests = await ServiceRequest.find({
      $or: [
        { createdBy: emailPrefix },
        { createdBy: new RegExp(`^${emailPrefix}$`, 'i') }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json(serviceRequests);
  } catch (error) {
    console.error("❌ Error fetching service requests by creator:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};