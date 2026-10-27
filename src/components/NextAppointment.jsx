import React from "react";
import { CalendarCheck, ChevronRight } from "lucide-react";

export default function NextAppointment() {
return (
<section className="next-appointment">
<div className="appointment-icon">
<CalendarCheck size={28} />
</div>

  <div className="appointment-info">
    <span className="section-eyebrow">TU PRÓXIMA CITA</span>
    <h2>Medicina General</h2>
    <p>H.I. Aurelio Díaz Ufano y Peral</p>
  </div>

  <div className="appointment-date">
    <strong>10 nov.</strong>
    <span>10:30 a. m.</span>
  </div>

  <ChevronRight size={23} />
</section>

);
}