export const APPOINTMENTS_STORAGE_KEY = "maliks_appointments";

const notifyAppointmentChange = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("maliks-appointments-updated"));
  }
};

export const INITIAL_SEED_APPOINTMENTS = [
  {
    id: "APT-2026-001",
    fullName: "Ramesh Chandra Gupta",
    phone: "+91 98112 34567",
    email: "ramesh.gupta@gmail.com",
    doctor: "Dr. Mozim Malik (Homeopath)",
    concern: "Chronic Joint Pain & Knee Stiffness",
    preferredDate: "2026-10-14",
    message: "Suffering from severe knee pain while climbing stairs for 3 months.",
    status: "PENDING",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
    attendedAt: null,
    notes: "",
  },
  {
    id: "APT-2026-002",
    fullName: "Sunita Sharma",
    phone: "+91 98765 12340",
    email: "sunita.sharma@yahoo.co.in",
    doctor: "Dr. Ayesha Khan (Ayurvedic Specialist)",
    concern: "Skin Allergy, Rashes & Itching",
    preferredDate: "2026-10-15",
    message: "Seasonal itching and skin flare-ups. Need natural homeopathic care.",
    status: "PENDING",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(), // 12 hours ago
    attendedAt: null,
    notes: "",
  },
  {
    id: "APT-2026-003",
    fullName: "Karan Malhotra",
    phone: "+91 99201 98765",
    email: "karan.malhotra@outlook.com",
    doctor: "Dr. Mozim Malik (Homeopath)",
    concern: "Severe Acid Reflux & Gut Bloating",
    preferredDate: "2026-10-10",
    message: "Frequent bloating after meals, need digestive consultation.",
    status: "ATTENDED",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    attendedAt: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
    notes: "Patient consulted in clinic. Prescribed Herbal Digestive drops. Follow-up after 15 days.",
  },
];

export const seedDefaultAppointments = () => {
  try {
    window.localStorage.setItem(
      APPOINTMENTS_STORAGE_KEY,
      JSON.stringify(INITIAL_SEED_APPOINTMENTS),
    );
    notifyAppointmentChange();
  } catch (err) {
    console.warn("Could not seed appointments to localStorage", err);
  }
  return INITIAL_SEED_APPOINTMENTS;
};

export const getAppointments = () => {
  if (typeof window === "undefined") return INITIAL_SEED_APPOINTMENTS;
  const storedAppointments = window.localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
  if (!storedAppointments) {
    return seedDefaultAppointments();
  }

  try {
    const appointments = JSON.parse(storedAppointments);
    if (!Array.isArray(appointments) || appointments.length === 0) {
      return seedDefaultAppointments();
    }
    return appointments.map((apt) => ({
      ...apt,
      status: apt.status || (apt.attendedAt ? "ATTENDED" : "PENDING"),
    }));
  } catch {
    return seedDefaultAppointments();
  }
};

export const saveAppointment = (appointment) => {
  const appointments = getAppointments();
  const id = `APT-${Date.now().toString().slice(-4)}-${Math.floor(100 + Math.random() * 900)}`;
  const savedAppointment = {
    ...appointment,
    id,
    status: "PENDING",
    attendedAt: null,
    notes: "",
    createdAt: new Date().toISOString(),
  };

  window.localStorage.setItem(
    APPOINTMENTS_STORAGE_KEY,
    JSON.stringify([savedAppointment, ...appointments]),
  );
  notifyAppointmentChange();
  return savedAppointment;
};

export const updateAppointmentStatus = (id, nextStatus, notes = "") => {
  const appointments = getAppointments();
  const index = appointments.findIndex((apt) => apt.id === id);
  if (index === -1) return null;

  const current = appointments[index];
  const isAttended = nextStatus === "ATTENDED";
  const updated = {
    ...current,
    status: nextStatus,
    attendedAt: isAttended ? current.attendedAt || new Date().toISOString() : null,
    notes: notes !== undefined ? notes : current.notes,
    updatedAt: new Date().toISOString(),
  };

  appointments[index] = updated;
  window.localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments));
  notifyAppointmentChange();
  return updated;
};

export const deleteAppointment = (id) => {
  const appointments = getAppointments();
  const filtered = appointments.filter((apt) => apt.id !== id);
  window.localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(filtered));
  notifyAppointmentChange();
  return true;
};
