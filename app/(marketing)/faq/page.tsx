const QUESTIONS = [
  {
    question: 'What is Mode?',
    answer:
      'Mode is an issue tracker for small teams, with a list view, a drag-and-drop board, search and filters.',
  },
  {
    question: 'How do I create an account?',
    answer:
      'Choose Sign up in the top navigation and enter an email address and password.',
  },
  {
    question: 'Who can change an issue?',
    answer:
      'Only the person who created an issue can edit or delete it. The person assigned to it can also move it between columns on the board.',
  },
  {
    question: 'Can I share a filtered view?',
    answer:
      'Yes. Search terms and filters are stored in the URL, so you can copy the link and send it to a teammate.',
  },
  {
    question: 'Is there a way to use it without a mouse?',
    answer:
      'Yes. Press ? anywhere on the dashboard to see the keyboard shortcuts. On the board, focus a card’s handle and use the left and right arrow keys to move it.',
  },
  {
    question: 'What is it built with?',
    answer:
      'Next.js 16, React 19, TypeScript, Tailwind CSS, Drizzle ORM and PostgreSQL on Neon.',
  },
]

export default function FAQPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Frequently Asked Questions
      </h1>
      <dl className="space-y-6">
        {QUESTIONS.map(({ question, answer }) => (
          <div key={question}>
            <dt className="text-lg font-semibold mb-2">{question}</dt>
            <dd className="text-gray-600 dark:text-gray-300">{answer}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
