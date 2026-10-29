// Shown instead of a page that is only for signed-in users
function SignInPrompt({ title, message, onSignIn }) {
  return (
    <section className="px-page py-16">
      <h1 className="section-title">{title}</h1>
      <p className="text-muted">{message}</p>
      <button type="button" onClick={onSignIn} className="btn-primary">Sign in</button>
    </section>
  )
}

export default SignInPrompt
