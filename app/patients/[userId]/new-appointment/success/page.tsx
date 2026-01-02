import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getAppointment } from "@/lib/actions/appointment.actions";
import { formatDateTime } from "@/lib/utils";

const RequestSuccess = async ({
  searchParams,
  params: { userId },
}: SearchParamProps) => {
  const appointmentId = (searchParams?.appointmentId as string) || "";
  const appointment = await getAppointment(appointmentId);

  const doctorName = appointment.primaryPhysician || "Necunoscut";
  const doctorInitial = doctorName.charAt(0);

  return (
    <div className=" flex h-screen max-h-screen px-[5%]">
      <div className="success-img">
        <Link href="/">
          <Image
            src="/assets/icons/logo.png"
            height={1000}
            width={1000}
            alt="Tandem Dent"
            className="h-10 w-fit"
          />
        </Link>

        <section className="flex flex-col items-center">
          <Image
            src="/assets/gifs/success.gif"
            height={300}
            width={280}
            alt="success"
          />
          <h2 className="header mb-6 max-w-[600px] text-center">
            <span className="text-gold-500">Cererea de programare</span> a fost
            trimisă cu succes!
          </h2>
          <p>Vă vom contacta în curând pentru confirmare.</p>
        </section>

        <section className="request-details">
          <p>Detaliile programării solicitate: </p>
          <div className="flex items-center gap-3">
            <div className="flex size-6 items-center justify-center rounded-full bg-gold-100 text-xs font-medium text-gold-700">
              {doctorInitial}
            </div>
            <p className="whitespace-nowrap">Dr. {doctorName}</p>
          </div>
          <div className="flex gap-2">
            <Image
              src="/assets/icons/calendar.svg"
              height={24}
              width={24}
              alt="calendar"
            />
            <p> {formatDateTime(appointment.schedule).dateTime}</p>
          </div>
        </section>

        <Button variant="outline" className="shad-primary-btn" asChild>
          <Link href={`/patients/${userId}/new-appointment`}>
            Programare nouă
          </Link>
        </Button>

        <p className="copyright">© 2024 Tandem Dent</p>
      </div>
    </div>
  );
};

export default RequestSuccess;
