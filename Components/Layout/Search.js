import axios from "axios";
import { List, Image, Search } from "semantic-ui-react";
import cookie from "js-cookie";
import Router from "next/router";
import { useState, useEffect } from "react";
import baseUrl from "../../utils/baseUrl";
let cancel;

function SearchComponent() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const changeHandler = async (e) => {
    const { value } = e.target;
    setText(value);
    if (value.length === 0) return;
    if (value.trim().length === 0) return;

    setLoading(true);

    try {
      cancel && cancel();
      const CancelToken = axios.CancelToken;

      const token = cookie.get("token");
      const res = await axios.get(`${baseUrl}/api/search/${value}`, {
        headers: { Authorization: token },
        cancelToken: new CancelToken((cancler) => {
          cancel = cancler;
        }),
      });

      if (res.data.length === 0) {
        results.length > 0 && setResults([]);

        return setLoading(false);
      }

      setResults(res.data);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (text.length === 0 && loading) setLoading(false);
  }, [text]);

  return (
    <Search
      onBlur={() => {
        results.length > 0 && setResults([]);
        loading && setLoading(false);
        setText("");
      }}
      loading={loading}
      value={text}
      resultRenderer={ResultRenderer}
      results={results}
      onSearchChange={changeHandler}
      minCharacters={1}
      onResultSelect={(e, data) => Router.push(`/${data.results.username}`)}
    />
  );
}

const ResultRenderer = ({ _id, name, profilePicUrl }) => {
  return (
    <List key={_id}>
      <List.Item>
        <Image src={profilePicUrl} alt="profile pic" avatar />
        <List.Content header={name} as="a" />
      </List.Item>
    </List>
  );
};
export default SearchComponent;
