/* eslint-disable react/no-array-index-key */
import React from 'react';
import { Link } from 'react-router-dom';


const PostListItem = (props) => {
  const route = `/jobposts/${props.post._id}`;
  return (
    <div className="postListItem" key={props.post.id}>
      <Link to={route} key={props.post.id} className="link">
        <h1>{props.post.title}</h1>
      </Link>
    </div>
  );
};

export default PostListItem;
