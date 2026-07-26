import React, { useState } from 'react'

export default function DukunganPage() {
  const [contacts, setContacts] = useState([
    { name: 'Rian (Sahabat)', type: 'whatsapp', value: '+6281234567890' },
    { name: 'Ibu', type: 'email', value: 'ibu@family.com' }
  ])
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState('email')
  const [newValue, setNewValue] = useState('')
  const [notificationSent, setNotificationSent] = useState(false)

  const addContact = e => {
    e.preventDefault()
    if (!newName || !newValue) return
    setContacts(p => [...p, { name: newName, type: newType, value: newValue }])
    setNewName('')
    setNewValue('')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 lg:px-12 py-8">
      <span className="text-[11px] font-semibold tracking-[0.1em] text-[#ed52cb] uppercase block mb-1">Dukungan Sosial</span>
      <h1 className="text-2xl md:text-3xl font-semibold tracking-[-0.02em] text-[#080808] mb-6">Trusted Circle</h1>

      <div className="border-l-4 border-[#ed52cb] bg-[#fffafc] rounded-r-[8px] p-6">
        <div className="space-y-2 mb-4">
          {contacts.map((c, i) => (
            <div key={i} className="flex justify-between items-center bg-white p-2.5 rounded-[4px] border border-[#d8d8d8] text-xs">
              <div><strong className="text-[#080808]">{c.name}</strong><span className="text-[#898989] ml-2">({c.type})</span></div>
              <span className="font-mono text-[#363636]">{c.value}</span>
            </div>
          ))}
        </div>

        <form onSubmit={addContact} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input type="text" placeholder="Nama" value={newName} onChange={e => setNewName(e.target.value)}
            className="bg-white text-xs text-[#080808] border border-[#d8d8d8] rounded-[4px] px-3 py-2 outline-none focus:border-[#ed52cb]" />
          <select value={newType} onChange={e => setNewType(e.target.value)}
            className="bg-white text-xs text-[#080808] border border-[#d8d8d8] rounded-[4px] px-3 py-2 outline-none focus:border-[#ed52cb]">
            <option value="email">Email</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
          <input type="text" placeholder="Email/WA" value={newValue} onChange={e => setNewValue(e.target.value)}
            className="bg-white text-xs text-[#080808] border border-[#d8d8d8] rounded-[4px] px-3 py-2 outline-none focus:border-[#ed52cb] md:col-span-2" />
          <button type="submit"
            className="bg-[#080808] hover:bg-[#222222] text-white text-xs py-2 px-3 rounded-[4px] cursor-pointer font-medium md:col-span-4">
            Tambah Kontak
          </button>
        </form>

        {notificationSent && (
          <div className="mt-3 p-3 bg-white border border-[#ed52cb] text-[#ed52cb] rounded-[4px] text-xs font-medium">
            Notifikasi terkirim ke Trusted Circle (simulasi)!
          </div>
        )}

        <button onClick={() => setNotificationSent(true)}
          className="mt-4 text-xs bg-[#ed52cb] hover:bg-[#d945b5] text-white py-2 px-4 rounded-[4px] cursor-pointer">
          Kirim Notifikasi Uji Coba
        </button>
      </div>
    </div>
  )
}
