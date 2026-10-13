import { useState } from 'react'

const shootTypes = ['Outdoor portrait', 'Adventure / travel', 'Print commission', 'Something else']

const documentarySubjects = [
  'Hunting trip',
  'Wildlife behaviour (life of wild animals)',
  'Expedition / trek',
  'Conservation project',
  'Fishing trip',
  'Other (tell me below)',
]

const labelClasses = 'text-[.9rem] text-muted'

function Contact() {
  // The documentary subject list only appears when this is 'yes'.
  // The radios are controlled: React decides which one is checked.
  const [documentary, setDocumentary] = useState('no')
  const [sent, setSent] = useState(false)

  function handleSubmit(event) {
    event.preventDefault() // stop the browser reloading the page
    // BACKEND: read the fields with new FormData(event.currentTarget) and send them to the
    // server here instead of just showing a thank-you.
    setSent(true)
  }

  return (
    <section id="contact" className="px-page py-16">
      <h2 className="section-title text-center">
        Contact
      </h2>
      <p className="-mt-3 mb-8 text-center text-muted">
        Tell me what you have in mind and I'll get back to you within two days.
      </p>

      {sent ? (
        <div className="mx-auto max-w-176 rounded-md border border-border bg-surface px-4 py-10 text-center">
          <p className="mt-0 mb-4">Thank you! Your request is in, and I'll be in touch soon.</p>
          <button
            type="button"
            onClick={() => {
              setSent(false)
              setDocumentary('no')
            }}
            className="cursor-pointer rounded-md border border-border bg-transparent px-4 py-2 text-text hover:border-accent hover:text-accent"
          >
            Send another request
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mx-auto grid max-w-176 grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className={labelClasses}>
              Name
            </label>
            <input type="text" id="name" name="name" required className="field" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className={labelClasses}>
              Email
            </label>
            <input type="email" id="email" name="email" required className="field" />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label htmlFor="shoot" className={labelClasses}>
              Type of shoot
            </label>
            <select id="shoot" name="shoot" className="field">
              {shootTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </div>

          <fieldset className="m-0 min-w-0 rounded-md border border-border p-4 sm:col-span-2">
            <legend className="px-1.5 text-[.9rem] text-muted">Do you need documentary coverage?</legend>
            <div className="flex gap-6">
              <label className="flex cursor-pointer items-center gap-1.5">
                <input
                  type="radio"
                  name="documentary"
                  value="no"
                  checked={documentary === 'no'}
                  onChange={() => setDocumentary('no')}
                  className="accent-accent"
                />
                No
              </label>
              <label className="flex cursor-pointer items-center gap-1.5">
                <input
                  type="radio"
                  name="documentary"
                  value="yes"
                  checked={documentary === 'yes'}
                  onChange={() => setDocumentary('yes')}
                  className="accent-accent"
                />
                Yes
              </label>
            </div>
            {documentary === 'yes' && (
              <div className="mt-4 flex flex-col gap-1.5">
                <label htmlFor="doc-type" className={labelClasses}>
                  Documentary subject
                </label>
                <select id="doc-type" name="doc-type" className="field">
                  {documentarySubjects.map((subject) => (
                    <option key={subject}>{subject}</option>
                  ))}
                </select>
              </div>
            )}
          </fieldset>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label htmlFor="message" className={labelClasses}>
              Message
            </label>
            <textarea id="message" name="message" rows={5} required className="field resize-y" />
          </div>

          <button
            type="submit"
            className="btn-primary justify-self-center sm:col-span-2"
          >
            Send request
          </button>
        </form>
      )}
    </section>
  )
}

export default Contact
