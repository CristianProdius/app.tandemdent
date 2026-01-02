import Image from "next/image";
import { redirect } from "next/navigation";

import RegisterForm from "@/components/forms/RegisterForm";
import { getDoctors } from "@/lib/actions/doctor.actions";
import { getPatient, getUser } from "@/lib/actions/patient.actions";

const Register = async ({ params: { userId } }: SearchParamProps) => {
  const [user, patient, doctors] = await Promise.all([
    getUser(userId),
    getPatient(userId),
    getDoctors(),
  ]);

  if (patient) redirect(`/patients/${userId}/new-appointment`);

  return (
    <div className="flex h-screen max-h-screen">
      <section className="remove-scrollbar container">
        <div className="sub-container max-w-[860px] flex-1 flex-col py-10">
          <Image
            src="/assets/icons/logo.png"
            height={1000}
            width={1000}
            alt="Tandem Dent"
            className="mb-12 h-10 w-fit"
          />

          <RegisterForm user={user} doctors={doctors} />

          <p className="copyright py-12">© 2024 Tandem Dent</p>
        </div>
      </section>

      <Image
        src="/assets/images/register-img.png"
        height={1000}
        width={1000}
        alt="patient"
        className="side-img max-w-[390px]"
      />
    </div>
  );
};

export default Register;
