import { removeFromArray, sleep } from '@starter-monorepo/utils'
import { v4 as uuidv4 } from 'uuid'

import type { Post, User } from './types'

const users: User[] = [
  { id: '1', name: 'John Doe' },
  { id: '2', name: 'Jane Doe' },
]

const posts: Post[] = [
  { id: '1', title: 'Post 1' },
  { id: '2', title: 'Post 2' },
]

async function fakeDelay() {
  await sleep(200)
}

// A fake database instance
export const db = {
  user: {
    findMany: async (): Promise<User[]> => {
      await fakeDelay()
      return users
    },
    findById: async (id: string): Promise<User | undefined> => {
      await fakeDelay()
      return users.find((user) => user.id === id)
    },
    create: async ({ name }: { name: string }): Promise<User> => {
      await fakeDelay()
      const user: User = { id: uuidv4(), name }
      users.push(user)
      return user
    },
    delete: async (id: string): Promise<boolean> => {
      await fakeDelay()
      const removed = removeFromArray(users, (user) => user.id === id)
      return !!removed
    },
  },
  post: {
    findMany: async (): Promise<Post[]> => {
      await fakeDelay()
      return posts
    },
    findById: async (id: string): Promise<Post | undefined> => {
      await fakeDelay()
      return posts.find((post) => post.id === id)
    },
    create: async ({ title }: { title: string }): Promise<Post> => {
      await fakeDelay()
      const post: Post = { id: uuidv4(), title }
      posts.push(post)
      return post
    },
    delete: async (id: string): Promise<boolean> => {
      await fakeDelay()
      const removed = removeFromArray(posts, (post) => post.id === id)
      return !!removed
    },
  },
}
