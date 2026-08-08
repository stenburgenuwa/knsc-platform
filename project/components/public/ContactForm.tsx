'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    setStatus('sending');
    setMessage(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok || !body.success) throw new Error(body.error || 'Could not send your message.');
      setStatus('sent');
      setMessage('Thank you — your message has reached the league office.');
      form.reset();
    } catch (err: any) {
      setStatus('error');
      setMessage(err?.message || 'Could not send your message. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card elev-sm" noValidate={false}>
      <h2 className="card-title">Send a message</h2>

      <div className="field">
        <label htmlFor="c-name">Your name</label>
        <input id="c-name" name="name" className="input" required autoComplete="name" />
      </div>
      <div className="field">
        <label htmlFor="c-email">Email address</label>
        <input id="c-email" name="email" type="email" className="input" required autoComplete="email" />
      </div>
      <div className="field">
        <label htmlFor="c-subject">Subject</label>
        <input id="c-subject" name="subject" className="input" />
      </div>
      <div className="field">
        <label htmlFor="c-message">Message</label>
        <textarea id="c-message" name="message" className="input" required rows={5} />
      </div>

      <button type="submit" className="btn btn-primary btn-block" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Send message'}
      </button>

      {message && (
        <p
          className="card-meta"
          role="status"
          aria-live="polite"
          style={status === 'error' ? { color: 'var(--color-accent-800)' } : undefined}
        >
          {message}
        </p>
      )}
    </form>
  );
}
