import React, { useState, useEffect, Fragment } from "react";

import Post from "../../components/Feed/Post/Post";
import Button from "../../components/Button/Button";
import FeedEdit from "../../components/Feed/FeedEdit/FeedEdit";
import Input from "../../components/Form/Input/Input";
import Paginator from "../../components/Paginator/Paginator";
import Loader from "../../components/Loader/Loader";
import ErrorHandler from "../../components/ErrorHandler/ErrorHandler";
import "./Feed.css";

const Feed = (props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [editPost, setEditPost] = useState(null);
  const [status, setStatus] = useState("");
  const [postPage, setPostPage] = useState(1);
  const [postsLoading, setPostsLoading] = useState(true);
  const [editLoading, setEditLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("URL");
        if (response.status !== 200) {
          throw new Error("Failed to fetch user status.");
        }
        const resData = await response.json();
        setStatus(resData.status);
      } catch (err) {
        catchError(err);
      }
    };

    fetchStatus();
    loadPosts();
  }, []);

  const loadPosts = async (direction) => {
    if (direction) {
      setPostsLoading(true);
      setPosts([]);
    }

    let page = postPage;
    if (direction === "next") {
      page++;
      setPostPage(page);
    }
    if (direction === "previous") {
      page--;
      setPostPage(page);
    }

    try {
      const graphqlQuery = {
        query: `
        { 
          getPosts(page: ${page}) {
          posts {
            _id
            title
            content
            creator {
              name
            }
            createdAt
          }
          totalPosts
        }}`,
      };
      const response = await fetch(`http://localhost:8080/graphql`, {
        method: "POST",
        headers: {
          Authorization: props.token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(graphqlQuery),
      });

      const resData = await response.json();
      if (resData.errors) {
        throw new Error("Fetching posts failed.");
      }

      const updatedPosts = resData.data.getPosts.posts.map((post) => {
        return {
          ...post,
          imagePath: post.imageUrl,
        };
      });

      setPosts(updatedPosts);
      setTotalPosts(resData.data.getPosts.totalPosts);
      setPostsLoading(false);
    } catch (err) {
      catchError(err);
    }
  };

  const statusUpdateHandler = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch("URL");
      if (response.status !== 200 && response.status !== 201) {
        throw new Error("Can't update status!");
      }

      const resData = await response.json();
      console.log(resData);
    } catch (err) {
      catchError(err);
    }
  };

  const newPostHandler = () => {
    setIsEditing(true);
  };

  const startEditPostHandler = (postId) => {
    const loadedPost = posts.find((p) => p._id === postId);
    setEditPost(loadedPost);
    setIsEditing(true);
  };

  const cancelEditHandler = () => {
    setIsEditing(false);
    setEditPost(null);
  };

  const finishEditHandler = async (postData) => {
    setEditLoading(true);
    const formData = new FormData();
    formData.append("title", postData.title);
    formData.append("content", postData.content);
    formData.append("image", postData.image);

    let graphqlQuery = {
      query: `
      mutation {
        createPost(postInput: {title: "${postData.title}", content: "${postData.content}", imageUrl: "somestring"}) {
          _id
          title
          content
          imageUrl
          creator {
            name
          }
          createdAt
        }
      }
      `,
    };

    try {
      const response = await fetch("http://localhost:8080/graphql", {
        method: "POST",
        body: JSON.stringify(graphqlQuery),
        headers: {
          Authorization: props.token,
          "Content-Type": "application/json",
        },
      });
      const resData = await response.json();
      if (resData.errors && resData.errors[0].status === 422) {
        throw new Error("Validation failed!");
      }
      if (resData.errors) {
        throw new Error("User login failed.");
      }
      const post = {
        _id: resData.data.createPost._id,
        title: resData.data.createPost.title,
        content: resData.data.createPost.content,
        creator: resData.data.createPost.creator,
        createdAt: resData.data.createPost.createdAt,
      };
      this.setState((prevState) => {
        let updatedPosts = [...prevState.posts];
        if (prevState.editPost) {
          const postIndex = prevState.posts.findIndex(
            (p) => p._id === prevState.editPost._id
          );
          updatedPosts[postIndex] = post;
        } else {
          updatedPosts.unshift(post);
        }
        return {
          posts: updatedPosts,
          isEditing: false,
          editPost: null,
          editLoading: false,
        };
      });
      setPosts((prevPosts) => {
        let updatedPosts = [...prevPosts];

        if (editPost) {
          const postIndex = prevPosts.findIndex((p) => p._id === editPost._id);

          if (postIndex !== -1) {
            updatedPosts[postIndex] = post;
          } else {
            updatedPosts.unshift(post);
          }
        } else {
          updatedPosts.pop();
          updatedPosts.unshift(post);
        }

        return updatedPosts;
      });

      setIsEditing(false);
      setEditPost(null);
      setEditLoading(false);
    } catch (err) {
      console.log(err);
      setIsEditing(false);
      setEditPost(null);
      setEditLoading(false);
      catchError(err);
    }
  };

  const statusInputChangeHandler = (input, value) => {
    setStatus(value);
  };

  const deletePostHandler = async (postId) => {
    setPostsLoading(true);

    try {
      const response = await fetch(
        `http://localhost:8080/feed/post/${postId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: props.token,
          },
        }
      );

      if (response.status !== 200 && response.status !== 201) {
        throw new Error("Deleting a post failed!");
      }

      const resData = await response.json();
      loadPosts();
      setPostsLoading(false);
      console.log(resData);
    } catch (err) {
      console.log(err);
      setPostsLoading(false);
    }
  };

  const errorHandler = () => {
    setError(null);
  };

  const catchError = (error) => {
    setError(error);
  };

  return (
    <Fragment>
      <ErrorHandler error={error} onHandle={errorHandler} />
      <FeedEdit
        editing={isEditing}
        selectedPost={editPost}
        loading={editLoading}
        onCancelEdit={cancelEditHandler}
        onFinishEdit={finishEditHandler}
      />
      <section className="feed__status">
        <form onSubmit={statusUpdateHandler}>
          <Input
            type="text"
            placeholder="Your status"
            control="input"
            onChange={(value) => statusInputChangeHandler("status", value)}
            value={status}
          />
          <Button mode="flat" type="submit">
            Update
          </Button>
        </form>
      </section>
      <section className="feed__control">
        <Button mode="raised" design="accent" onClick={newPostHandler}>
          New Post
        </Button>
      </section>
      <section className="feed">
        {postsLoading && (
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <Loader />
          </div>
        )}
        {posts.length <= 0 && !postsLoading ? (
          <p style={{ textAlign: "center" }}>No posts found.</p>
        ) : null}
        {!postsLoading && (
          <Paginator
            onPrevious={() => loadPosts("previous")}
            onNext={() => loadPosts("next")}
            lastPage={Math.ceil(totalPosts / 2)}
            currentPage={postPage}
          >
            {posts.map((post) => (
              <Post
                key={post._id}
                id={post._id}
                author={post.creator.name}
                date={new Date(post.createdAt).toLocaleDateString("en-US")}
                title={post.title}
                image={post.imageUrl}
                content={post.content}
                onStartEdit={() => startEditPostHandler(post._id)}
                onDelete={() => deletePostHandler(post._id)}
              />
            ))}
          </Paginator>
        )}
      </section>
    </Fragment>
  );
};

export default Feed;
