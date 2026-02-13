import { faker } from '@faker-js/faker'

let noteIdCounter = 1

/**
 * Creates a single note with random data
 * @param {Object} overrides - Custom values to override defaults
 * @returns {Object} Note object
 */
export function createNote(overrides = {}) {
  const id = noteIdCounter++

  const defaults = {
    id,
    title: faker.lorem.sentence({ min: 2, max: 6 }),
    content: faker.lorem.paragraphs({ min: 1, max: 3 }),
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    userId: faker.number.int({ min: 1, max: 10 }),
  }

  return { ...defaults, ...overrides }
}

/**
 * Creates multiple notes
 * @param {number} count - Number of notes to create
 * @param {Object} overrides - Base overrides for all notes
 * @returns {Array} Array of note objects
 */
export function createNotes(count, overrides = {}) {
  return Array.from({ length: count }, () => createNote(overrides))
}

/**
 * Reset the ID counter (useful for test isolation)
 */
export function resetNoteIdCounter() {
  noteIdCounter = 1
}
