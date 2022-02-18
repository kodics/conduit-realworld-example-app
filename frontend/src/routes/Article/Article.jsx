import axios from "axios";
import { useEffect, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import ArticleMeta from "../../components/ArticleMeta";
import ArticleTags from "../../components/ArticleTags";
import BannerContainer from "../../components/BannerContainer";
import {
  ArticleButtons,
  FavButton,
  FollowButton,
} from "../../components/Buttons";
import { useAuth } from "../../helpers/AuthContextProvider";
import useAxios from "../../hooks/useAxios";

export default function Article() {
  const [article, setArticle] = useState({});
  const { title, body, tagList } = article || {};
  const { headerToken, isAuth } = useAuth();
  const { slug } = useParams();

  const { data, loading } = useAxios({
    url: `api/articles/${slug}`,
    headers: headerToken,
  });

  useEffect(() => {
    setArticle(data.article);
  }, [data, isAuth]);

  return (
    !loading && (
      <div className="article-page">
        <BannerContainer>
          <h1>{title}</h1>
          <ArticleMeta article={article}>
            <ArticlesButtons article={article} setArticle={setArticle} />
          </ArticleMeta>
        </BannerContainer>

        <div className="container page">
          <div className="row article-content">
            <div className="col-md-12">
              <p>{body}</p>
              <ArticleTags tagList={tagList} />
            </div>
          </div>

          <hr />

          <div className="article-actions">
            <ArticleMeta article={article}>
              <ArticlesButtons article={article} setArticle={setArticle} />
            </ArticleMeta>
          </div>

          <div className="row">
            <div className="col-xs-12 col-md-8 offset-md-2">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    )
  );
}

function ArticlesButtons({ article, setArticle }) {
  const { author: { username, following } = {}, author } = article || {};
  const { headerToken, isAuth, loggedUser } = useAuth();
  const navigate = useNavigate();
  const { slug } = useParams();

  const deleteArticle = () => {
    const confirmation = window.confirm("Want to delete the article?");

    if (isAuth) {
      if (!confirmation) return;

      axios({
        url: `api/articles/${slug}/`,
        method: "DELETE",
        headers: headerToken,
      }).then((res) => {
        navigate("/");
      });
    } else alert("You need to login first");
  };

  const followHandler = () => {
    if (isAuth) {
      axios({
        url: `api/profiles/${username}/follow`,
        method: following ? "DELETE" : "POST",
        headers: headerToken,
      }).then((res) => {
        setArticle({ ...article, author: res.data.profile });
      });
    } else alert("You need to login first");
  };

  const handleFav = ({ favorited }) => {
    axios({
      url: `api/articles/${slug}/favorite`,
      method: favorited ? "DELETE" : "POST",
      headers: headerToken,
    }).then((res) => {
      if (res.data.errors) return console.log(res.data.errors.body);

      setArticle(res.data.article);
    });
  };

  return (
    // TODO: if username's are undefined, then is still truthy
    <>
      {loggedUser.username === username ? (
        <ArticleButtons handler={deleteArticle} slug={slug} />
      ) : (
        <FollowButton author={author} handler={followHandler} />
      )}
      <FavButton article={article} handler={handleFav} text="Favorite" />
    </>
  );
}