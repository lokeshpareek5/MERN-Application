import React, { useEffect, Fragment } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import Spinner from '../layout/Spinner'
import { getPosts } from '../../actions/post'
import PostItem from './PostItem'
import PostForm from './PostForm'

const Posts = () => {
  const postState = useSelector((state) => state.post)
  const dispatch = useDispatch()

  const { posts, loading } = postState

  useEffect(() => {
    dispatch(getPosts())
  }, [dispatch])

  return loading ? (
    <Spinner />
  ) : (
    <Fragment>
      <h1 className='large text-primary'>Posts</h1>
      <p className='lead'>
        <i className='fas fa-user'></i> Welcome to the community
      </p>
      <PostForm />
      <div className='posts'>
        {posts.map((post) => (
          <PostItem key={post._id} post={post} />
        ))}
      </div>
    </Fragment>
  )
}

export default Posts
