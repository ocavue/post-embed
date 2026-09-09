import type { Post } from '@starter-monorepo/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'

import { useTRPC } from '../client/trpc'

import { RootProvider } from './RootProvider'

function PostList() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const postListQuery = useQuery(trpc.post.list.queryOptions())

  const invalidatePostList = useCallback(async () => {
    const key = trpc.post.list.queryKey()
    await queryClient.invalidateQueries({ queryKey: key })
  }, [trpc, queryClient])

  const postCreateMutation = useMutation(
    trpc.post.create.mutationOptions({
      onSuccess: async () => {
        await invalidatePostList()
      },
      onError: async () => {
        await invalidatePostList()
      },
    }),
  )
  const postDeleteMutation = useMutation(
    trpc.post.delete.mutationOptions({
      onSuccess: async () => {
        await invalidatePostList()
      },
      onError: async () => {
        await invalidatePostList()
      },
    }),
  )

  const posts: Post[] = postListQuery.data || []

  const [newPostTitle, setNewPostTitle] = useState('')

  const handleAddPost = () => {
    if (!newPostTitle.trim()) return
    setNewPostTitle('')
    postCreateMutation.mutate({ title: newPostTitle })
  }

  const handleDeletePost = (id: string) => {
    postDeleteMutation.mutate({ id })
  }

  return (
    <div className="p-6 border border-gray-200 rounded-lg bg-white w-full max-w-md">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Post List</h2>
        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
          {posts?.length} posts
        </span>
      </div>

      {/* Add post form */}
      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newPostTitle}
            onChange={(e) => setNewPostTitle(e.target.value)}
            placeholder="Enter post title"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button
            onClick={handleAddPost}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {/* Post list */}
      {postListQuery.isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No posts available. Add one above!
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
          {posts.map((post) => (
            <li
              key={post.id}
              className="py-3 flex items-center justify-between group"
            >
              <span className="font-medium group-hover:text-blue-600 transition-colors">
                {post.title}
              </span>
              <button
                onClick={() => handleDeletePost(post.id)}
                className="opacity-0 group-hover:opacity-100 px-2 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 transition-all"
                aria-label="Delete post"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function HomePage() {
  return (
    <RootProvider>
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto py-12">
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
          Welcome to Astro with React and tRPC
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          A simple example showing React components with Tailwind CSS in an
          Astro app.
        </p>

        <div className="flex flex-col items-center gap-8 w-full">
          <PostList />

          <a
            href="/about"
            className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Go to About Page
          </a>
        </div>
      </div>
    </RootProvider>
  )
}
