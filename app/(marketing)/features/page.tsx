const FEATURES = [
  {
    title: 'Drag-and-drop board',
    description:
      'Move issues between columns and see the change instantly, by mouse, touch or keyboard.',
  },
  {
    title: 'Search and filters',
    description:
      'Search by text and filter by status, priority or assignee. Filters live in the URL, so any view can be shared.',
  },
  {
    title: 'Assignees',
    description:
      'Assign an issue to a teammate and see at a glance who is working on what.',
  },
  {
    title: 'Clear ownership',
    description:
      'Only the person who created an issue can edit or delete it. The assignee can move it along the board.',
  },
  {
    title: 'Keyboard shortcuts',
    description:
      'Create, search and switch views without touching the mouse. Press ? to see them all.',
  },
  {
    title: 'Dark mode',
    description:
      'Follows your system setting by default, with a toggle that remembers your choice.',
  },
]

export default function FeaturesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Features</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Everything you need to track work, and nothing you don&apos;t.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="bg-white dark:bg-dark-high p-6 rounded-lg shadow-sm border border-gray-200 dark:border-dark-border-default"
          >
            <h2 className="text-xl font-semibold mb-2">{feature.title}</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
