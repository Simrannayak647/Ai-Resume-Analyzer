import React from "react";
import { Users, Mail, Phone, Globe } from "lucide-react";

function ContactInfo({ contactInfo }) {
  if (!contactInfo || Object.keys(contactInfo).length === 0) return null;

  const contactItems = [
    { key: "email", icon: Mail, label: "Email", color: "blue" },
    { key: "phone", icon: Phone, label: "Phone", color: "green" },
    { key: "linkedin", icon: Globe, label: "LinkedIn", color: "blue" }
  ].filter(item => contactInfo[item.key]);

  return (
    <div className="bg-gradient-to-r from-white to-blue-50 rounded-2xl shadow-xl p-6 border border-blue-100">
      <div className="flex items-center mb-6">
        <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl">
          <Users className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 ml-4">
          Contact Information
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {contactItems.map((item) => (
          <div
            key={item.key}
            className={`flex items-center p-4 bg-gradient-to-r from-${item.color}-50 to-${item.color}-50 rounded-xl border border-${item.color}-100 hover:shadow-md transition-shadow duration-300`}
          >
            <item.icon className={`w-5 h-5 text-${item.color}-600 mr-3`} />
            <div>
              <p className="text-sm text-gray-500 font-medium">{item.label}</p>
              <p className="font-semibold text-gray-900 truncate">{contactInfo[item.key]}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ContactInfo;