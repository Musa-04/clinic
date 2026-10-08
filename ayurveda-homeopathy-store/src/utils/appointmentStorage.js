export const APPOINTMENTS_STORAGE_KEY = "maliks_appointments";

const notifyAppointmentChange = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("maliks-appointments-updated"));
  }
};

export const getAppointments = () => {
  const storedAppointments = window.localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
  if (!storedAppointments) return [];

  const appointments = JSON.parse(storedAppointments);
  if (!Array.isArray(appointments)) {
    throw new Error("Saved appointment requests are not in a valid format.");
  }

  return appointments;
};

export const saveAppointment = (appointment) => {
  const appointments = getAppointments();
  const id = globalThis.crypto?.randomUUID?.()
    || `appointment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const savedAppointment = {
    ...appointment,
    id,
    createdAt: new Date().toISOString(),
  };

  window.localStorage.setItem(
    APPOINTMENTS_STORAGE_KEY,
    JSON.stringify([...appointments, savedAppointment]),
  );
  notifyAppointmentChange();
  return savedAppointment;
};
