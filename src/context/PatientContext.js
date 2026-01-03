import { createContext, useEffect, useState } from "react";

export const PatientContext = createContext();

export function PatientProvider({ children }) {
  const [patients, setPatients] = useState([]);

  /* 🔄 Load from localStorage */
  useEffect(() => {
    const storedPatients = JSON.parse(localStorage.getItem("patients"));
    if (storedPatients) {
      setPatients(storedPatients);
    }
  }, []);

  /* 💾 Save any change */
  useEffect(() => {
    localStorage.setItem("patients", JSON.stringify(patients));
  }, [patients]);

  /* ➕ Add Patient (Doctor) */
  const addPatient = (patient) => {
    setPatients((prev) => [...prev, patient]);
  };

  /* 💊 Add NEW Prescription (Doctor) */
  const addPrescription = (nationalId, prescription) => {
    setPatients((prev) =>
      prev.map((p) =>
        p.nationalId === nationalId
          ? {
              ...p,
              prescriptions: [...(p.prescriptions || []), prescription],
            }
          : p
      )
    );
  };

  /* ♻️ Update EXISTING Prescription
     (Patient uploads / Pharmacist dispense) */
  const updatePrescription = (nationalId, updatedPrescription) => {
    setPatients((prev) =>
      prev.map((p) =>
        p.nationalId === nationalId
          ? {
              ...p,
              prescriptions: p.prescriptions.map((pr) =>
                pr.id === updatedPrescription.id
                  ? updatedPrescription
                  : pr
              ),
            }
          : p
      )
    );
  };

  return (
    <PatientContext.Provider
      value={{
        patients,
        addPatient,
        addPrescription,
        updatePrescription, // ✅ مهم
      }}
    >
      {children}
    </PatientContext.Provider>
  );
}
