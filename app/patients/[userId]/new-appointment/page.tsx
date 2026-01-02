import Image from "next/image";

import { AppointmentForm } from "@/components/forms/AppointmentForm";
import { getDoctors } from "@/lib/actions/doctor.actions";
import { getPatient } from "@/lib/actions/patient.actions";
import { getServices } from "@/lib/actions/service.actions";

const Appointment = async ({ params: { userId } }: SearchParamProps) => {
  const [patient, doctors, services] = await Promise.all([
    getPatient(userId),
    getDoctors(),
    getServices(),
  ]);

  return (
    <div className="flex h-screen max-h-screen">
      <section className="remove-scrollbar container my-auto">
        <div className="sub-container max-w-[860px] flex-1 justify-between">
          <Image
            src="/assets/icons/logo.png"
            height={1000}
            width={1000}
            alt="Tandem Dent"
            className="mb-12 h-10 w-fit"
          />

          <AppointmentForm
            patientId={patient?.$id}
            userId={userId}
            type="create"
            doctors={doctors}
            services={services}
          />

          <p className="copyright mt-10 py-12">© 2024 Tandem Dent</p>
        </div>
      </section>

      <Image
        src="/assets/images/appointment-img.png"
        height={1500}
        width={1500}
        alt="appointment"
        className="side-img max-w-[390px] bg-bottom"
      />
    </div>
  );
};

export default Appointment;
