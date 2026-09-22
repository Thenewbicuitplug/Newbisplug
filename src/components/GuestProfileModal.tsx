import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { X, User, MapPin, Phone, Mail, Sparkles, Check, Trash2 } from 'lucide-react';

interface GuestProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  guestProfile: UserProfile | null;
  onSaveProfile: (profile: UserProfile) => void;
  onClearProfile: () => void;
}

export const GuestProfileModal: React.FC<GuestProfileModalProps> = ({
  isOpen,
  onClose,
  guestProfile,
  onSaveProfile,
  onClearProfile,
}) => {
  const [name, setName] = useState(guestProfile?.name || '');
  const [email, setEmail] = useState(guestProfile?.email || '');
  const [phone, setPhone] = useState(guestProfile?.phone || '');
  const [address, setAddress] = useState(guestProfile?.address || '');
  const [suburb, setSuburb] = useState(guestProfile?.suburb || 'Richmond Hill');
  const [city, setCity] = useState(guestProfile?.city || 'Port Elizabeth');
  const [postalCode, setPostalCode] = useState(guestProfile?.postalCode || '6001');

  useEffect(() => {
    if (guestProfile) {
      setName(guestProfile.name || '');
      setEmail(guestProfile.email || '');
      setPhone(guestProfile.phone || '');
      setAddress(guestProfile.address || '');
      setSuburb(guestProfile.suburb || 'Richmond Hill');
      setCity(guestProfile.city || 'Port Elizabeth');
      setPostalCode(guestProfile.postalCode || '6001');
    }
  }, [guestProfile]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSaveProfile({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      suburb: suburb.trim(),
      city: city.trim(),
      postalCode: postalCode.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-pink-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-fun text-lg font-bold text-stone-900">Sweet Tooth Profile</h3>
            <p className="text-xs text-stone-500">Save your Port Elizabeth delivery details for faster checkout</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Your Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sindi Ndlovu"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 focus:bg-white focus:outline-none focus:border-pink-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sindi@example.co.za"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 focus:bg-white focus:outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Mobile (WhatsApp)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="082 123 4567"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 focus:bg-white focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Street Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 14 Stanley Street"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 focus:bg-white focus:outline-none focus:border-pink-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Suburb</label>
              <input
                type="text"
                value={suburb}
                onChange={(e) => setSuburb(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-2 text-stone-800 focus:bg-white focus:outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-2 text-stone-800 focus:bg-white focus:outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Postal Code</label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-2 text-stone-800 focus:bg-white focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-stone-100 gap-2">
            {guestProfile ? (
              <button
                type="button"
                onClick={() => {
                  onClearProfile();
                  onClose();
                }}
                className="text-stone-400 hover:text-red-500 text-xs font-semibold flex items-center gap-1 p-2 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Profile</span>
              </button>
            ) : <span />}

            <button
              type="submit"
              className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Details</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
