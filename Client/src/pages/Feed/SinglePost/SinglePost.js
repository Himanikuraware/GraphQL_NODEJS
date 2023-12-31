import React, { useEffect, useState } from "react";

import Image from "../../../components/Image/Image";
import "./SinglePost.css";

const SinglePost = (props) => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [date, setDate] = useState("");
  const [image, setImage] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    const postId = props.match.params.postId;
    const fetchPost = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/feed/post/" + postId,
          {
            headers: {
              Authorization: props.token,
            },
          }
        );
        if (response.status !== 200) {
          throw new Error("Failed to fetch post.");
        }
        const resData = await response.json();
        setTitle(resData.post.title);
        setAuthor(resData.post.creator.name);
        setImage("http://localhost:8080/" + resData.post.imageUrl);
        setDate(new Date(resData.post.createdAt).toLocaleDateString("en-US"));
        setContent(resData.post.content);
      } catch (err) {
        console.log(err);
      }
    };
    fetchPost();
  }, []);

  return (
    <section className="single-post">
      <h1>{title}</h1>
      <h2>
        Created by {author} on {date}
      </h2>
      <div className="single-post__image">
        <Image contain imageUrl={image} />
      </div>
      <p>{content}</p>
    </section>
  );
};

// class SinglePost extends Component {
//   state = {
//     title: "",
//     author: "",
//     date: "",
//     image: "",
//     content: "",
//   };

//   componentDidMount() {
//     const postId = this.props.match.params.postId;
//     fetch("http://localhost:8080/feed/post/" + postId, {
//       headers: {
//         Authorization: this.props.token,
//       },
//     })
//       .then((res) => {
//         if (res.status !== 200) {
//           throw new Error("Failed to fetch status");
//         }
//         return res.json();
//       })
//       .then((resData) => {
//         this.setState({
//           title: resData.post.title,
//           author: resData.post.creator.name,
//           image: "http://localhost:8080/" + resData.post.imageUrl,
//           date: new Date(resData.post.createdAt).toLocaleDateString("en-US"),
//           content: resData.post.content,
//         });
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }

//   render() {
//     return (
//       <section className="single-post">
//         <h1>{this.state.title}</h1>
//         <h2>
//           Created by {this.state.author} on {this.state.date}
//         </h2>
//         <div className="single-post__image">
//           <Image contain imageUrl={this.state.image} />
//         </div>
//         <p>{this.state.content}</p>
//       </section>
//     );
//   }
// }

export default SinglePost;
