'use client'
import AdminLayout from '@/components/admin/AdminLayout'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchMessages, toggleMessageRead, deleteMessage } from '@/lib/api'
import { Mail, MailOpen, Trash2, Calendar, User, Tag } from 'lucide-react'
import toast from 'react-hot-toast'
import { useState } from 'react'

interface Message {
  id: number
  name: string
  email: string
  subject: string | null
  message: string
  read: boolean
  created_at: string
}

const SUBJECT_LABELS: Record<string, string> = {
  partnership: 'Partnership Enquiry',
  volunteering: 'Volunteering',
  donation: 'Donation',
  scholarship: 'Scholarship Enquiry',
  general: 'General Enquiry',
}

export default function MessagesPage() {
  const qc = useQueryClient()
  const [selected, setSelected] = useState<Message | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ['messages'],
    queryFn: fetchMessages,
  })

  const toggleRead = useMutation({
    mutationFn: (id: number) => toggleMessageRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['messages'] }),
  })

  const remove = useMutation({
    mutationFn: (id: number) => deleteMessage(id),
    onSuccess: (_, id) => {
      if (selected?.id === id) setSelected(null)
      qc.invalidateQueries({ queryKey: ['messages'] })
      toast.success('Message deleted.')
    },
  })

  const handleOpen = (msg: Message) => {
    setSelected(msg)
    if (!msg.read) toggleRead.mutate(msg.id)
  }

  const displayed = filter === 'unread' ? messages.filter((m) => !m.read) : messages
  const unreadCount = messages.filter((m) => !m.read).length

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-[var(--navy)]">Messages</h2>
            <p className="text-gray-500 text-sm mt-1">
              {unreadCount > 0
                ? `${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}`
                : 'All messages read'}
            </p>
          </div>
          <div className="flex gap-2">
            {(['all', 'unread'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  filter === f
                    ? 'bg-[var(--navy)] text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-[var(--gold)]'
                }`}
              >
                {f === 'all' ? `All (${messages.length})` : `Unread (${unreadCount})`}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-gray-400">Loading messages...</div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <Mail size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-semibold">
              {filter === 'unread' ? 'No unread messages' : 'No messages yet'}
            </p>
            <p className="text-gray-400 text-sm mt-1">Messages from the contact form will appear here.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Message list */}
            <div className="lg:col-span-2 space-y-2">
              {displayed.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => handleOpen(msg)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selected?.id === msg.id
                      ? 'border-[var(--gold)] bg-[var(--gold-pale)] shadow-sm'
                      : msg.read
                      ? 'border-gray-100 bg-white hover:border-gray-200'
                      : 'border-blue-100 bg-blue-50 hover:border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {msg.read
                        ? <MailOpen size={15} className="text-gray-400 shrink-0" />
                        : <Mail size={15} className="text-blue-500 shrink-0" />}
                      <span className={`text-sm truncate ${msg.read ? 'font-medium text-gray-700' : 'font-bold text-[var(--navy)]'}`}>
                        {msg.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 shrink-0">
                      {new Date(msg.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 truncate pl-5">
                    {msg.subject ? SUBJECT_LABELS[msg.subject] || msg.subject : msg.message}
                  </p>
                </button>
              ))}
            </div>

            {/* Message detail */}
            <div className="lg:col-span-3">
              {selected ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                  {/* Detail header */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-black text-[var(--navy)]">
                        {selected.subject ? SUBJECT_LABELS[selected.subject] || selected.subject : 'Message'}
                      </h3>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => toggleRead.mutate(selected.id)}
                        title={selected.read ? 'Mark as unread' : 'Mark as read'}
                        className="p-2 rounded-lg border border-gray-200 hover:border-[var(--gold)] hover:bg-[var(--gold-pale)] transition-all"
                      >
                        {selected.read
                          ? <Mail size={16} className="text-gray-500" />
                          : <MailOpen size={16} className="text-gray-500" />}
                      </button>
                      <button
                        onClick={() => remove.mutate(selected.id)}
                        title="Delete message"
                        className="p-2 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all"
                      >
                        <Trash2 size={16} className="text-red-400" />
                      </button>
                    </div>
                  </div>

                  {/* Sender info */}
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                      <User size={14} className="text-[var(--gold)]" />
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">From</p>
                        <p className="text-sm font-semibold text-[var(--navy)]">{selected.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl sm:col-span-2">
                      <Mail size={14} className="text-[var(--gold)]" />
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">Email</p>
                        <a
                          href={`mailto:${selected.email}`}
                          className="text-sm font-semibold text-[var(--navy)] hover:text-[var(--gold)] truncate block"
                        >
                          {selected.email}
                        </a>
                      </div>
                    </div>
                    {selected.subject && (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                        <Tag size={14} className="text-[var(--gold)]" />
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Subject</p>
                          <p className="text-sm font-semibold text-[var(--navy)]">
                            {SUBJECT_LABELS[selected.subject] || selected.subject}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                      <Calendar size={14} className="text-[var(--gold)]" />
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">Received</p>
                        <p className="text-sm font-semibold text-[var(--navy)]">
                          {new Date(selected.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'long', year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Message body */}
                  <div className="bg-gray-50 rounded-xl p-5">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                  </div>

                  {/* Reply button */}
                  <a
                    href={`mailto:${selected.email}?subject=Re: ${selected.subject ? (SUBJECT_LABELS[selected.subject] || selected.subject) : 'Your message'}`}
                    className="inline-flex items-center gap-2 btn-primary px-5 py-2.5 rounded-xl text-sm font-bold"
                  >
                    <Mail size={15} />
                    Reply via Email
                  </a>
                </div>
              ) : (
                <div className="h-full min-h-[300px] bg-white rounded-2xl border border-gray-100 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <MailOpen size={36} className="mx-auto mb-3 opacity-40" />
                    <p className="text-sm">Select a message to read</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
