import React from 'react';
import { PhoneCall, ShieldAlert, HeartPulse, Info, Building2, Phone } from 'lucide-react';
import { EmergencyContact } from '../types';

interface EmergencyContactsProps {
  contacts: EmergencyContact[];
  destination: string;
}

export const EmergencyContacts: React.FC<EmergencyContactsProps> = ({ contacts, destination }) => {
  return (
    <div className="p-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-red-200/50 dark:border-red-900/40 shadow-md">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="p-2.5 rounded-xl bg-red-500/10 text-red-500">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Local Emergency & Safety Hotline
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Essential contact numbers for {destination}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {contacts.map((contact, i) => (
          <div
            key={i}
            className="p-3.5 bg-red-50/40 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/30 flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                {contact.type}
              </span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                {contact.name}
              </h4>
              {contact.notes && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {contact.notes}
                </p>
              )}
            </div>

            <a
              href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}
              className="mt-3 py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call {contact.phone}</span>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
